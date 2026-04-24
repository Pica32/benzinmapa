"""
feeds.py — RSS feeds zpracování

Funkce:
1. Načítání RSS feedů
2. Filtrování a scoring kandidátů
3. Quality gate
"""

from dataclasses import dataclass
from typing import List, Set, Optional

import feedparser

from config import (
    FEEDS, NUM_ENTRIES_PER_FEED,
    MIN_TITLE_LEN, MIN_SUMMARY_TEXT_LEN,
    CANDIDATE_KEEP_RATIO,
)
from helpers import (
    now_str, normalize_title, parse_entry_time,
    calc_importance_score, html_to_text, clean_html,
)


# =====================================================
# CANDIDATE DATACLASS
# =====================================================
@dataclass
class Candidate:
    """Kandidát na publikaci z RSS."""
    source: str
    weight: float
    url: str
    title: str
    summary_html: str
    published_at: str
    score: float
    
    def get_clean_text(self) -> str:
        """Vrátí čistý text pro deduplikaci."""
        title_clean = normalize_title(self.title)
        summary_clean = html_to_text(self.summary_html or "")
        return f"{title_clean} {summary_clean}"


# =====================================================
# RSS FETCHING
# =====================================================
def fetch_all_feeds() -> List[Candidate]:
    """
    Načte všechny RSS feedy a vrátí seznam kandidátů.
    Seřazeno podle skóre (nejvyšší první).
    """
    candidates: List[Candidate] = []
    
    for feed in FEEDS:
        try:
            d = feedparser.parse(feed.url)
            entries = getattr(d, "entries", []) or []
            print(f"[{now_str()}] RSS: {feed.name} | položek={len(entries)}")
            
            for entry in entries[:NUM_ENTRIES_PER_FEED]:
                url = getattr(entry, "link", None)
                if not url:
                    continue
                
                title = normalize_title(getattr(entry, "title", "Bez názvu"))
                summary_html = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
                published_at = parse_entry_time(entry)
                score = calc_importance_score(title, feed.weight)
                
                candidates.append(Candidate(
                    source=feed.name,
                    weight=feed.weight,
                    url=url,
                    title=title,
                    summary_html=summary_html,
                    published_at=published_at,
                    score=score,
                ))
        
        except Exception as e:
            print(f"[{now_str()}] RSS chyba: {feed.name} | {e}")
            continue
    
    # Seřadit podle skóre
    candidates.sort(key=lambda x: x.score, reverse=True)
    
    return candidates


def fetch_candidates(seen_urls: Set[str]) -> List[Candidate]:
    """
    Načte kandidáty a odfiltruje již zpracované URL.
    
    Args:
        seen_urls: Množina již zpracovaných URL
    
    Returns:
        Seznam nových kandidátů
    """
    all_candidates = fetch_all_feeds()
    
    # Filtrování již viděných URL
    new_candidates = [c for c in all_candidates if c.url not in seen_urls]
    
    print(f"[{now_str()}] Kandidáti: celkem={len(all_candidates)}, nových={len(new_candidates)}")
    
    return new_candidates


# =====================================================
# QUALITY GATE
# =====================================================
def is_quality_candidate(candidate: Candidate) -> bool:
    """
    Kontroluje kvalitu kandidáta.
    
    Returns:
        True pokud kandidát projde quality gate
    """
    title = (candidate.title or "").strip()
    summary_text = html_to_text(clean_html(candidate.summary_html or ""))
    
    # Minimální délka titulku
    if len(title) < MIN_TITLE_LEN:
        return False
    
    # Minimální délka shrnutí
    if len(summary_text) < MIN_SUMMARY_TEXT_LEN:
        return False
    
    # Odfiltrování prázdných položek
    if "(Bez popisu" in candidate.summary_html:
        return False
    
    # Blacklist slov v titulku (spam, reklama)
    blacklist = ["sponsored", "advertisement", "promo", "giveaway", "airdrop free"]
    title_lower = title.lower()
    for word in blacklist:
        if word in title_lower:
            return False
    
    return True


def filter_quality_candidates(
    candidates: List[Candidate],
    max_count: int,
) -> List[Candidate]:
    """
    Filtruje kandidáty podle kvality a vrací top N.
    STŘÍDÁ ZDROJE - round-robin výběr z různých RSS feedů.
    
    Args:
        candidates: Seznam kandidátů
        max_count: Maximální počet k vrácení
    
    Returns:
        Filtrovaný seznam s diverzifikovanými zdroji
    """
    # Vyber top procento podle skóre
    keep_n = max(1, int(len(candidates) * CANDIDATE_KEEP_RATIO))
    top_candidates = candidates[:keep_n]
    
    # Filtruj podle kvality
    quality_candidates = [c for c in top_candidates if is_quality_candidate(c)]
    
    print(f"[{now_str()}] Quality gate: vstup={len(top_candidates)}, výstup={len(quality_candidates)}")
    
    # ROUND-ROBIN: Střídej zdroje pro diverzitu
    if len(quality_candidates) > max_count:
        # Seskup podle zdroje
        by_source = {}
        for c in quality_candidates:
            src = c.source
            if src not in by_source:
                by_source[src] = []
            by_source[src].append(c)
        
        # Round-robin výběr
        selected = []
        source_list = list(by_source.keys())
        idx = 0
        
        while len(selected) < max_count:
            src = source_list[idx % len(source_list)]
            if by_source[src]:
                selected.append(by_source[src].pop(0))
            else:
                # Tento zdroj je prázdný, odeber ho
                source_list.remove(src)
                if not source_list:
                    break
            idx += 1
        
        print(f"[{now_str()}] Round-robin: vybráno {len(selected)} článků z {len(by_source)} zdrojů")
        return selected
    
    return quality_candidates[:max_count]


# =====================================================
# CANDIDATE INFO
# =====================================================
def get_candidate_info(candidate: Candidate) -> str:
    """Vrátí info string o kandidátovi pro logování."""
    return (
        f"[{candidate.source}] "
        f"score={candidate.score:.2f} | "
        f"{candidate.title[:50]}..."
    )
