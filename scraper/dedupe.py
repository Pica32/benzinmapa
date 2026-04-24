"""
dedupe.py — Pokročilá deduplikace článků

Funkce:
1. URL dedupe (základní)
2. Content fingerprint pomocí SimHash
3. Semantic near-duplicate pomocí Jaccard n-gramů
4. Topic repetition guard (entity/téma overlap)
"""

import json
import os
import re
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field, asdict
from collections import Counter

from config import (
    DEDUPE_INDEX_PATH,
    DEDUPE_INDEX_MAX_ITEMS,
    SIMHASH_THRESHOLD,
    JACCARD_THRESHOLD,
    TOPIC_GUARD_DAYS,
    MIN_ENTITY_OVERLAP,
    CZ_TZ,
)


# =====================================================
# SIMHASH IMPLEMENTACE
# =====================================================
class SimHash:
    """
    SimHash pro detekci near-duplicate textů.
    Hammingova vzdálenost < práh = podobné dokumenty.
    """
    
    def __init__(self, text: str, n_bits: int = 64):
        self.n_bits = n_bits
        self.hash_value = self._compute(text)
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenizace textu na slova (lowercase, bez diakritiky)."""
        text = text.lower()
        # Odstranění diakritiky pro lepší matching
        replacements = {
            'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e',
            'í': 'i', 'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's',
            'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z',
        }
        for cz, ascii_char in replacements.items():
            text = text.replace(cz, ascii_char)
        
        # Extrakce slov
        words = re.findall(r'\b\w{2,}\b', text)
        return words
    
    def _hash_token(self, token: str) -> int:
        """Hash jednoho tokenu na n-bitové číslo."""
        h = hashlib.md5(token.encode('utf-8')).hexdigest()
        return int(h, 16) % (2 ** self.n_bits)
    
    def _compute(self, text: str) -> int:
        """Výpočet SimHash pro text."""
        tokens = self._tokenize(text)
        if not tokens:
            return 0
        
        v = [0] * self.n_bits
        
        for token in tokens:
            h = self._hash_token(token)
            for i in range(self.n_bits):
                if h & (1 << i):
                    v[i] += 1
                else:
                    v[i] -= 1
        
        fingerprint = 0
        for i in range(self.n_bits):
            if v[i] > 0:
                fingerprint |= (1 << i)
        
        return fingerprint
    
    @staticmethod
    def hamming_distance(hash1: int, hash2: int, n_bits: int = 64) -> int:
        """Hammingova vzdálenost mezi dvěma hashi."""
        xor = hash1 ^ hash2
        return bin(xor).count('1')
    
    def distance_to(self, other: 'SimHash') -> int:
        """Vzdálenost k jinému SimHash."""
        return self.hamming_distance(self.hash_value, other.hash_value, self.n_bits)


# =====================================================
# JACCARD N-GRAM PODOBNOST
# =====================================================
def get_ngrams(text: str, n: int = 3) -> Set[str]:
    """Extrakce character n-gramů z textu."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    
    if len(text) < n:
        return {text}
    
    ngrams = set()
    for i in range(len(text) - n + 1):
        ngrams.add(text[i:i + n])
    
    return ngrams


def jaccard_similarity(set1: Set[str], set2: Set[str]) -> float:
    """Jaccard podobnost dvou množin."""
    if not set1 or not set2:
        return 0.0
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    return intersection / union if union > 0 else 0.0


# =====================================================
# ENTITY EXTRACTION
# =====================================================
def extract_entities(text: str) -> Set[str]:
    """
    Extrakce entit z textu (jednoduchá heuristika).
    Hledá kapitálky, známá slova, čísla s jednotkami.
    """
    entities = set()
    text_lower = text.lower()
    
    # Známé entity (z config)
    from config import KNOWN_ENTITIES
    for category, entity_list in KNOWN_ENTITIES.items():
        for entity in entity_list:
            if entity.lower() in text_lower:
                entities.add(entity.lower())
    
    # Kapitálky (potenciální vlastní jména)
    caps = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    for cap in caps:
        if len(cap) > 2:
            entities.add(cap.lower())
    
    # Zkratky (např. ETF, SEC, BTC)
    acronyms = re.findall(r'\b[A-Z]{2,5}\b', text)
    for acr in acronyms:
        entities.add(acr.lower())
    
    # Čísla s kontextem (ceny, procenta)
    # např. "$50,000", "25%", "10 miliard"
    price_patterns = re.findall(r'\$[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%|\d+\s*(?:miliard|milion|tisíc)', text_lower)
    for p in price_patterns:
        entities.add(p)
    
    return entities


