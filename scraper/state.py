"""
state.py — Správa stavu aplikace

Funkce:
1. Načítání a ukládání state.json
2. Backward kompatibilita se starým formátem
"""

import json
import os
from typing import Any, Dict, List, Tuple

from config import STATE_PATH


# =====================================================
# VÝCHOZÍ STATE
# =====================================================
STATE_DEFAULT = {
    "last_run_ts": 0,
    "last_publish_ts": 0,
    "items": [],
}


# =====================================================
# STATE OPERATIONS
# =====================================================
def load_state() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Načte state.json.
    
    Podporuje oba formáty:
    - Starý: list[dict] (jen položky)
    - Nový: {"last_run_ts": ..., "last_publish_ts": ..., "items": [...]}
    
    Returns:
        (meta_dict, items_list)
    """
    if not os.path.exists(STATE_PATH):
        return dict(STATE_DEFAULT), []
    
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            data: Any = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[STATE] Chyba při parsování JSON: {e}")
        return dict(STATE_DEFAULT), []
    except Exception as e:
        print(f"[STATE] Chyba při čtení souboru: {e}")
        return dict(STATE_DEFAULT), []
    
    meta = dict(STATE_DEFAULT)
    items: List[Dict[str, Any]]
    
    # Detekce formátu
    if isinstance(data, list):
        # Starý formát - jen seznam položek
        items = data
    elif isinstance(data, dict):
        # Nový formát
        meta["last_run_ts"] = int(data.get("last_run_ts", 0) or 0)
        meta["last_publish_ts"] = int(data.get("last_publish_ts", 0) or 0)
        items = data.get("items", [])
    else:
        items = []
    
    if not isinstance(items, list):
        items = []
    
    # Validace a normalizace položek
    valid_items: List[Dict[str, Any]] = []
    for it in items:
        if not isinstance(it, dict):
            continue
        
        # Backward-compat přejmenování klíčů
        if "url" not in it and "source_url" in it:
            it["url"] = it["source_url"]
        if "created" not in it and "created_at" in it:
            it["created"] = it["created_at"]
        
        # Validace povinných polí
        if "url" in it and "filename" in it and "title" in it:
            valid_items.append(it)
    
    return meta, valid_items


def save_state(meta: Dict[str, Any], items: List[Dict[str, Any]]) -> None:
    """
    Uloží state.json.
    OCHRANA: Před uložením zkontroluje že nemažeme existující články.
    
    Args:
        meta: Metadata (last_run_ts, last_publish_ts)
        items: Seznam článků
    """
    # OCHRANA: Zkontroluj že nemažeme články
    if os.path.exists(STATE_PATH):
        try:
            with open(STATE_PATH, "r", encoding="utf-8") as f:
                old_data = json.load(f)
            old_items = old_data.get("items", []) if isinstance(old_data, dict) else old_data
            old_count = len(old_items) if isinstance(old_items, list) else 0
            new_count = len(items)
            
            # Pokud bychom mazali více než 50% článků, vytvoř zálohu
            if old_count > 0 and new_count < old_count * 0.5:
                import shutil
                backup_path = STATE_PATH + ".backup"
                shutil.copy2(STATE_PATH, backup_path)
                print(f"[STATE] VAROVÁNÍ: Výrazné snížení článků ({old_count} -> {new_count}). Záloha: {backup_path}")
        except Exception:
            pass
    
    # Merge s defaulty
    meta = {**dict(STATE_DEFAULT), **(meta or {})}
    meta["items"] = items
    
    try:
        with open(STATE_PATH, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[STATE] Chyba při ukládání: {e}")


def get_known_urls(items: List[Dict[str, Any]]) -> set:
    """Vrátí množinu známých URL ze state."""
    return {it.get("url") for it in items if it.get("url")}


def add_item(
    items: List[Dict[str, Any]],
    url: str,
    title: str,
    summary: str,
    filename: str,
    published_at: str,
    created: str,
    score: float,
    source: str,
    **extra,
) -> List[Dict[str, Any]]:
    """
    Přidá novou položku na začátek seznamu.
    
    Returns:
        Aktualizovaný seznam položek
    """
    item = {
        "url": url,
        "title": title,
        "summary": summary,
        "filename": filename,
        "published_at": published_at,
        "created": created,
        "score": round(float(score), 3),
        "source": source,
        "is_archive": False,
        **extra,
    }
    
    items.insert(0, item)
    return items


def mark_archive_items(
    items: List[Dict[str, Any]],
    keep_latest: int,
) -> List[Dict[str, Any]]:
    """
    Označí starší položky jako archivované.
    
    Args:
        items: Seznam položek (seřazený od nejnovějších)
        keep_latest: Kolik nejnovějších položek nechat na homepage
    
    Returns:
        Aktualizovaný seznam
    """
    for i, it in enumerate(items):
        it["is_archive"] = (i >= keep_latest)
    
    return items


def sort_items_by_created(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Seřadí položky podle data vytvoření (nejnovější první)."""
    return sorted(items, key=lambda x: x.get("created", ""), reverse=True)
