#!/usr/bin/env python3
"""
main.py — News Bot SEO Pro - Hlavní vstupní bod

BitcoinChurch.cz /news generator
RSS → AI generace → SEO optimalizace → FTP upload

Spuštění:
    python main.py              # Normální běh (hourly loop)
    python main.py --once       # Jednorázový běh
    python main.py --dry-run    # Bez FTP uploadu
"""

import os
import sys
import time
import argparse
from datetime import datetime
from typing import List, Optional, Set

from jinja2 import Environment, FileSystemLoader, select_autoescape

# Lokální moduly
from config import (
    BASE_DIR, TEMPLATE_DIR, OUT_DIR, ARCHIVE_DIR, ARCHIVE_SUBDIR,
    SITE_URL, NEWS_BASE_URL, SITE_NAME, SITE_DESCRIPTION,
    KEEP_LATEST_ON_HOME, MAX_NEW_PER_RUN,
    MIN_PUBLISH_INTERVAL_SEC, DRY_RUN,
    CZ_TZ, TARGET_REGION,
    print_config,
)
from helpers import (
    now_str, now_iso, make_filename, make_filename_from_slug, canonical_for,
    ensure_dirs, write_file, make_redirect_stub,
    html_to_text,
)
from state import (
    load_state, save_state, get_known_urls,
    add_item, mark_archive_items, sort_items_by_created,
)
from feeds import (
    Candidate, fetch_candidates, filter_quality_candidates,
    get_candidate_info,
)
from dedupe import (
    is_duplicate, register_article, get_related_articles,
    extract_entities, get_dedupe_index,
)
from ai_generator import (
    generate_article, build_context_block, reset_ai_state,
    AIArticleResult,
)
from publisher import ftp_upload, move_to_archive, get_files_for_upload
from seo import (
    generate_article_jsonld, generate_breadcrumb_jsonld,
    generate_sitemap_xml, generate_news_sitemap_xml,
    generate_llms_txt, combine_jsonld,
    generate_robots_meta, extract_keywords_from_text,
    generate_rss_feed, generate_atom_feed,
    ping_search_engines, ping_indexnow,
)


# =====================================================
# JINJA2 TEMPLATES
# =====================================================
def setup_templates():
    """Nastaví Jinja2 prostředí a načte šablony."""
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        autoescape=select_autoescape(["html", "xml"]),
    )
    
    # Přidat vlastní filtry
    env.filters['truncate'] = lambda s, n: (s[:n-3] + '...') if len(s) > n else s
    
    article_tpl = env.get_template("article_template.html")
    home_tpl = env.get_template("home_template.html")
    
    return env, article_tpl, home_tpl


# =====================================================
# RENDERING
# =====================================================
def render_article_page(
    template,
    ai_result: AIArticleResult,
    source_url: str,
    published_at: str,
    filename: str,
    related_articles: List[dict],
) -> str:
    """Renderuje HTML stránku článku."""
    
    canonical_url = canonical_for(filename)
    current_year = datetime.now().year
    
    # Breadcrumbs
    breadcrumbs = [
        {"name": "Domů", "url": SITE_URL},
        {"name": "Novinky", "url": f"{NEWS_BASE_URL}/"},
        {"name": ai_result.seo_title[:40], "url": canonical_url},
    ]
    
    # JSON-LD
    article_jsonld = generate_article_jsonld(
        title=ai_result.seo_title,
        description=ai_result.meta_description,
        url=canonical_url,
        published_at=published_at,
        keywords=ai_result.secondary_keywords,
        entities=ai_result.entities,
        word_count=len(ai_result.body_html.split()),
    )
    
    breadcrumb_jsonld = generate_breadcrumb_jsonld(breadcrumbs)
    jsonld_script = combine_jsonld(article_jsonld, breadcrumb_jsonld)
    
    # Robots meta - SEO optimalizace
    robots_meta = generate_robots_meta(
        index=True, 
        follow=True, 
        max_image_preview="large"
    )
    
    # ISO datum pro meta tagy
    try:
        from helpers import parse_cz_datetime
        dt = parse_cz_datetime(published_at)
        published_iso = dt.isoformat() if dt else now_iso()
    except:
        published_iso = now_iso()
    
    # Render
    return template.render(
        # Základní
        title=ai_result.seo_title,
        meta_description=ai_result.meta_description,
        perex=ai_result.perex,
        body_html=ai_result.body_html,
        source_url=source_url,
        published_at=published_at,
        published_iso=published_iso,
        canonical_url=canonical_url,
        
        # SEO
        keywords=ai_result.secondary_keywords or [],
        entities=ai_result.entities or [],
        tags=ai_result.tags or [],
        category=ai_result.category,
        related_articles=related_articles,
        
        # JSON-LD a meta
        jsonld_script=jsonld_script,
        robots_meta=robots_meta,
        
        # Site info
        site_url=SITE_URL,
        site_name=SITE_NAME,
        news_base_url=NEWS_BASE_URL,
        current_year=current_year,
        source=ai_result.category,
        
        # Volitelné
        image_url=None,  # TODO: implementovat generování obrázků
        key_takeaways=None,  # Možno přidat do AI promptu
    )


