"""
seo.py — SEO, LLMO a Structured Data modul

Funkce:
1. JSON-LD structured data (NewsArticle, Organization, WebSite, BreadcrumbList)
2. OpenGraph a Twitter Card meta tagy
3. Generování sitemap.xml a sitemap-news.xml
4. Generování llms.txt pro AI discovery
5. Canonical URLs, robots meta
"""

import json
import os
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from xml.etree import ElementTree as ET
from xml.dom import minidom

from config import (
    SITE_URL, NEWS_BASE_URL, SITE_NAME, SITE_DESCRIPTION,
    SITE_LANGUAGE, SITE_LOCALE, OUT_DIR, CZ_TZ,
    KNOWN_ENTITIES, TARGET_REGION, ARCHIVE_SUBDIR,
)


# =====================================================
# JSON-LD STRUCTURED DATA
# =====================================================
def generate_organization_jsonld() -> dict:
    """JSON-LD pro Organization (publisher)."""
    return {
        "@type": "Organization",
        "@id": f"{SITE_URL}/#organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
            "@type": "ImageObject",
            "url": f"{SITE_URL}/images/logo.png",
            "width": 512,
            "height": 512,
        },
        "sameAs": [
            # Přidat sociální sítě podle potřeby
        ],
    }


def generate_website_jsonld() -> dict:
    """JSON-LD pro WebSite."""
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": f"{SITE_URL}/#website",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": SITE_DESCRIPTION,
        "inLanguage": SITE_LANGUAGE,
        "publisher": {
            "@id": f"{SITE_URL}/#organization",
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": f"{SITE_URL}/search?q={{search_term_string}}",
            },
            "query-input": "required name=search_term_string",
        },
    }


def generate_breadcrumb_jsonld(
    items: List[Dict[str, str]],
) -> dict:
    """
    JSON-LD pro BreadcrumbList.
    
    Args:
        items: List of dicts with 'name' and 'url' keys
               e.g., [{'name': 'Novinky', 'url': '/news/'}, {'name': 'Článek', 'url': '/news/xxx.html'}]
    """
    item_list = []
    for i, item in enumerate(items, 1):
        item_list.append({
            "@type": "ListItem",
            "position": i,
            "name": item['name'],
            "item": item['url'] if item['url'].startswith('http') else f"{SITE_URL}{item['url']}",
        })
    
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": item_list,
    }


def generate_article_jsonld(
    title: str,
    description: str,
    url: str,
    published_at: str,
    modified_at: Optional[str] = None,
    author_name: str = SITE_NAME,
    image_url: Optional[str] = None,
    keywords: Optional[List[str]] = None,
    entities: Optional[List[str]] = None,
    word_count: Optional[int] = None,
) -> dict:
    """
    JSON-LD pro NewsArticle.
    
    Optimalizováno pro Google News a LLM parsování.
    """
    # Parsování data do ISO formátu
    try:
        if '.' in published_at and ':' in published_at:
            # Formát: "01. 01. 2025 12:00"
            dt = datetime.strptime(published_at, "%d. %m. %Y %H:%M")
            dt = dt.replace(tzinfo=CZ_TZ)
        else:
            dt = datetime.now(CZ_TZ)
    except:
        dt = datetime.now(CZ_TZ)
    
    date_published = dt.isoformat()
    date_modified = modified_at or date_published
    
    article = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "@id": url,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url,
        },
        "headline": title[:110],  # Google limit
        "description": description[:200],
        "datePublished": date_published,
        "dateModified": date_modified,
        "author": {
            "@type": "Organization",
            "name": author_name,
            "url": SITE_URL,
        },
        "publisher": generate_organization_jsonld(),
        "inLanguage": SITE_LANGUAGE,
        "isAccessibleForFree": True,
    }
    
    if image_url:
        article["image"] = {
            "@type": "ImageObject",
            "url": image_url,
            "width": 1200,
            "height": 630,
        }
    
    if keywords:
        article["keywords"] = ", ".join(keywords[:10])
    
    if word_count:
        article["wordCount"] = word_count
    
    # Přidání mentions pro entity (pomáhá LLM)
    if entities:
        mentions = []
        for entity in entities[:10]:
            entity_lower = entity.lower()
            # Detekce typu entity
            if any(e.lower() == entity_lower for e in KNOWN_ENTITIES.get('organizations', [])):
                mentions.append({
                    "@type": "Organization",
                    "name": entity,
                })
            elif any(e.lower() == entity_lower for e in KNOWN_ENTITIES.get('people', [])):
                mentions.append({
                    "@type": "Person",
                    "name": entity,
                })
            else:
                mentions.append({
                    "@type": "Thing",
                    "name": entity,
                })
        
        if mentions:
            article["mentions"] = mentions
    
    return article


