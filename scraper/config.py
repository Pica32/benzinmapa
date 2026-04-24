"""
config.py — Konfigurace News Bota pro BenzinMapa.cz
RSS → AI generace → SEO optimalizace → FTP upload na Wedos
"""

import os
from dataclasses import dataclass
from typing import Dict, List
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
OUT_DIR = os.path.join(BASE_DIR, "output_articles")
ARCHIVE_SUBDIR = "archiv"
ARCHIVE_DIR = os.path.join(OUT_DIR, ARCHIVE_SUBDIR)
STATE_PATH = os.path.join(BASE_DIR, "state.json")
DEDUPE_INDEX_PATH = os.path.join(BASE_DIR, "dedupe_index.json")

load_dotenv(os.path.join(BASE_DIR, ".env"))

CZ_TZ = ZoneInfo("Europe/Prague")

# =====================================================
# SITE CONFIG – BenzinMapa.cz
# =====================================================
SITE_URL = (os.getenv("SITE_URL", "https://benzinmapa.cz") or "https://benzinmapa.cz").rstrip("/")
NEWS_BASE_URL = f"{SITE_URL}/aktuality"
SITE_NAME = os.getenv("SITE_NAME", "BenzinMapa.cz")
SITE_DESCRIPTION = os.getenv("SITE_DESCRIPTION", "Nejlevnější benzín a nafta v ČR – aktuální ceny pohonných hmot, novinky a analýzy")
SITE_LANGUAGE = "cs"
SITE_LOCALE = "cs_CZ"
TARGET_REGION = "CZ"

REGION_CONTEXT = {
    "CZ": "Zaměř se na dopad pro české řidiče a motoristy. Uváděj ceny v Kč/l. Zmiň ČR kontext – ČESMAD, MPO, SÚKL, čerpací sítě Benzina ORLEN, MOL, Shell, OMV.",
}

# =====================================================
# FTP CONFIG – Wedos
# =====================================================
FTP_HOST = os.getenv("FTP_HOST") or ""          # např. ftp.wedos.com nebo IP
FTP_USER = os.getenv("FTP_USER") or ""           # Wedos FTP uživatel
FTP_PASS = os.getenv("FTP_PASS") or ""           # Wedos FTP heslo
FTP_TARGET_DIR = os.getenv("FTP_TARGET_DIR", "/subdomains/aktuality/public_html")

CHMOD_DIR = "755"
CHMOD_FILE = "644"

# =====================================================
# AI CONFIG – Google Gemini (primární, levné/zdarma)
# =====================================================
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()

