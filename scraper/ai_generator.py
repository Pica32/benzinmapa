"""
ai_generator.py — AI generace článků pomocí xAI Grok nebo OpenRouter

Funkce:
1. Podpora xAI Grok API (primární) a OpenRouter (fallback)
2. Vylepšený systémový prompt pro SEO/LLMO
3. Rozšířený výstupní formát (slug, keywords, entities, tags)
4. Robustní validace a sanitizace
5. Retry logika s exponenciálním backoffem
"""

import json
import re
import time
import unicodedata
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup

from config import (
    # AI Provider selection
    AI_PROVIDER, USE_AI, REQUIRE_AI_FOR_PUBLISH,
    AI_DELAY_SEC, AI_TIMEOUT_SEC, AI_MAX_RETRIES, GEMINI_DELAY_SEC,
    # Gemini config
    GEMINI_API_KEYS, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_API_URL,
    # xAI config
    XAI_API_URL, XAI_MODEL, XAI_API_KEY,
    # OpenRouter config
    OPENROUTER_URL, OPENROUTER_MODEL, OPENROUTER_API_KEYS,
    # Common
    USER_AGENT, SITE_URL, SITE_NAME,
    ALLOWED_HTML_TAGS, ALLOWED_HTML_ATTRS,
    TARGET_REGION, REGION_CONTEXT,
)
from helpers import now_str, truncate, html_to_text, clean_html


# =====================================================
# GLOBÁLNÍ STAV
# =====================================================
CURRENT_KEY_INDEX = 0
CURRENT_GEMINI_KEY_INDEX = 0
AI_DISABLED_THIS_RUN = False


def reset_ai_state():
    """Reset AI stavu pro nový běh."""
    global AI_DISABLED_THIS_RUN, CURRENT_KEY_INDEX, CURRENT_GEMINI_KEY_INDEX
    AI_DISABLED_THIS_RUN = False
    CURRENT_KEY_INDEX = 0
    CURRENT_GEMINI_KEY_INDEX = 0


def get_gemini_key() -> Optional[str]:
    """Získá další API klíč (rotace) pro Gemini."""
    global CURRENT_GEMINI_KEY_INDEX
    if not GEMINI_API_KEYS:
        return None
    key = GEMINI_API_KEYS[CURRENT_GEMINI_KEY_INDEX]
    CURRENT_GEMINI_KEY_INDEX = (CURRENT_GEMINI_KEY_INDEX + 1) % len(GEMINI_API_KEYS)
    return key


def get_openrouter_key() -> Optional[str]:
    """Získá další API klíč (rotace) pro OpenRouter."""
    global CURRENT_KEY_INDEX
    if not OPENROUTER_API_KEYS:
        return None
    key = OPENROUTER_API_KEYS[CURRENT_KEY_INDEX]
    CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(OPENROUTER_API_KEYS)
    return key


# =====================================================
# xAI GROK API VOLÁNÍ
# =====================================================
def xai_call(
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
) -> Optional[str]:
    """
    Zavolá xAI Grok API s retry logikou.
    
    Returns:
        Response content nebo None při chybě.
    """
    global AI_DISABLED_THIS_RUN
    
    if AI_DISABLED_THIS_RUN:
        return None
    
    if not USE_AI or not XAI_API_KEY:
        AI_DISABLED_THIS_RUN = True
        print(f"[{now_str()}] AI zakázána (chybí XAI_API_KEY).")
        return None
    
    payload = {
        "model": XAI_MODEL,
        "messages": messages,
        "temperature": float(temperature),
    }
    
    for attempt in range(AI_MAX_RETRIES):
        try:
            if attempt > 0:
                time.sleep(AI_DELAY_SEC)
            
            headers = {
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            }
            
            r = requests.post(
                XAI_API_URL,
                headers=headers,
                json=payload,
                timeout=AI_TIMEOUT_SEC,
            )
            
            if r.status_code == 401:
                print(f"[{now_str()}] xAI 401 (neplatný API klíč)")
                AI_DISABLED_THIS_RUN = True
                return None
            
            if r.status_code == 402:
                print(f"[{now_str()}] xAI 402 (vyčerpán kredit)")
                AI_DISABLED_THIS_RUN = True
                return None
            
            if r.status_code in (429, 500, 502, 503, 504):
                ra = r.headers.get("Retry-After")
                if ra and ra.isdigit():
                    wait = int(ra)
                else:
                    wait = int(AI_DELAY_SEC * (2 ** attempt))
                print(f"[{now_str()}] xAI {r.status_code} (čekám {wait}s, pokus {attempt + 1}/{AI_MAX_RETRIES})")
                time.sleep(wait)
                continue
            
            r.raise_for_status()
            data = r.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            
            if isinstance(content, str) and content.strip():
                time.sleep(AI_DELAY_SEC)
                return content.strip()
        
        except requests.exceptions.Timeout:
            print(f"[{now_str()}] xAI timeout (pokus {attempt + 1}/{AI_MAX_RETRIES})")
        except requests.exceptions.RequestException as e:
            print(f"[{now_str()}] xAI chyba: {e}")
        except Exception as e:
            print(f"[{now_str()}] xAI výjimka: {e}")
    
    AI_DISABLED_THIS_RUN = True
    print(f"[{now_str()}] xAI opakovaně selhalo. AI zakázána pro tento běh.")
    return None