def generate_speakable_jsonld(
    article_url: str,
    css_selectors: List[str] = None,
) -> dict:
    """
    JSON-LD pro Speakable (hlasové vyhledávání).
    """
    if css_selectors is None:
        css_selectors = ["h1", ".article-perex", ".key-takeaways"]
    
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": css_selectors,
        },
        "url": article_url,
    }


def combine_jsonld(*schemas) -> str:
    """
    Kombinuje více JSON-LD schémat do jednoho @graph.
    Vrací hotový <script> tag.
    """
    # Filtrovat prázdné
    schemas = [s for s in schemas if s]
    
    if len(schemas) == 1:
        combined = schemas[0]
    else:
        combined = {
            "@context": "https://schema.org",
            "@graph": schemas,
        }
    
    json_str = json.dumps(combined, ensure_ascii=False, indent=2)
    return f'<script type="application/ld+json">\n{json_str}\n</script>'


# =====================================================
# OPENGRAPH A TWITTER CARDS
# =====================================================
def generate_opengraph_meta(
    title: str,
    description: str,
    url: str,
    image_url: Optional[str] = None,
    article_type: str = "article",
    published_time: Optional[str] = None,
    section: str = "Kryptoměny",
    tags: Optional[List[str]] = None,
) -> str:
    """
    Generuje OpenGraph meta tagy.
    """
    og_tags = [
        f'<meta property="og:type" content="{article_type}">',
        f'<meta property="og:title" content="{_escape_attr(title)}">',
        f'<meta property="og:description" content="{_escape_attr(description)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        f'<meta property="og:locale" content="{SITE_LOCALE}">',
    ]
    
    if image_url:
        og_tags.extend([
            f'<meta property="og:image" content="{image_url}">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
        ])
    
    if article_type == "article":
        og_tags.append(f'<meta property="article:section" content="{section}">')
        
        if published_time:
            og_tags.append(f'<meta property="article:published_time" content="{published_time}">')
        
        if tags:
            for tag in tags[:5]:
                og_tags.append(f'<meta property="article:tag" content="{_escape_attr(tag)}">')
    
    return '\n'.join(og_tags)


def generate_twitter_card_meta(
    title: str,
    description: str,
    image_url: Optional[str] = None,
    card_type: str = "summary_large_image",
    twitter_site: Optional[str] = None,
) -> str:
    """
    Generuje Twitter Card meta tagy.
    """
    twitter_tags = [
        f'<meta name="twitter:card" content="{card_type}">',
        f'<meta name="twitter:title" content="{_escape_attr(title)}">',
        f'<meta name="twitter:description" content="{_escape_attr(description[:200])}">',
    ]
    
    if image_url:
        twitter_tags.append(f'<meta name="twitter:image" content="{image_url}">')
    
    if twitter_site:
        twitter_tags.append(f'<meta name="twitter:site" content="{twitter_site}">')
    
    return '\n'.join(twitter_tags)