def render_index_page(
    template,
    articles: List[dict],
    is_archive: bool = False,
) -> str:
    """Renderuje index nebo archiv stránku."""
    
    current_year = datetime.now().year
    generated_at = datetime.now(CZ_TZ).strftime("%d. %m. %Y %H:%M")
    
    if is_archive:
        page_title = "Archiv aktualit – ceny paliv"
        page_description = "Archiv starších článků o cenách benzínu, nafty a pohonných hmot v ČR."
        canonical = f"{NEWS_BASE_URL}/archive.html"
    else:
        page_title = "Aktuality – ceny pohonných hmot v ČR"
        page_description = "Aktuální novinky o cenách benzínu a nafty, analýzy trhu pohonných hmot pro české řidiče."
        canonical = f"{NEWS_BASE_URL}/"
    
    return template.render(
        articles=articles,
        is_archive=is_archive,
        page_title=page_title,
        page_description=page_description,
        canonical_url=canonical,
        generated_at=generated_at,
        
        site_url=SITE_URL,
        site_name=SITE_NAME,
        site_description=SITE_DESCRIPTION,
        news_base_url=NEWS_BASE_URL,
        current_year=current_year,
    )


# =====================================================
# HLAVNÍ BUILD LOGIKA
# =====================================================
def build_once() -> List[str]:
    """
    Provede jeden běh generování článků.
    
    Returns:
        Seznam cest k novým/změněným souborům
    """
    reset_ai_state()
    ensure_dirs(OUT_DIR, ARCHIVE_DIR)
    
    # Načtení šablon
    _, article_tpl, home_tpl = setup_templates()
    
    # Načtení stavu
    meta, items = load_state()
    meta["last_run_ts"] = int(time.time())
    known_urls = get_known_urls(items)
    
    print(f"[{now_str()}] Známých URL: {len(known_urls)}")
    
    # Načtení kandidátů
    all_candidates = fetch_candidates(known_urls)
    
    # Filtrování podle kvality
    candidates = filter_quality_candidates(all_candidates, MAX_NEW_PER_RUN)
    
    print(f"[{now_str()}] Kandidátů k zpracování: {len(candidates)}")
    
    # Kontext pro AI
    context = build_context_block()
    
    new_files: List[str] = []
    published_count = 0
    
    for candidate in candidates:
        print(f"[{now_str()}] Zpracovávám: {get_candidate_info(candidate)}")
        
        # Deduplikace
        clean_text = candidate.get_clean_text()
        is_dup, dup_reason = is_duplicate(
            url=candidate.url,
            title=candidate.title,
            content=clean_text,
        )
        
        if is_dup:
            print(f"[{now_str()}] SKIP (duplicita): {dup_reason}")
            continue
        
        # AI generace
        importance_hint = f"Skóre: {candidate.score:.2f}, zdroj: {candidate.source}"
        
        ai_result = generate_article(
            source_title=candidate.title,
            source_summary_html=candidate.summary_html,
            source_url=candidate.url,
            published_at=candidate.published_at,
            context_block=context,
            importance_hint=importance_hint,
        )
        
        if not ai_result.success:
            print(f"[{now_str()}] SKIP (AI fail): {ai_result.error_reason}")
            continue
        
        # Generování filename ze SLUG (čitelné URL)
        filename = make_filename_from_slug(ai_result.slug)
        local_path = os.path.join(OUT_DIR, filename)
        
        # Související články
        entities = set(ai_result.entities) if ai_result.entities else extract_entities(clean_text)
        related = get_related_articles(entities, exclude_url=candidate.url, limit=5)
        
        # Render HTML
        html_page = render_article_page(
            template=article_tpl,
            ai_result=ai_result,
            source_url=candidate.url,
            published_at=candidate.published_at,
            filename=filename,
            related_articles=related,
        )
        
        # Uložení
        write_file(local_path, html_page)
        new_files.append(local_path)
        published_count += 1
        
        # Registrace do dedupe indexu
        full_content = f"{ai_result.seo_title} {ai_result.perex} {html_to_text(ai_result.body_html)}"
        register_article(candidate.url, ai_result.seo_title, full_content)
        
        # Přidání do state
        items = add_item(
            items=items,
            url=candidate.url,
            title=ai_result.seo_title,
            summary=ai_result.perex,
            filename=filename,
            published_at=candidate.published_at,
            created=now_str(),
            score=candidate.score,
            source=candidate.source,
            category=ai_result.category,
            entities=ai_result.entities,
            tags=ai_result.tags,
        )
        
        print(f"[{now_str()}] PUBLIKOVÁNO: {ai_result.seo_title[:50]}...")
    
    # Seřazení a archivace
    items = sort_items_by_created(items)
    items = mark_archive_items(items, KEEP_LATEST_ON_HOME)
    
    # Přesun starých článků do archivu
    for item in items:
        if not item.get("is_archive"):
            continue
        
        base = os.path.basename(item["filename"])
        if item["filename"].startswith(ARCHIVE_SUBDIR):
            continue  # Již v archivu
        
        arch_rel = f"{ARCHIVE_SUBDIR}/{base}"
        src = os.path.join(OUT_DIR, base)
        dst = os.path.join(OUT_DIR, arch_rel)
        
        if move_to_archive(src, dst):
            new_files.append(dst)
            
            # Redirect stub
            stub = make_redirect_stub(
                target_rel=arch_rel,
                canonical_url=canonical_for(arch_rel),
            )
            stub_path = os.path.join(OUT_DIR, base)
            write_file(stub_path, stub)
            new_files.append(stub_path)
            
            item["filename"] = arch_rel
    
    # Aktualizace publish timestamp
    if published_count > 0:
        meta["last_publish_ts"] = int(time.time())
    
    # Uložení stavu
    save_state(meta, items)
    
    # Generování index stránek
    latest = [it for it in items if not it.get("is_archive")]
    archive = [it for it in items if it.get("is_archive")]
    
    # Index (homepage)
    index_html = render_index_page(home_tpl, latest[:KEEP_LATEST_ON_HOME], is_archive=False)
    index_path = os.path.join(OUT_DIR, "index.html")
    write_file(index_path, index_html)
    new_files.append(index_path)
    
    # Archive
    archive_html = render_index_page(home_tpl, archive[:1500], is_archive=True)
    archive_path = os.path.join(OUT_DIR, "archive.html")
    write_file(archive_path, archive_html)
    new_files.append(archive_path)
    
    # Sitemap
    sitemap_path = os.path.join(OUT_DIR, "sitemap.xml")
    generate_sitemap_xml(items, sitemap_path)
    new_files.append(sitemap_path)
    
    # News sitemap
    news_sitemap_path = os.path.join(OUT_DIR, "sitemap-news.xml")
    generate_news_sitemap_xml(items, news_sitemap_path)
    new_files.append(news_sitemap_path)
    
    # RSS feed
    rss_path = os.path.join(OUT_DIR, "rss.xml")
    rss_content = generate_rss_feed(items, max_items=50)
    write_file(rss_path, rss_content)
    new_files.append(rss_path)
    print(f"[{now_str()}] RSS feed vygenerován: {rss_path}")
    
    # Atom feed
    atom_path = os.path.join(OUT_DIR, "atom.xml")
    atom_content = generate_atom_feed(items, max_items=50)
    write_file(atom_path, atom_content)
    new_files.append(atom_path)
    
    # llms.txt
    llms_path = os.path.join(OUT_DIR, "llms.txt")
    generate_llms_txt(llms_path, items)
    new_files.append(llms_path)
    
    # Ping vyhledávačů pro rychlou indexaci (pouze pokud byly nové články)
    if published_count > 0 and not DRY_RUN:
        print(f"[{now_str()}] Pinguji vyhledávače pro indexaci...")
        sitemap_url = f"{NEWS_BASE_URL}/sitemap.xml"
        ping_results = ping_search_engines(sitemap_url)
        print(f"[{now_str()}] Ping výsledky: Google={ping_results.get('google')}, Bing={ping_results.get('bing')}")
        
        # IndexNow pro nové URL
        new_urls = [f"{NEWS_BASE_URL}/{f}" for f in new_files if f.endswith('.html') and 'index' not in f and 'archive' not in f]
        if new_urls:
            indexnow_ok = ping_indexnow(new_urls)
            print(f"[{now_str()}] IndexNow: {'OK' if indexnow_ok else 'FAIL'} ({len(new_urls)} URL)")
    
    print(f"[{now_str()}] Build hotov: publikováno={published_count}, souborů={len(new_files)}")
    
    return get_files_for_upload(new_files)