# =====================================================
# JSON EXTRACTION
# =====================================================
def extract_json_object(text: str) -> Optional[str]:
    """
    Vytáhne první JSON objekt z textu (když model přidá text kolem).
    Robustní handling markdown a neúplných odpovědí.
    """
    if not text:
        return None
    
    s = text.strip()
    
    # KROK 1: Odstraň markdown backticks
    # Gemini vrací: ```json\n{...}\n``` nebo ```\n{...}\n```
    if "```" in s:
        # Odstraň všechny markdown bloky
        import re
        # Najdi obsah mezi ``` a ```
        match = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', s)
        if match:
            s = match.group(1).strip()
        else:
            # Fallback: odstraň ``` manuálně
            lines = s.split('\n')
            clean_lines = []
            in_code_block = False
            for line in lines:
                if line.strip().startswith('```'):
                    in_code_block = not in_code_block
                    continue
                if in_code_block or not line.strip().startswith('```'):
                    clean_lines.append(line)
            s = '\n'.join(clean_lines).strip()
    
    # KROK 2: Najdi JSON objekt pomocí vyvážených závorek
    start = s.find("{")
    if start < 0:
        return None
    
    depth = 0
    in_string = False
    escape_next = False
    
    for i in range(start, len(s)):
        ch = s[i]
        
        if escape_next:
            escape_next = False
            continue
        
        if ch == '\\':
            escape_next = True
            continue
        
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        
        if in_string:
            continue
        
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return s[start:i + 1]
    
    # KROK 3: Pokud jsme nenašli uzavřený JSON, zkus opravit
    # Možná chybí koncová }
    if depth > 0:
        # Přidej chybějící závorky
        result = s[start:] + ("}" * depth)
        return result
    
    return None


