"""
helpers.py — Sdílené utility funkce

Obsahuje:
- Časové funkce
- Textové transformace
- HTML utility
- Souborové operace
"""

import os
import re
import hashlib
from datetime import datetime, timezone
from typing import Optional

from bs4 import BeautifulSoup

from config import CZ_TZ, NEWS_BASE_URL, OUT_DIR


# =====================================================
# ČASOVÉ FUNKCE
# =====================================================
def now_str() -> str:
    """Vrátí aktuální čas jako řetězec pro logy."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def now_iso() -> str:
    """Vrátí aktuální čas v ISO formátu."""
    return datetime.now(CZ_TZ).isoformat()


def parse_entry_time(entry) -> str:
    """
    Parsuje čas z RSS entry.
    Vrací formátovaný string pro CZ locale.
    ZMĚNA: Nyní vrací AKTUÁLNÍ čas (čas nahrání na web).
    """
    # Vždy použij aktuální čas = čas publikace na našem webu
    dt = datetime.now(CZ_TZ)
    return dt.strftime("%d. %m. %Y %H:%M")


def parse_cz_datetime(date_str: str) -> Optional[datetime]:
    """
    Parsuje český formát data.
    Podporuje: "01. 01. 2025 12:00" nebo "2025-01-01 12:00:00"
    """
    formats = [
        "%d. %m. %Y %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M:%S",
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.replace(tzinfo=CZ_TZ)
        except ValueError:
            continue
    
    return None


# =====================================================
# TEXTOVÉ TRANSFORMACE
# =====================================================
def normalize_title(title: str) -> str:
    """Normalizuje titulek - trim, single spaces."""
    t = (title or "").strip()
    t = re.sub(r"\s+", " ", t)
    return t


def truncate(s: str, limit: int) -> str:
    """Zkrátí string na limit znaků s elipsou."""
    s = (s or "").strip()
    if len(s) <= limit:
        return s
    return s[: max(0, limit - 1)].rstrip() + "…"


def strip_html_tags(html: str) -> str:
    """Odstraní všechny HTML tagy."""
    return re.sub(r'<[^>]+>', '', html or '')


# =====================================================
# HTML UTILITY
# =====================================================
def html_to_text(html: str) -> str:
    """Extrahuje čistý text z HTML."""
    soup = BeautifulSoup(html or "", "html.parser")
    return " ".join(soup.get_text(" ", strip=True).split())


def clean_html(summary_html: str) -> str:
    """
    Vyčistí HTML - odstraní skripty, styly, zachová strukturu.
    """
    soup = BeautifulSoup(summary_html or "", "html.parser")
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()
    cleaned = str(soup).strip()
    return cleaned if cleaned else "<p>(Bez popisu)</p>"


def extract_first_paragraph(html: str) -> str:
    """Extrahuje první odstavec z HTML."""
    soup = BeautifulSoup(html or "", "html.parser")
    p = soup.find('p')
    if p:
        return p.get_text(strip=True)
    return html_to_text(html)[:200]


def count_words(text: str) -> int:
    """Počítá slova v textu."""
    words = re.findall(r'\b\w+\b', text)
    return len(words)


# =====================================================
# HASH A FILENAME
# =====================================================
def sha1_short(s: str) -> str:
    """Vrátí zkrácený SHA1 hash."""
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:16]


def make_filename_from_slug(slug: str) -> str:
    """Vytvoří filename ze slug - čitelné SEO-friendly URL."""
    if not slug:
        return f"{sha1_short(str(datetime.now()))}.html"
    # Zajisti že slug je bezpečný pro filesystem
    safe_slug = re.sub(r'[^a-z0-9-]', '', slug.lower())
    # Odstraň duplicitní pomlčky
    safe_slug = re.sub(r'-+', '-', safe_slug)
    safe_slug = safe_slug.strip('-')
    # Max délka 80 znaků pro lepší SEO
    safe_slug = safe_slug[:80]
    if not safe_slug:
        return f"{sha1_short(str(datetime.now()))}.html"
    return f"{safe_slug}.html"


def make_filename(url: str) -> str:
    """Vytvoří filename z URL (legacy - použij make_filename_from_slug)."""
    return f"{sha1_short(url)}.html"


def canonical_for(rel_path: str) -> str:
    """Vytvoří canonical URL pro relativní cestu."""
    rel_path = rel_path.lstrip("/")
    return f"{NEWS_BASE_URL}/{rel_path}"


# =====================================================
# SOUBOROVÉ OPERACE
# =====================================================
def ensure_dirs(*paths: str) -> None:
    """Zajistí existenci adresářů."""
    for path in paths:
        os.makedirs(path, exist_ok=True)


def write_file(path: str, content: str) -> None:
    """Bezpečně zapíše soubor."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def read_file(path: str) -> Optional[str]:
    """Přečte soubor, vrátí None pokud neexistuje."""
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# =====================================================
# REDIRECT STUB
# =====================================================
def make_redirect_stub(target_rel: str, canonical_url: str) -> str:
    """
    Vytvoří HTML redirect stub pro archivované články.
    """
    return f"""<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/news/{target_rel}">
<link rel="canonical" href="{canonical_url}">
<meta name="robots" content="noindex,follow">
<title>Přesměrování…</title>
</head>
<body>
<p>Přesměrování na <a href="/news/{target_rel}">archivovaný článek</a>.</p>
</body>
</html>"""


# =====================================================
# IMPORTANCE SCORING
# =====================================================
def calc_importance_score(title: str, feed_weight: float) -> float:
    """
    Vypočítá důležitost článku podle klíčových slov.
    """
    from config import KEYWORD_WEIGHT
    
    base = 1.0 * feed_weight
    t = (title or "").lower()
    
    for kw, w in KEYWORD_WEIGHT.items():
        if kw in t:
            base += w
    
    return float(base)