# =====================================================
# SCHEDULER
# =====================================================
def run_forever_hourly():
    """Spustí nekonečnou smyčku s hodinovou kadencí."""
    print_config()
    print(f"[{now_str()}] START | Hourly loop | min_interval={MIN_PUBLISH_INTERVAL_SEC}s")
    
    while True:
        meta, _ = load_state()
        now_ts = int(time.time())
        last_pub = int(meta.get("last_publish_ts", 0) or 0)
        
        # Kontrola publish intervalu
        if last_pub and (now_ts - last_pub) < MIN_PUBLISH_INTERVAL_SEC:
            wait = MIN_PUBLISH_INTERVAL_SEC - (now_ts - last_pub)
            print(f"[{now_str()}] Čekám {wait}s do dalšího okna...")
            time.sleep(max(30, wait))
            continue
        
        try:
            print(f"[{now_str()}] === RUN START ===")
            files = build_once()
            
            if files:
                ftp_upload(files)
            
            print(f"[{now_str()}] === RUN DONE === | uploaded={len(files)}")
            
        except KeyboardInterrupt:
            print(f"\n[{now_str()}] Přerušeno uživatelem.")
            sys.exit(0)
            
        except Exception as e:
            print(f"[{now_str()}] CHYBA: {e}")
            import traceback
            traceback.print_exc()
        
        # Čekání do dalšího okna
        meta2, _ = load_state()
        last_pub2 = int(meta2.get("last_publish_ts", 0) or 0)
        now2 = int(time.time())
        
        if last_pub2:
            wait2 = max(60, MIN_PUBLISH_INTERVAL_SEC - (now2 - last_pub2))
            print(f"[{now_str()}] Další běh za {wait2}s...")
            time.sleep(wait2)
        else:
            time.sleep(60)


def run_once():
    """Provede jednorázový běh."""
    print_config()
    print(f"[{now_str()}] Jednorázový běh...")
    
    try:
        files = build_once()
        
        if files and not DRY_RUN:
            ftp_upload(files)
        
        print(f"[{now_str()}] Hotovo. Souborů: {len(files)}")
        
    except Exception as e:
        print(f"[{now_str()}] CHYBA: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


# =====================================================
# MAIN
# =====================================================
def main():
    parser = argparse.ArgumentParser(
        description="BenzinMapa News Bot – generátor aktualit o cenách paliv"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Provede jednorázový běh místo nekonečné smyčky",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Neprovede FTP upload (pouze lokální generování)",
    )
    
    args = parser.parse_args()
    
    # Override DRY_RUN pokud zadán argument
    if args.dry_run:
        import config
        config.DRY_RUN = True
    
    if args.once:
        run_once()
    else:
        run_forever_hourly()


if __name__ == "__main__":
    main()