# =====================================================
# DEDUPE INDEX
# =====================================================
@dataclass
class DedupeEntry:
    """Záznam v dedupe indexu."""
    url: str
    title: str
    simhash: int
    ngrams_hash: str  # Hash n-gramů pro rychlé porovnání
    entities: List[str]
    created_at: str
    
    def to_dict(self) -> dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, d: dict) -> 'DedupeEntry':
        return cls(**d)


class DedupeIndex:
    """
    Index pro deduplikaci článků.
    Udržuje SimHash fingerprints, n-gramy a entity.
    """
    
    def __init__(self, path: str = DEDUPE_INDEX_PATH):
        self.path = path
        self.entries: List[DedupeEntry] = []
        self._load()
    
    def _load(self):
        """Načtení indexu ze souboru."""
        if os.path.exists(self.path):
            try:
                with open(self.path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.entries = [DedupeEntry.from_dict(e) for e in data.get('entries', [])]
            except Exception as e:
                print(f"[DEDUPE] Chyba při načítání indexu: {e}")
                self.entries = []
        else:
            self.entries = []
    
    def _save(self):
        """Uložení indexu do souboru."""
        try:
            data = {'entries': [e.to_dict() for e in self.entries]}
            with open(self.path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[DEDUPE] Chyba při ukládání indexu: {e}")
    
    def _compute_ngrams_hash(self, text: str) -> str:
        """Vytvoří hash z n-gramů pro rychlé porovnání."""
        ngrams = get_ngrams(text, n=3)
        ngrams_str = '|'.join(sorted(ngrams))
        return hashlib.md5(ngrams_str.encode('utf-8')).hexdigest()[:16]
    
    def add_entry(
        self,
        url: str,
        title: str,
        content: str,  # title + perex + body (čistý text)
    ):
        """Přidání nového záznamu do indexu."""
        simhash = SimHash(content).hash_value
        ngrams_hash = self._compute_ngrams_hash(content)
        entities = list(extract_entities(content))
        created_at = datetime.now(CZ_TZ).isoformat()
        
        entry = DedupeEntry(
            url=url,
            title=title,
            simhash=simhash,
            ngrams_hash=ngrams_hash,
            entities=entities,
            created_at=created_at,
        )
        
        self.entries.insert(0, entry)
        
        # Oříznutí na max položek
        if len(self.entries) > DEDUPE_INDEX_MAX_ITEMS:
            self.entries = self.entries[:DEDUPE_INDEX_MAX_ITEMS]
        
        self._save()
    
    def check_duplicate(
        self,
        url: str,
        title: str,
        content: str,
    ) -> Tuple[bool, str]:
        """
        Kontrola, zda je článek duplicitní.
        
        Returns:
            (is_duplicate, reason)
        """
        # 1. URL dedupe
        known_urls = {e.url for e in self.entries}
        if url in known_urls:
            return True, f"URL již existuje v indexu"
        
        # 2. SimHash podobnost
        new_simhash = SimHash(content).hash_value
        
        for entry in self.entries:
            distance = SimHash.hamming_distance(new_simhash, entry.simhash)
            if distance <= SIMHASH_THRESHOLD:
                return True, f"SimHash podobnost (vzdálenost={distance}) s: {entry.title[:50]}"
        
        # 3. Jaccard n-gram podobnost
        new_ngrams = get_ngrams(content, n=3)
        
        for entry in self.entries:
            # Rychlý pre-check: pokud je hash stejný, je to určitě podobné
            entry_ngrams_hash = entry.ngrams_hash
            new_ngrams_hash = self._compute_ngrams_hash(content)
            
            if entry_ngrams_hash == new_ngrams_hash:
                return True, f"Identický n-gram hash s: {entry.title[:50]}"
            
            # Plná Jaccard kontrola jen pro nedávné články
            try:
                entry_date = datetime.fromisoformat(entry.created_at)
                if datetime.now(CZ_TZ) - entry_date > timedelta(days=7):
                    continue  # Starší články přeskočíme pro výkon
            except:
                pass
            
            # Rekonstrukce n-gramů z obsahu by byla drahá, použijeme SimHash jako proxy
        
        # 4. Topic repetition guard
        new_entities = extract_entities(content)
        cutoff = datetime.now(CZ_TZ) - timedelta(days=TOPIC_GUARD_DAYS)
        
        for entry in self.entries:
            try:
                entry_date = datetime.fromisoformat(entry.created_at)
                if entry_date < cutoff:
                    continue
            except:
                continue
            
            entry_entities = set(entry.entities)
            overlap = new_entities & entry_entities
            
            if len(overlap) >= MIN_ENTITY_OVERLAP:
                # Kontrola, zda se jedná o stejné téma (ne jen sdílené běžné entity)
                # Ignorujeme velmi obecné entity
                common_entities = {'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'krypto'}
                significant_overlap = overlap - common_entities
                
                if len(significant_overlap) >= MIN_ENTITY_OVERLAP:
                    return True, f"Topic repetition (entity overlap: {significant_overlap}) s: {entry.title[:50]}"
        
        return False, ""
    
    def get_recent_entries(self, days: int = 7) -> List[DedupeEntry]:
        """Vrátí záznamy z posledních N dní."""
        cutoff = datetime.now(CZ_TZ) - timedelta(days=days)
        recent = []
        
        for entry in self.entries:
            try:
                entry_date = datetime.fromisoformat(entry.created_at)
                if entry_date >= cutoff:
                    recent.append(entry)
            except:
                continue
        
        return recent
    
    def get_related_by_entities(
        self,
        entities: Set[str],
        exclude_url: str = "",
        limit: int = 5,
    ) -> List[DedupeEntry]:
        """
        Najde související články podle sdílených entit.
        Pro sekci "Související články".
        """
        scores = []
        
        for entry in self.entries:
            if entry.url == exclude_url:
                continue
            
            entry_entities = set(entry.entities)
            overlap = len(entities & entry_entities)
            
            if overlap > 0:
                scores.append((entry, overlap))
        
        # Seřadit podle počtu sdílených entit
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return [e for e, _ in scores[:limit]]


# =====================================================
# HLAVNÍ FUNKCE PRO POUŽITÍ
# =====================================================
_dedupe_index: Optional[DedupeIndex] = None


def get_dedupe_index() -> DedupeIndex:
    """Singleton pro dedupe index."""
    global _dedupe_index
    if _dedupe_index is None:
        _dedupe_index = DedupeIndex()
    return _dedupe_index


def is_duplicate(url: str, title: str, content: str) -> Tuple[bool, str]:
    """
    Hlavní funkce pro kontrolu duplicity.
    
    Args:
        url: URL zdrojového článku
        title: Titulek článku
        content: Čistý text (title + perex + body bez HTML)
    
    Returns:
        (is_duplicate, reason)
    """
    index = get_dedupe_index()
    return index.check_duplicate(url, title, content)


def register_article(url: str, title: str, content: str):
    """
    Registrace publikovaného článku do dedupe indexu.
    Volat až po úspěšné publikaci!
    """
    index = get_dedupe_index()
    index.add_entry(url, title, content)


def get_related_articles(entities: Set[str], exclude_url: str = "", limit: int = 5) -> List[dict]:
    """
    Získání souvisejících článků pro interlinking.
    
    Returns:
        List of dicts with 'url', 'title', 'filename'
    """
    index = get_dedupe_index()
    related = index.get_related_by_entities(entities, exclude_url, limit)
    
    return [
        {
            'url': e.url,
            'title': e.title,
            'filename': e.url.split('/')[-1] if '/' in e.url else e.url,
        }
        for e in related
    ]