# =====================================================
# HTML SANITIZACE
# =====================================================
def sanitize_html(html: str) -> str:
    """
    Sanitizuje HTML - povolí pouze whitelist tagy a atributy.
    Odstraní nebezpečný obsah.
    """
    if not html:
        return ""
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Odstranit nebezpečné tagy
    for tag in soup.find_all(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input']):
        tag.decompose()
    
    # Projít všechny tagy
    for tag in soup.find_all(True):
        tag_name = tag.name.lower()
        
        # Pokud tag není v whitelistu, nahradíme ho jeho obsahem
        if tag_name not in ALLOWED_HTML_TAGS:
            tag.unwrap()
            continue
        
        # Odstranit nepovolené atributy
        allowed_attrs = ALLOWED_HTML_ATTRS.get(tag_name, [])
        attrs_to_remove = [attr for attr in tag.attrs if attr not in allowed_attrs]
        for attr in attrs_to_remove:
            del tag[attr]
        
        # Sanitizace href u odkazů
        if tag_name == 'a' and tag.get('href'):
            href = tag['href']
            # Povolit pouze http(s) a relativní odkazy
            if not (href.startswith('http://') or href.startswith('https://') or href.startswith('/')):
                if not href.startswith('mailto:'):
                    tag['href'] = '#'
            # Přidat bezpečnostní atributy pro externí odkazy
            if href.startswith('http') and SITE_URL not in href:
                tag['rel'] = 'nofollow noopener'
                tag['target'] = '_blank'
    
    return str(soup)


def generate_slug(text: str, add_timestamp: bool = True) -> str:
    """
    Generuje URL-friendly slug z textu optimalizovaný pro SEO.
    Bez diakritiky, lowercase, pomlčky místo mezer.
    Přidává krátký timestamp pro unikátnost.
    
    Příklad: "Bitcoin ETF přiliv 14 miliard" -> "bitcoin-etf-priliv-14-miliard-0119"
    """
    import time
    from datetime import datetime
    
    # Odstranění diakritiky
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Lowercase
    text = text.lower()
    
    # Nahrazení ne-alfanumerických znaků pomlčkami
    text = re.sub(r'[^a-z0-9]+', '-', text)
    
    # Odstranění počátečních/koncových pomlček
    text = text.strip('-')
    
    # Odstranění duplicitních pomlček
    text = re.sub(r'-+', '-', text)
    
    # Omezení délky (max 50 znaků pro slug, nechám místo pro timestamp)
    if len(text) > 50:
        text = text[:50].rsplit('-', 1)[0]
    
    # Přidání krátkého timestampu pro unikátnost (MMDD-HH)
    if add_timestamp:
        ts = datetime.now().strftime("%m%d-%H%M")
        text = f"{text}-{ts}"
    
    return text


def generate_seo_slug(title: str, keywords: List[str] = None) -> str:
    """
    Generuje SEO optimalizovaný slug z titulku a klíčových slov.
    
    Příklad: "Bitcoin překonal 100 000 dolarů" + ["bitcoin", "cena"]
             -> "bitcoin-prekonal-100000-dolaru-cena-0119"
    """
    # Základní slug z titulku
    base = generate_slug(title, add_timestamp=False)
    
    # Pokud máme klíčová slova a nejsou v titulku, přidej první
    if keywords:
        for kw in keywords[:2]:
            kw_slug = generate_slug(kw, add_timestamp=False)
            if kw_slug and kw_slug not in base and len(kw_slug) > 2:
                base = f"{base}-{kw_slug}"
                break
    
    # Omezení délky
    if len(base) > 55:
        base = base[:55].rsplit('-', 1)[0]
    
    # Přidání timestampu
    from datetime import datetime
    ts = datetime.now().strftime("%m%d%H%M")
    return f"{base}-{ts}"


# =====================================================
# OPENROUTER API VOLÁNÍ (fallback)
# =====================================================
def openrouter_call(
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
) -> Optional[str]:
    """
    Zavolá OpenRouter API s retry logikou a rotací klíčů.
    
    Returns:
        Response content nebo None při chybě.
    """
    global AI_DISABLED_THIS_RUN
    
    if AI_DISABLED_THIS_RUN:
        return None
    
    if not USE_AI or not OPENROUTER_API_KEYS:
        AI_DISABLED_THIS_RUN = True
        print(f"[{now_str()}] AI zakázána (chybí OPENROUTER_API_KEYS).")
        return None
    
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": float(temperature),
    }
    
    for attempt in range(AI_MAX_RETRIES):
        try:
            if attempt > 0:
                time.sleep(AI_DELAY_SEC)
            
            api_key = get_openrouter_key()
            if not api_key:
                AI_DISABLED_THIS_RUN = True
                return None
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                "HTTP-Referer": SITE_URL,
                "X-Title": "benzinmapa-news-bot",
            }
            
            r = requests.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
                timeout=AI_TIMEOUT_SEC,
            )
            
            if r.status_code == 401:
                print(f"[{now_str()}] OpenRouter 401 (špatný klíč?) -> zkouším další")
                continue
            
            if r.status_code == 402:
                print(f"[{now_str()}] OpenRouter 402 (vyčerpán kredit) -> zkouším další")
                continue
            
            if r.status_code in (429, 500, 502, 503, 504):
                ra = r.headers.get("Retry-After")
                if ra and ra.isdigit():
                    wait = int(ra)
                else:
                    # Exponenciální backoff: 60, 120, 240, 480... sekund
                    wait = int(AI_DELAY_SEC * (2 ** attempt))
                    # Pro 429 min 60s, max 10 minut
                    if r.status_code == 429:
                        wait = max(60, min(wait, 600))
                print(f"[{now_str()}] OpenRouter {r.status_code} (čekám {wait}s, pokus {attempt + 1}/{AI_MAX_RETRIES})")
                time.sleep(wait)
                continue
            
            r.raise_for_status()
            data = r.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            
            if isinstance(content, str) and content.strip():
                time.sleep(AI_DELAY_SEC)
                return content.strip()
        
        except requests.exceptions.Timeout:
            print(f"[{now_str()}] OpenRouter timeout (pokus {attempt + 1}/{AI_MAX_RETRIES})")
        except requests.exceptions.RequestException as e:
            print(f"[{now_str()}] OpenRouter chyba: {e}")
        except Exception as e:
            print(f"[{now_str()}] OpenRouter výjimka: {e}")
    
    AI_DISABLED_THIS_RUN = True
    print(f"[{now_str()}] OpenRouter opakovaně selhal. AI zakázána pro tento běh.")
    return None