_gemini_keys_csv = (os.getenv("GEMINI_API_KEYS") or os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_API_KEYS: List[str] = [k.strip() for k in _gemini_keys_csv.split(",") if k.strip()] if _gemini_keys_csv else []
GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else ""
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

XAI_API_URL = "https://api.x.ai/v1/chat/completions"
XAI_MODEL = os.getenv("XAI_MODEL", "grok-3-mini")
XAI_API_KEY = os.getenv("XAI_API_KEY", "").strip()

OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_keys_csv = (os.getenv("OPENROUTER_API_KEYS") or "").strip()
OPENROUTER_API_KEYS: List[str] = [k.strip() for k in _keys_csv.split(",") if k.strip()] if _keys_csv else (
    [os.getenv("OPENROUTER_API_KEY", "").strip()] if os.getenv("OPENROUTER_API_KEY") else []
)

USER_AGENT = "benzinmapa-news-bot/1.0"

USE_AI = True
REQUIRE_AI_FOR_PUBLISH = True

AI_DELAY_SEC = 60.0
GEMINI_DELAY_SEC = 15.0
AI_TIMEOUT_SEC = 90
AI_MAX_RETRIES = 6

OPENROUTER_TIMEOUT_SEC = AI_TIMEOUT_SEC
OPENROUTER_MAX_RETRIES = AI_MAX_RETRIES

DRY_RUN = os.getenv("DRY_RUN", "false").lower() in ("true", "1", "yes")

# =====================================================
# PUBLIKAČNÍ LIMITY
# =====================================================
KEEP_LATEST_ON_HOME = 20
MAX_NEW_PER_RUN = 3
MIN_PUBLISH_INTERVAL_SEC = 3 * 60 * 60   # každé 3 hodiny

CANDIDATE_KEEP_RATIO = 0.5
MIN_TITLE_LEN = 15
MIN_SUMMARY_TEXT_LEN = 80
NUM_ENTRIES_PER_FEED = 30

# =====================================================
# DEDUPLIKACE
# =====================================================
SIMHASH_THRESHOLD = 3
JACCARD_THRESHOLD = 0.60
TOPIC_GUARD_DAYS = 2
DEDUPE_INDEX_MAX_ITEMS = 300
MIN_ENTITY_OVERLAP = 2

# =====================================================
# RSS FEEDY – paliva, energie, doprava, ekonomika ČR
# =====================================================
@dataclass
class FeedSource:
    name: str
    url: str
    weight: float = 1.0


FEEDS: List[FeedSource] = [
    # Ekonomika / energie / ceny v ČR
    FeedSource("iDnes Ekonomika",    "https://servis.idnes.cz/rss.aspx?c=eko",        1.30),
    FeedSource("E15.cz",             "https://www.e15.cz/rss",                         1.25),
    FeedSource("ČT24 Ekonomika",     "https://ct24.ceskatelevize.cz/rss/ekonomika",    1.20),
    FeedSource("Novinky Ekonomika",  "https://www.novinky.cz/rss/ekonomika",           1.15),
    FeedSource("Aktuálně Ekonomika", "https://zpravy.aktualne.cz/rss/ekonomika/",      1.10),
    FeedSource("Hospodářské Noviny", "https://servis.ihned.cz/rss/",                   1.20),
    FeedSource("AutoRevue",          "https://www.autorevue.cz/rss",                   1.30),
    FeedSource("Auto.cz",            "https://www.auto.cz/rss",                        1.25),
    # Ropa / energie světově
    FeedSource("Reuters Energy",     "https://feeds.reuters.com/reuters/businessNews",  1.10),
    FeedSource("OilPrice.com",       "https://oilprice.com/rss/main",                  1.15),
]

# =====================================================
# KEYWORD SCORING – relevantní pro paliva / dopravu
# =====================================================
KEYWORD_WEIGHT: Dict[str, float] = {
    # Paliva
    "benzín": 3.0, "benzin": 3.0, "nafta": 3.0, "natural 95": 2.8,
    "lpg": 2.5, "cng": 2.3, "pohonné hmoty": 2.8,
    "čerpací stanice": 2.6, "čerpačka": 2.4, "pumpa": 2.0,
    # Ceny
    "zdražení": 2.8, "zdražuje": 2.8, "zlevnění": 2.8, "zlevňuje": 2.6,
    "cena paliva": 2.8, "ceny paliv": 2.8, "rekord": 2.5,
    # Ropa
    "ropa": 2.5, "brent": 2.3, "wti": 2.0, "barrel": 1.8,
    "rafinárie": 2.2, "spotřební daň": 2.0,
    # Sítě
    "benzina": 2.0, "orlen": 1.8, "mol": 1.8, "shell": 1.8, "omv": 1.8,
    "eurobit": 1.6, "robin oil": 1.6,
    # Doprava
    "motorista": 1.8, "řidiči": 1.8, "automobil": 1.5, "auto": 1.3,
    "dálniční poplatek": 1.6, "elektromobil": 1.5,
    # Ekonomika
    "inflace": 1.8, "zdražování": 2.0, "energie": 1.8,
    # Breaking
    "breaking": 2.5, "urgent": 2.2, "dnes": 2.0,
}

ALLOWED_HTML_TAGS = {
    "p", "h2", "h3", "ul", "ol", "li", "strong", "em", "a", "br",
    "blockquote", "code", "pre", "span", "div", "table", "tr", "td", "th",
}

ALLOWED_HTML_ATTRS = {
    "a": ["href", "rel", "target", "title"],
    "span": ["class"],
    "div": ["class"],
}

KNOWN_ENTITIES = {
    "organizations": [
        "Benzina", "ORLEN", "MOL", "Shell", "OMV", "Eurobit", "Robin Oil",
        "Tank-ONO", "EuroOil", "Terno", "Kaufland", "Lidl",
        "MPO", "ČNB", "ČESMAD", "Autoklubu ČR",
        "Saudi Aramco", "OPEC", "IEA",
    ],
    "people": [],
    "products": [
        "Natural 95", "Natural 98", "Nafta", "LPG", "CNG",
        "Euro 6", "AdBlue", "E10",
    ],
}


def print_config():
    print("=" * 60)
    print("BENZINMAPA NEWS BOT – KONFIGURACE")
    print("=" * 60)
    print(f"SITE_URL:       {SITE_URL}")
    print(f"AI_PROVIDER:    {AI_PROVIDER}")
    print(f"GEMINI_KEYS:    {len(GEMINI_API_KEYS)} klíč(ů)")
    print(f"XAI_KEY:        {'nastaven' if XAI_API_KEY else 'CHYBÍ'}")
    print(f"FTP_HOST:       {FTP_HOST or 'NENASTAVENO'}")
    print(f"FTP_TARGET_DIR: {FTP_TARGET_DIR}")
    print(f"DRY_RUN:        {DRY_RUN}")
    print(f"INTERVAL:       každé {MIN_PUBLISH_INTERVAL_SEC // 3600}h")
    print("=" * 60)