# =====================================================
# SITEMAP GENEROVÁNÍ
# =====================================================
def generate_sitemap_xml(
    articles: List[dict],
    output_path: str,
) -> str:
    """
    Generuje sitemap.xml.
    
    Args:
        articles: List of dicts with 'filename', 'created', 'is_archive'
        output_path: Cesta k výstupnímu souboru
    """
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset.set('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9')
    
    # Hlavní stránka /news/
    url_elem = ET.SubElement(urlset, 'url')
    ET.SubElement(url_elem, 'loc').text = f"{NEWS_BASE_URL}/"
    ET.SubElement(url_elem, 'changefreq').text = 'hourly'
    ET.SubElement(url_elem, 'priority').text = '1.0'
    ET.SubElement(url_elem, 'lastmod').text = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S+00:00')
    
    # Archiv stránka
    url_elem = ET.SubElement(urlset, 'url')
    ET.SubElement(url_elem, 'loc').text = f"{NEWS_BASE_URL}/archive.html"
    ET.SubElement(url_elem, 'changefreq').text = 'daily'
    ET.SubElement(url_elem, 'priority').text = '0.7'
    
    # Jednotlivé články
    for article in articles:
        filename = article.get('filename', '')
        created = article.get('created', '')
        is_archive = article.get('is_archive', False)
        title = article.get('title', '')
        
        # Sestavení URL
        if is_archive or filename.startswith(ARCHIVE_SUBDIR):
            loc = f"{NEWS_BASE_URL}/{filename}"
        else:
            loc = f"{NEWS_BASE_URL}/{filename}"
        
        url_elem = ET.SubElement(urlset, 'url')
        ET.SubElement(url_elem, 'loc').text = loc
        
        # Priority podle stáří
        priority = '0.8' if not is_archive else '0.5'
        ET.SubElement(url_elem, 'priority').text = priority
        
        # Lastmod
        if created:
            try:
                dt = datetime.strptime(created, '%Y-%m-%d %H:%M:%S')
                lastmod = dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')
                ET.SubElement(url_elem, 'lastmod').text = lastmod
            except:
                pass
        
        # Changefreq
        changefreq = 'weekly' if is_archive else 'daily'
        ET.SubElement(url_elem, 'changefreq').text = changefreq
    
    # Pretty print
    xml_str = ET.tostring(urlset, encoding='unicode')
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent='  ', encoding=None)
    
    # Odstranění prázdných řádků
    lines = [line for line in pretty_xml.split('\n') if line.strip()]
    final_xml = '\n'.join(lines)
    
    # Uložení
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_xml)
    
    return output_path


def generate_news_sitemap_xml(
    articles: List[dict],
    output_path: str,
    max_articles: int = 1000,
) -> str:
    """
    Generuje sitemap-news.xml pro Google News.
    Obsahuje pouze články z posledních 2 dnů (Google News limit).
    """
    from datetime import timedelta
    
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset.set('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9')
    
    cutoff = datetime.now() - timedelta(days=2)
    news_articles = []
    
    for article in articles:
        created = article.get('created', '')
        if created:
            try:
                dt = datetime.strptime(created, '%Y-%m-%d %H:%M:%S')
                if dt >= cutoff:
                    news_articles.append(article)
            except:
                pass
    
    for article in news_articles[:max_articles]:
        filename = article.get('filename', '')
        title = article.get('title', '')
        created = article.get('created', '')
        
        # URL
        is_archive = article.get('is_archive', False)
        if is_archive or filename.startswith(ARCHIVE_SUBDIR):
            loc = f"{NEWS_BASE_URL}/{filename}"
        else:
            loc = f"{NEWS_BASE_URL}/{filename}"
        
        url_elem = ET.SubElement(urlset, 'url')
        ET.SubElement(url_elem, 'loc').text = loc
        
        # News specifické elementy
        news_elem = ET.SubElement(url_elem, 'news:news')
        
        publication = ET.SubElement(news_elem, 'news:publication')
        ET.SubElement(publication, 'news:name').text = SITE_NAME
        ET.SubElement(publication, 'news:language').text = SITE_LANGUAGE
        
        if created:
            try:
                dt = datetime.strptime(created, '%Y-%m-%d %H:%M:%S')
                pub_date = dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')
                ET.SubElement(news_elem, 'news:publication_date').text = pub_date
            except:
                pass
        
        ET.SubElement(news_elem, 'news:title').text = title[:100]
    
    # Pretty print
    xml_str = ET.tostring(urlset, encoding='unicode')
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent='  ', encoding=None)
    
    lines = [line for line in pretty_xml.split('\n') if line.strip()]
    final_xml = '\n'.join(lines)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_xml)
    
    return output_path