# =====================================================
# GOOGLE GEMINI API VOLÁNÍ (DOPORUČENO)
# =====================================================
def gemini_call(
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
) -> Optional[str]:
    """
    Zavolá Google Gemini API s rotací klíčů.
    Rychlé, spolehlivé, bez přísných rate limitů.
    
    Returns:
        Response content nebo None při chybě.
    """
    global AI_DISABLED_THIS_RUN
    
    if AI_DISABLED_THIS_RUN:
        return None
    
    if not GEMINI_API_KEYS:
        print(f"[{now_str()}] Gemini: chybí API klíče")
        return None
    
    # Převod messages na Gemini formát
    # Gemini používá "contents" s "parts"
    system_instruction = ""
    contents = []
    
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        
        if role == "system":
            system_instruction = content
        elif role == "user":
            contents.append({
                "role": "user",
                "parts": [{"text": content}]
            })
        elif role == "assistant":
            contents.append({
                "role": "model",
                "parts": [{"text": content}]
            })
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 4096,
            "topP": 0.95,
        }
    }
    
    # Přidání system instruction pokud existuje
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
    
    for attempt in range(AI_MAX_RETRIES):
        try:
            # Rotace klíčů při každém pokusu
            api_key = get_gemini_key()
            if not api_key:
                print(f"[{now_str()}] Gemini: žádný API klíč")
                return None
            
            url = f"{GEMINI_API_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"
            
            r = requests.post(
                url,
                headers={
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=AI_TIMEOUT_SEC,
            )
            
            if r.status_code == 400:
                error_data = r.json()
                error_msg = error_data.get("error", {}).get("message", "Unknown error")
                print(f"[{now_str()}] Gemini 400: {error_msg}")
                return None
            
            if r.status_code == 403:
                print(f"[{now_str()}] Gemini 403 (klíč {api_key[:10]}... neplatný, zkouším další)")
                continue  # Zkus další klíč
            
            if r.status_code == 429:
                wait = min(15 * (attempt + 1), 60)  # Kratší čekání díky rotaci
                print(f"[{now_str()}] Gemini 429 (rate limit klíče {api_key[:10]}..., čekám {wait}s, zkouším další)")
                time.sleep(wait)
                continue  # Zkus další klíč
            
            if r.status_code >= 500:
                wait = 10 * (attempt + 1)
                print(f"[{now_str()}] Gemini {r.status_code} (server error, čekám {wait}s)")
                time.sleep(wait)
                continue
            
            r.raise_for_status()
            data = r.json()
            
            # Extrakce odpovědi z Gemini formátu
            candidates = data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    text = parts[0].get("text", "")
                    if text.strip():
                        print(f"[{now_str()}] Gemini OK, pauza {GEMINI_DELAY_SEC}s...")
                        time.sleep(GEMINI_DELAY_SEC)  # Pauza mezi requesty
                        return text.strip()
            
            print(f"[{now_str()}] Gemini: prázdná odpověď")
            return None
            
        except requests.exceptions.Timeout:
            print(f"[{now_str()}] Gemini timeout (pokus {attempt + 1}/{AI_MAX_RETRIES})")
        except requests.exceptions.RequestException as e:
            print(f"[{now_str()}] Gemini chyba: {e}")
        except Exception as e:
            print(f"[{now_str()}] Gemini výjimka: {e}")
    
    print(f"[{now_str()}] Gemini opakovaně selhal.")
    return None


# =====================================================
# UNIVERZÁLNÍ AI VOLÁNÍ
# =====================================================
def ai_call(
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
) -> Optional[str]:
    """
    Zavolá AI API podle konfigurace (Gemini, xAI nebo OpenRouter).
    
    Pořadí: gemini > xai > openrouter
    
    Returns:
        Response content nebo None při chybě.
    """
    if AI_PROVIDER == "gemini":
        result = gemini_call(messages, temperature)
        if result:
            return result
        # Fallback na OpenRouter pokud Gemini selže
        print(f"[{now_str()}] Gemini selhal, zkouším OpenRouter jako fallback...")
        return openrouter_call(messages, temperature)
    elif AI_PROVIDER == "xai":
        return xai_call(messages, temperature)
    else:
        return openrouter_call(messages, temperature)


# =====================================================
# MARKET CONTEXT
# =====================================================
def get_fear_greed() -> Optional[Tuple[str, str]]:
    """Získá aktuální Fear & Greed Index."""
    try:
        r = requests.get(
            "https://api.alternative.me/fng/?limit=1&format=json",
            timeout=15,
            headers={"User-Agent": USER_AGENT},
        )
        r.raise_for_status()
        data = r.json()
        v = str(data["data"][0]["value"])
        c = str(data["data"][0]["value_classification"])
        return v, c
    except Exception:
        return None


def build_context_block() -> str:
    """Sestaví kontextový blok pro AI prompt."""
    parts = []
    
    # Fear & Greed
    fg = get_fear_greed()
    if fg:
        v, c = fg
        parts.append(f"Fear & Greed Index: {v} ({c})")
    
    # Regionální kontext
    region_hint = REGION_CONTEXT.get(TARGET_REGION, REGION_CONTEXT.get("GLOBAL", ""))
    parts.append(f"Region: {TARGET_REGION} - {region_hint}")
    
    return " | ".join(parts) if parts else "Bez dodatečného kontextu."


# =====================================================
# AI DATACLASS
# =====================================================
@dataclass
class AIArticleResult:
    """Výsledek AI generace článku."""
    success: bool
    seo_title: str
    meta_description: str
    perex: str
    body_html: str
    slug: str = ""
    primary_keyword: str = ""
    secondary_keywords: List[str] = None
    entities: List[str] = None
    tags: List[str] = None
    category: str = "Kryptoměny"
    error_reason: str = ""
    
    def __post_init__(self):
        if self.secondary_keywords is None:
            self.secondary_keywords = []
        if self.entities is None:
            self.entities = []
        if self.tags is None:
            self.tags = []


# =====================================================
# HLAVNÍ AI GENERACE
# =====================================================
def generate_article(
    source_title: str,
    source_summary_html: str,
    source_url: str,
    published_at: str,
    context_block: str,
    importance_hint: str,
) -> AIArticleResult:
    """
    Generuje článek pomocí AI.
    
    Returns:
        AIArticleResult s úspěchem nebo fallback hodnotami
    """
    global AI_DISABLED_THIS_RUN
    
    # Fallback hodnoty
    fallback_body = clean_html(source_summary_html) + (
        f'<p><small>Zdroj: <a href="{source_url}" rel="nofollow noopener" target="_blank">{source_url}</a></small></p>'
    )
    fallback_plain = html_to_text(fallback_body)
    fallback_seo_title = truncate(source_title.strip(), 60)
    fallback_meta = truncate(fallback_plain, 160)
    fallback_perex = truncate(fallback_plain, 220)
    fallback_slug = generate_slug(source_title)
    
    fallback = AIArticleResult(
        success=False,
        seo_title=fallback_seo_title,
        meta_description=fallback_meta,
        perex=fallback_perex,
        body_html=fallback_body,
        slug=fallback_slug,
        error_reason="AI nedostupná nebo zakázána",
    )
    
    # Kontrola dostupnosti AI
    ai_available = False
    if AI_PROVIDER == "gemini":
        ai_available = USE_AI and bool(GEMINI_API_KEYS)
    elif AI_PROVIDER == "xai":
        ai_available = USE_AI and bool(XAI_API_KEY)
    else:
        ai_available = USE_AI and bool(OPENROUTER_API_KEYS)
    
    if not ai_available or AI_DISABLED_THIS_RUN:
        print(f"[{now_str()}] AI nedostupná -> {source_url}")
        return fallback
    
    summary_plain = truncate(html_to_text(source_summary_html or ""), 1000)  # Zkráceno z 1800
    
    # AUTORSKÝ STYL + SEO/GEO OPTIMALIZOVANÝ PROMPT – BenzinMapa.cz
    import random
    partner_links = [
        '<a href="https://bitcoinchurch.cz" rel="noopener" target="_blank">BitcoinChurch.cz</a>',
        '<a href="https://pergol.cz" rel="noopener" target="_blank">Pergol.cz</a>',
        '<a href="https://combie.cz" rel="noopener" target="_blank">Combie.cz</a>',
        '<a href="https://nadace.online" rel="noopener" target="_blank">Nadace.online</a>',
    ]
    # Náhodně zvolíme 1–2 partnerské odkazy pro přirozené prolinkování
    chosen_partners = random.sample(partner_links, k=random.randint(1, 2))
    partner_hint = (
        f"PARTNERSKÉ PROLINKOVÁNÍ: Na konci nebo v kontextu článku přirozeně zakomponuj odkaz(y): "
        + ", ".join(chosen_partners)
        + ". Odkaz musí dávat kontextový smysl – ne jako reklama, ale jako přirozená zmínka."
    )

    system = f"""Jsi zkušený český motoristický novinář a analytik cen paliv pro {SITE_NAME}.

AUTORSKÝ STYL – NEPOZNÁŠ AI (přísná pravidla):
- Piš jako skutečný novinář s 15 lety praxe v motorizmu, NE jako chatbot
- ABSOLUTNĚ ZAKÁZANÉ fráze: "v dnešní době", "je důležité", "je třeba poznamenat", "bezpochyby", "nesporně", "samozřejmě", "v neposlední řadě", "je nutné zdůraznit"
- Střídej délky vět dramaticky – jedna slova. Jiná rozvitá souvětí s vedlejší větou, čárkami a kontextem.
- Přidej osobní postřeh, vtip nebo ironii ("Jako by OPEC četl naše bankovní výpisy...")
- Konkrétní srovnání: "před rokem litr nafty stál 38,90 Kč, dnes 42,30 Kč – řidič s 60l nádrží zaplatí o 204 Kč víc"
- Alespoň jeden konkrétní případ: řidič pendler, majitel dodávky, zemědělec s traktorem...

DÉLKA A HLOUBKA:
- Minimálně 600 slov (více = lepší pro SEO)
- Každý <h2> musí mít aspoň 2 odstavce pod sebou
- Zahrň data/statistiky – procenta, Kč, barrely, nebo odkaz na zdroj
- Přidej tabulku nebo seznam (ul/ol) tam kde to sedí

SEO OPTIMALIZACE – CÍL: 1. MÍSTO VE GOOGLE:
- Primární kw přirozeně v 1. větě, v 1. <h2> a ještě 2× v textu
- Synonyma: benzín/Natural 95/pohonné hmoty, nafta/diesel/motorová nafta, čerpačka/pumpa/benzinová stanice
- <h2> nadpisy jako otázky (pro featured snippets): "Proč nafta zdražuje?", "Kdy bude benzín levnější?"
- Interní kontext ČR: ČESMAD, MPO, ČNB, spotřební daň na PHM, euro palivo
- Lokalizace: Praha, Brno, Ostrava – zmiň konkrétní města

GEO TARGETING (Česko):
- {REGION_CONTEXT.get(TARGET_REGION, '')}
- Ceny vždy v Kč/l (NIKDY v EUR bez přepočtu)

STRUKTURA body_html (min 600 slov):
<p><strong>PRIMÁRNÍ KW v první větě – hlavní sdělení. Fakta.</strong> 3–4 věty kontextu.</p>
<h2>Co se přesně stalo a proč?</h2>
<p>Konkrétní příčiny: ropa Brent, OPEC, kurz, spotřební daň. Čísla.</p>
<p>Příběh: jak to vnímá konkrétní řidič.</p>
<h2>Kolik zaplatíme za tankování v ČR?</h2>
<p>Výpočet: průměrná nádrž 55 l × cena = Kč. Srovnání s minulým měsícem/rokem.</p>
<ul><li>Natural 95: X Kč/l</li><li>Nafta: Y Kč/l</li><li>LPG: Z Kč/l</li></ul>
<h2>Kde natankovat nejlevněji?</h2>
<p>Typy stanic, tipy, zmínka <a href="https://benzinmapa.cz">BenzinMapa.cz</a> jako nástroj pro hledání nejlevnějšího benzínu.</p>
<h2>Co sledovat – výhled cen paliv</h2>
<p>Klíčové faktory, predikce, termíny pro změnu cen.</p>
<p>{partner_hint}</p>

ANTIDETEKČNÍ PRAVIDLA:
- Každý článek musí mít unikátní úvodní větu – NIKDY nezačínaj slovem "V poslední době"
- Aspoň jeden odstavec musí být vtipný/ironický (přirozeně)
- Různá délka odstavců: 1 věta, pak 4 věty, pak 2 věty – ne monotónní bloky
- Zahrň přímou řeč nebo hypotetickou citaci řidiče nebo analytika

VÝSTUP: Pouze čistý JSON. Žádný text mimo JSON. Žádné backticks.
"""

    user = f"""ZPRÁVA K ANALÝZE:
Titulek: {source_title}
Obsah: {summary_plain}
Zdroj: {source_url}
Čas: {published_at}
Kontext trhu: {context_block}

ÚKOL: Napiš komplexní autorský článek v češtině (min 600 slov) jako zkušený motoristický novinář.
Článek musí být nerozeznatelný od textu lidského autora. Zahrň partnerský odkaz přirozeně.

JSON výstup (ŽÁDNÝ jiný text):
{{
  "seo_title": "titulek max 62 znaků – primární kw (benzín/nafta/cena) na začátku",
  "meta_description": "155-160 znaků – konkrétní čísla + proč číst + výzva",
  "perex": "200-260 znaků – hlavní sdělení + praktický dopad + čísla",
  "body_html": "autorský článek min 600 slov v HTML dle struktury – s partnerským odkazem",
  "slug": "seo-slug-bez-diakritiky-s-klicovym-slovem",
  "primary_keyword": "hlavní kw česky",
  "secondary_keywords": ["cena benzínu", "čerpací stanice", "pohonné hmoty ČR", "Natural 95 dnes", "nafta cena"],
  "entities": ["Benzina ORLEN", "MOL", "OPEC", "ČNB", "další zmíněné"],
  "tags": ["benzín", "nafta", "ceny paliv", "tankování", "ČR"],
  "category": "Ceny paliv"
}}"""

    out = ai_call(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.2,
    )
    
    if not out:
        print(f"[{now_str()}] AI: žádný výstup -> {source_url}")
        fallback.error_reason = "AI nevrátila žádný výstup"
        return fallback
    
    # Robustní JSON parse
    try:
        # KROK 1: Odstraň markdown backticks přímo
        clean_out = out.strip()
        if clean_out.startswith("```"):
            # Odstraň první řádek (```json nebo ```)
            lines = clean_out.split("\n", 1)
            if len(lines) > 1:
                clean_out = lines[1]
            # Odstraň koncové ```
            if clean_out.rstrip().endswith("```"):
                clean_out = clean_out.rstrip()[:-3].rstrip()
        
        # KROK 2: Extrahuj JSON objekt
        js = extract_json_object(clean_out)
        if not js:
            # Fallback: zkus přímo parsovat vyčištěný výstup
            js = clean_out.strip()
        
        data = json.loads(js)
        
        # Extrakce a validace polí
        seo_title = truncate(str(data.get("seo_title", "")).strip(), 60)
        meta_desc = truncate(str(data.get("meta_description", "")).strip(), 180)
        perex = truncate(str(data.get("perex", "")).strip(), 280)
        body_html = str(data.get("body_html", "")).strip()
        slug = str(data.get("slug", "")).strip() or generate_slug(seo_title)
        primary_kw = str(data.get("primary_keyword", "")).strip()
        secondary_kw = data.get("secondary_keywords", [])
        entities = data.get("entities", [])
        tags = data.get("tags", [])
        category = str(data.get("category", "Ceny paliv")).strip()
        
        # Validace povinných polí
        if len(seo_title) < 10:
            fallback.error_reason = "Titulek příliš krátký"
            print(f"[{now_str()}] AI: titulek příliš krátký -> {source_url}")
            return fallback
        
        if len(meta_desc) < 50:
            fallback.error_reason = "Meta popis příliš krátký"
            print(f"[{now_str()}] AI: meta popis příliš krátký -> {source_url}")
            return fallback
        
        if len(perex) < 50:
            fallback.error_reason = "Perex příliš krátký"
            print(f"[{now_str()}] AI: perex příliš krátký -> {source_url}")
            return fallback
        
        if len(body_html) < 200:
            fallback.error_reason = "Tělo článku příliš krátké"
            print(f"[{now_str()}] AI: tělo příliš krátké -> {source_url}")
            return fallback
        
        # Bezpečnostní kontroly
        if "<script" in body_html.lower() or "javascript:" in body_html.lower():
            fallback.error_reason = "Detekován nebezpečný obsah"
            print(f"[{now_str()}] AI: detekován script -> {source_url}")
            return fallback
        
        # Sanitizace HTML
        body_html = sanitize_html(body_html)
        
        # Přidání odkazu na zdroj, pokud chybí
        if source_url and source_url not in body_html:
            body_html += f'\n<h2>Zdroj</h2>\n<p><a href="{source_url}" rel="nofollow noopener" target="_blank">Původní článek</a></p>'
        
        # Normalizace seznamů
        if not isinstance(secondary_kw, list):
            secondary_kw = [str(secondary_kw)] if secondary_kw else []
        if not isinstance(entities, list):
            entities = [str(entities)] if entities else []
        if not isinstance(tags, list):
            tags = [str(tags)] if tags else []
        
        return AIArticleResult(
            success=True,
            seo_title=seo_title,
            meta_description=meta_desc,
            perex=perex,
            body_html=body_html,
            slug=slug,
            primary_keyword=primary_kw,
            secondary_keywords=[str(k) for k in secondary_kw[:10]],
            entities=[str(e) for e in entities[:15]],
            tags=[str(t) for t in tags[:10]],
            category=category,
        )
    
    except json.JSONDecodeError as e:
        print(f"[{now_str()}] AI: JSON parse error -> {source_url} | err={e}")
        print(f"[{now_str()}] AI raw output (first 500 chars): {out[:500]!r}")
        fallback.error_reason = f"JSON parse error: {e}"
        return fallback
    
    except Exception as e:
        print(f"[{now_str()}] AI: neočekávaná chyba -> {source_url} | err={e}")
        fallback.error_reason = f"Neočekávaná chyba: {e}"
        return fallback


# =====================================================
# LEGACY WRAPPER (zpětná kompatibilita)
# =====================================================
def ai_generate_cz_article_and_seo(
    source_title: str,
    source_summary_html: str,
    source_url: str,
    published_at: str,
    context_block: str,
    importance_hint: str,
) -> Tuple[bool, str, str, str, str]:
    """
    Legacy wrapper pro zpětnou kompatibilitu.
    
    Returns:
        (ai_ok, seo_title, meta_description, perex, body_html)
    """
    result = generate_article(
        source_title=source_title,
        source_summary_html=source_summary_html,
        source_url=source_url,
        published_at=published_at,
        context_block=context_block,
        importance_hint=importance_hint,
    )
    
    return (
        result.success,
        result.seo_title,
        result.meta_description,
        result.perex,
        result.body_html,
    )