# =====================================================
# LLMS.TXT PRO AI DISCOVERY
# =====================================================
def generate_llms_txt(
    output_path: str,
    articles: Optional[List[dict]] = None,
) -> str:
    """
    Generuje llms.txt soubor pro AI/LLM discovery.
    
    Viz: https://llmstxt.org/
    """
    content = f"""# {SITE_NAME}

> {SITE_DESCRIPTION}

## O webu

{SITE_NAME} je nezávislý zpravodajský portál zaměřený na Bitcoin, kryptoměny a blockchain technologie. Poskytujeme aktuální zprávy, analýzy a vzdělávací obsah v českém jazyce.

## Hlavní sekce

- [Novinky]({NEWS_BASE_URL}/) - Aktuální zprávy z kryptosvěta
- [Archiv]({NEWS_BASE_URL}/archive.html) - Starší články
- [Hlavní stránka]({SITE_URL}/) - Domovská stránka webu

## Zaměření obsahu

- Bitcoin a kryptoměny
- Blockchain technologie
- DeFi (decentralizované finance)
- NFT a digitální aktiva
- Regulace a právní aspekty
- Investice a obchodování

## Technické informace

- Jazyk: Čeština ({SITE_LANGUAGE})
- Region: {TARGET_REGION}
- Aktualizace: Průběžně (několikrát denně)
- Formát: HTML stránky s JSON-LD strukturovanými daty

## Sitemap

- [sitemap.xml]({NEWS_BASE_URL}/sitemap.xml) - Kompletní sitemap
- [sitemap-news.xml]({NEWS_BASE_URL}/sitemap-news.xml) - Google News sitemap

## Kontakt

Web: {SITE_URL}

## Licence

Obsah je chráněn autorským právem. Pro citace a sdílení dodržujte standardní novinářské postupy.

---
Generováno: {datetime.now(CZ_TZ).strftime('%Y-%m-%d %H:%M')}
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return output_path


# =====================================================
# POMOCNÉ FUNKCE
# =====================================================
def _escape_attr(text: str) -> str:
    """Escapuje text pro HTML atributy."""
    if not text:
        return ""
    return (
        text
        .replace('&', '&amp;')
        .replace('"', '&quot;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
    )


def generate_canonical_tag(url: str) -> str:
    """Generuje canonical link tag."""
    return f'<link rel="canonical" href="{url}">'


def generate_robots_meta(
    index: bool = True,
    follow: bool = True,
    max_snippet: Optional[int] = None,
    max_image_preview: str = "large",
) -> str:
    """Generuje robots meta tag."""
    directives = []
    
    directives.append("index" if index else "noindex")
    directives.append("follow" if follow else "nofollow")
    
    if max_snippet is not None:
        directives.append(f"max-snippet:{max_snippet}")
    
    if max_image_preview:
        directives.append(f"max-image-preview:{max_image_preview}")
    
    return f'<meta name="robots" content="{", ".join(directives)}">'


def generate_hreflang_tags(url: str, language: str = "cs") -> str:
    """Generuje hreflang tagy pro vícejazyčné weby."""
    return f'''<link rel="alternate" hreflang="{language}" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">'''


def extract_keywords_from_text(text: str, max_keywords: int = 10) -> List[str]:
    """
    Extrahuje klíčová slova z textu pomocí jednoduché frekvenční analýzy.
    """
    from collections import Counter
    
    # Stopwords pro češtinu
    stopwords = {
        'a', 'i', 'o', 'u', 'v', 'na', 'je', 'se', 'že', 'to', 'do', 'za',
        'pro', 've', 'po', 'ze', 'ale', 'jak', 'tak', 'nebo', 'při', 'by',
        'jeho', 'jsou', 'být', 'má', 'více', 'také', 'pouze', 'této', 'jako',
        'který', 'která', 'které', 'kterou', 'jejich', 'mezi', 'může', 'již',
        'před', 'podle', 'však', 'nové', 'nový', 'nová', 'další', 'tento',
        'the', 'a', 'an', 'of', 'to', 'in', 'is', 'for', 'on', 'with', 'that',
        'and', 'or', 'by', 'from', 'as', 'at', 'be', 'was', 'are', 'have', 'has',
    }
    
    # Tokenizace
    words = re.findall(r'\b[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{3,}\b', text.lower())
    
    # Filtrování stopwords
    filtered = [w for w in words if w not in stopwords]
    
    # Počítání frekvencí
    freq = Counter(filtered)
    
    # Top N klíčových slov
    return [word for word, _ in freq.most_common(max_keywords)]


# =====================================================
# RSS FEED GENERÁTOR
# =====================================================
def generate_rss_feed(items: List[dict], max_items: int = 50) -> str:
    """
    Generuje RSS 2.0 feed pro novinky.
    
    Args:
        items: Seznam článků z state.json
        max_items: Maximální počet položek ve feedu
        
    Returns:
        XML string RSS feedu
    """
    from xml.sax.saxutils import escape
    
    now = datetime.now(CZ_TZ)
    pub_date = now.strftime("%a, %d %b %Y %H:%M:%S %z")
    
    # Seřaď podle data (nejnovější první)
    sorted_items = sorted(
        [i for i in items if not i.get("archived", False)],
        key=lambda x: x.get("created_ts", 0),
        reverse=True
    )[:max_items]
    
    # RSS hlavička
    rss = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
    <title>{escape(SITE_NAME)} - Bitcoin novinky</title>
    <link>{NEWS_BASE_URL}/</link>
    <description>{escape(SITE_DESCRIPTION)}</description>
    <language>{SITE_LANGUAGE}</language>
    <lastBuildDate>{pub_date}</lastBuildDate>
    <pubDate>{pub_date}</pubDate>
    <ttl>60</ttl>
    <atom:link href="{NEWS_BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
        <url>{SITE_URL}/images/logo.png</url>
        <title>{escape(SITE_NAME)}</title>
        <link>{SITE_URL}</link>
    </image>
'''
    
    # Položky
    for item in sorted_items:
        title = escape(item.get("title", "Bez názvu"))
        url = f'{NEWS_BASE_URL}/{item.get("filename", "")}'
        description = escape(item.get("perex", item.get("title", "")))
        
        # Datum publikace
        created_ts = item.get("created_ts", 0)
        if created_ts:
            item_date = datetime.fromtimestamp(created_ts, tz=CZ_TZ)
        else:
            item_date = now
        item_pub_date = item_date.strftime("%a, %d %b %Y %H:%M:%S %z")
        
        # Kategorie
        category = item.get("category", "Kryptoměny")
        
        rss += f'''    <item>
        <title>{title}</title>
        <link>{url}</link>
        <guid isPermaLink="true">{url}</guid>
        <pubDate>{item_pub_date}</pubDate>
        <description>{description}</description>
        <category>{escape(category)}</category>
        <dc:creator>{escape(SITE_NAME)}</dc:creator>
    </item>
'''
    
    rss += '''</channel>
</rss>'''
    
    return rss


def generate_atom_feed(items: List[dict], max_items: int = 50) -> str:
    """
    Generuje Atom feed pro novinky.
    """
    from xml.sax.saxutils import escape
    
    now = datetime.now(CZ_TZ)
    updated = now.strftime("%Y-%m-%dT%H:%M:%S%z")
    # Oprava formátu timezone pro Atom
    updated = updated[:-2] + ":" + updated[-2:]
    
    sorted_items = sorted(
        [i for i in items if not i.get("archived", False)],
        key=lambda x: x.get("created_ts", 0),
        reverse=True
    )[:max_items]
    
    atom = f'''<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>{escape(SITE_NAME)} - Bitcoin novinky</title>
    <link href="{NEWS_BASE_URL}/" rel="alternate"/>
    <link href="{NEWS_BASE_URL}/atom.xml" rel="self"/>
    <id>{NEWS_BASE_URL}/</id>
    <updated>{updated}</updated>
    <subtitle>{escape(SITE_DESCRIPTION)}</subtitle>
    <author>
        <name>{escape(SITE_NAME)}</name>
        <uri>{SITE_URL}</uri>
    </author>
'''
    
    for item in sorted_items:
        title = escape(item.get("title", "Bez názvu"))
        url = f'{NEWS_BASE_URL}/{item.get("filename", "")}'
        summary = escape(item.get("perex", item.get("title", "")))
        
        created_ts = item.get("created_ts", 0)
        if created_ts:
            item_date = datetime.fromtimestamp(created_ts, tz=CZ_TZ)
        else:
            item_date = now
        item_updated = item_date.strftime("%Y-%m-%dT%H:%M:%S%z")
        item_updated = item_updated[:-2] + ":" + item_updated[-2:]
        
        atom += f'''    <entry>
        <title>{title}</title>
        <link href="{url}"/>
        <id>{url}</id>
        <updated>{item_updated}</updated>
        <summary>{summary}</summary>
    </entry>
'''
    
    atom += '''</feed>'''
    
    return atom


# =====================================================
# PING VYHLEDÁVAČŮ PRO INDEXACI
# =====================================================
def ping_search_engines(sitemap_url: str) -> dict:
    """
    Pingne vyhledávače o nové sitemap pro rychlejší indexaci.
    POZNÁMKA: Google sitemap ping byl deprecated v lednu 2024.
    
    Args:
        sitemap_url: URL sitemap.xml
        
    Returns:
        Dict s výsledky pingů
    """
    import urllib.request
    import urllib.parse
    
    results = {}
    
    # Google - DEPRECATED od ledna 2024
    # Použij Google Search Console pro indexaci
    results['google'] = "deprecated"
    results['google_note'] = "Použij Google Search Console pro indexaci"
    
    # Bing
    try:
        bing_url = f"https://www.bing.com/ping?sitemap={urllib.parse.quote(sitemap_url)}"
        req = urllib.request.Request(bing_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            results['bing'] = response.status == 200
    except Exception as e:
        results['bing'] = False
        results['bing_error'] = str(e)
    
    # Seznam.cz
    try:
        seznam_url = f"https://search.seznam.cz/ping?sitemap={urllib.parse.quote(sitemap_url)}"
        req = urllib.request.Request(seznam_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            results['seznam'] = response.status == 200
    except Exception:
        results['seznam'] = False
    
    return results


def ping_indexnow(urls: List[str], host: str = None) -> bool:
    """
    Použije IndexNow API pro rychlou indexaci nových URL.
    Podporuje: Bing, Yandex, Seznam.cz
    
    Args:
        urls: Seznam nových URL k indexaci
        host: Hostname webu
        
    Returns:
        True pokud úspěch
    """
    import urllib.request
    import json as json_module
    
    if not urls:
        return True
    
    if not host:
        host = SITE_URL.replace("https://", "").replace("http://", "")
    
    # IndexNow endpoint (Bing)
    payload = {
        "host": host,
        "urlList": urls[:10000],  # Max 10000 URL
    }
    
    try:
        data = json_module.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            "https://www.bing.com/indexnow",
            data=data,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status in (200, 202)
    except Exception:
        return False
