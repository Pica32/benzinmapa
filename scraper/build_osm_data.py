#!/usr/bin/env python3
"""
build_osm_data.py — OSM stanice + reálné individuální ceny z mbenzin.cz

Strategie:
  1. Ze sitemap mbenzin.cz stáhne všechny URL měst (463+).
  2. Pro každé město stáhne seznam stanic s cenami + detail URL.
  3. Deduplikuje podle ID stanice.
  4. Načte GPS cache (gps_cache.json) — při první spuštění prázdná.
  5. Pro stanice bez GPS stáhne detail stránku a extrahuje GPS, uloží do cache.
  6. Páruje mbenzin stanice → OSM přes GPS (< 400 m) nebo name+city.
  7. Nenamatchované OSM stanice dostanou průměr + brand-offset.
"""
import sys, requests, json, os, math, re, time
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime, timezone
from bs4 import BeautifulSoup

H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'Accept-Language': 'cs-CZ,cs;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
}

OVERPASS  = 'https://overpass-api.de/api/interpreter'
QUERY     = '[out:json][timeout:90];area["ISO3166-1"="CZ"]->.cz;node["amenity"="fuel"](area.cz);out;'
MBENZIN   = 'https://www.mbenzin.cz'
SITEMAP   = 'https://www.mbenzin.cz/sitemap.xml'
GPS_CACHE = os.path.join(os.path.dirname(__file__), 'gps_cache.json')

BRAND_OFFSET = {
    'shell': +1.20, 'omv': +1.00,
    'benzina': +0.40, 'orlen': +0.40, 'mol': +0.10,
    'eurooil': -0.40, 'eurobit': -0.60,
    'robin oil': -0.50, 'robin': -0.50,
    'km - prona': -0.80, 'km-prona': -0.80,
    'globus': -1.00, 'kaufland': -1.10,
    'albert': -0.80, 'lidl': -1.20, 'penny': -0.90,
    'tank ono': -0.70, 'avia': -0.60,
    'prim': -0.50, 'innogy': -0.30, 'tesco': -0.90,
}
LPG_BRANDS     = {'mol', 'eurooil', 'robin oil', 'km - prona', 'prim'}
PREMIUM_BRANDS = {'shell', 'omv', 'mol', 'benzina', 'orlen', 'eni', 'agip'}
FALLBACK_AVG   = {'nat95': 40.50, 'nafta': 42.10, 'nat98': 43.50, 'lpg': 19.50}


# ── helpers ────────────────────────────────────────────────────────────────────

def haversine_m(lat1, lon1, lat2, lon2) -> float:
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))


def parse_price(text: str):
    if not text:
        return None
    cleaned = re.sub(r'[^\d,.]', '', str(text)).replace(',', '.')
    if not cleaned or cleaned in ('.', ','):
        return None
    try:
        v = float(cleaned)
        return v if 25.0 <= v <= 65.0 else None
    except ValueError:
        return None


def round_price(v: float) -> float:
    return round(round(v / 0.1) * 0.1, 2)


_TRANS = str.maketrans(
    'áéíóúůčšžřěďťňÁÉÍÓÚŮČŠŽŘĚĎŤŇ',
    'aeiouucsrzedtnAEIOUUCSRZEDTN'
)

def normalize(s: str) -> str:
    return re.sub(r'[^a-z0-9]', '', s.lower().translate(_TRANS))


def get_offset(brand_raw: str) -> float:
    bk = (brand_raw or '').lower()
    for k, v in BRAND_OFFSET.items():
        if k in bk:
            return v
    return 0.0


def get_region(lat, lng) -> str:
    if lng < 13.5 and lat > 50.1: return 'Karlovarský kraj'
    if lng < 13.5:                 return 'Plzeňský kraj'
    if lat > 50.8:                 return 'Liberecký kraj'
    if lat > 50.5 and lng < 14.5: return 'Ústecký kraj'
    if lat > 50.1 and lng < 14.3: return 'Hlavní město Praha'
    if lat > 49.9 and lng < 14.9: return 'Středočeský kraj'
    if lat > 49.8 and lng < 15.0: return 'Středočeský kraj'
    if lat > 50.0 and lng < 16.5: return 'Královéhradecký kraj'
    if lat > 49.9 and lng > 15.5: return 'Pardubický kraj'
    if lat > 49.3 and lng < 14.5: return 'Jihočeský kraj'
    if lat > 49.5 and lng > 18.0: return 'Moravskoslezský kraj'
    if lat > 49.5 and lng > 17.0: return 'Olomoucký kraj'
    if lat > 49.0 and lng > 16.5: return 'Jihomoravský kraj'
    if lat < 49.5 and lng > 17.0: return 'Zlínský kraj'
    if lng > 15.5 and lat < 49.8: return 'Vysočina'
    return 'Středočeský kraj'


# ── mbenzin.cz averages ───────────────────────────────────────────────────────

def fetch_mbenzin_averages(session) -> dict:
    """Průměrné ceny z mbenzin.cz — záloha pro nenamatchované stanice."""
    try:
        r = session.get(f'{MBENZIN}/Prumerne-ceny-benzinu?days=1', timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        for t in soup.find_all('table'):
            rows = t.find_all('tr')
            if len(rows) < 2:
                continue
            hdr = rows[0].get_text()
            if 'Datum' not in hdr and 'Dnes' not in hdr:
                continue
            for row in rows[1:]:
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if len(cells) < 3:
                    continue
                try:
                    n95 = float(cells[1].replace(',', '.').replace('\xa0', ''))
                    naf = float(cells[2].replace(',', '.').replace('\xa0', ''))
                    if 35 <= n95 <= 55 and 35 <= naf <= 55:
                        avg = {
                            'nat95': round_price(n95),
                            'nafta': round_price(naf),
                            'nat98': round_price(n95 + 3.0),
                            'lpg':   round_price(FALLBACK_AVG['lpg']),
                        }
                        print(f'  Prumery mbenzin.cz: Natural 95={avg["nat95"]} Kc | Nafta={avg["nafta"]} Kc')
                        return avg
                except (ValueError, IndexError):
                    continue
    except Exception as e:
        print(f'  Varovani (prumery): {e}')
    print('  Zalozni prumery aktivni')
    return FALLBACK_AVG.copy()


# ── sitemap + city/brand page scraping ───────────────────────────────────────

def get_mbenzin_listing_urls(session) -> list:
    """Ze sitemap mbenzin.cz vrátí URL všech stránek měst + značek."""
    try:
        r = session.get(SITEMAP, timeout=15)
        all_urls = re.findall(r'<loc>(https://www\.mbenzin\.cz/[^<]+)</loc>', r.text)
        # Stránky měst: končí slovem bez dalšího lomítka, začínají Ceny-benzinu-a-nafty/
        city_pages = [
            u for u in all_urls
            if re.match(r'https://www\.mbenzin\.cz/Ceny-benzinu-a-nafty/[A-Z][^/]+$', u)
        ]
        # Brand stránky
        brand_pages = [u for u in all_urls if '/Retezce/' in u]
        listing_urls = list(dict.fromkeys(city_pages + brand_pages))
        print(f'  Listing URL: {len(listing_urls)} ({len(city_pages)} mest + {len(brand_pages)} znacek)')
        return listing_urls
    except Exception as e:
        print(f'  Chyba sitemap: {e}')
        return []


def scrape_listing_page(session, url: str) -> list:
    """
    Ze stránky seznam stanic (město/značka) extrahuje stanice s cenami + detail URL.
    Vrátí seznam dicts: {id, name, city, detail_url, nat95, nafta}
    """
    try:
        r = session.get(url, timeout=12)
        if r.status_code != 200:
            return []
        soup = BeautifulSoup(r.text, 'html.parser')
        results = []
        for tbl in soup.find_all('table'):
            rows = tbl.find_all('tr')
            if len(rows) < 2:
                continue
            hdr = rows[0].get_text()
            if not any(k in hdr for k in ('Cena', 'cena', 'Nafta', 'Natural', 'benz')):
                continue
            for row in rows[1:]:
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if len(cells) < 2:
                    continue
                # Hledej link na detail stanice
                link_el = row.find('a', href=True)
                if not link_el:
                    continue
                href = link_el['href'].lstrip('/')
                # Získej ID ze suffixu URL: .../18088
                id_match = re.search(r'/(\d{4,6})$', href)
                if not id_match:
                    continue
                station_id = id_match.group(1)
                detail_url = f'{MBENZIN}/Ceny-benzinu-a-nafty/{href.split("Ceny-benzinu-a-nafty/")[-1]}'
                # Název a město ze jména stanice
                full_name = cells[0]
                # Format: "Brand Name- City, address" nebo "Brand Name"
                parts = full_name.split('-', 1)
                name = parts[0].strip()
                city = ''
                if len(parts) > 1:
                    city_part = parts[1].strip()
                    city = city_part.split(',')[0].strip()
                # Ceny
                nat95 = None
                nafta = None
                for cell in cells[1:]:
                    p = parse_price(cell)
                    if p is not None:
                        if nat95 is None:
                            nat95 = p
                        elif nafta is None:
                            nafta = p
                        else:
                            break
                if nat95 is None and nafta is None:
                    continue
                results.append({
                    'id':         station_id,
                    'name':       name,
                    'city':       city,
                    'detail_url': detail_url,
                    'nat95':      nat95,
                    'nafta':      nafta,
                    'nat98':      None,
                    'lpg':        None,
                    'lat':        None,
                    'lon':        None,
                })
            break  # první tabulka se stanicemi stačí
        return results
    except Exception:
        return []


def scrape_all_mbenzin_stations(session, listing_urls: list) -> dict:
    """
    Projde všechny listing URL a vrátí dict {station_id: station_dict}.
    De-duplikuje podle ID — každá stanice jen jednou.
    """
    stations_by_id: dict = {}
    total_pages = len(listing_urls)
    for i, url in enumerate(listing_urls):
        batch = scrape_listing_page(session, url)
        for s in batch:
            sid = s['id']
            if sid not in stations_by_id:
                stations_by_id[sid] = s
        if (i + 1) % 50 == 0 or (i + 1) == total_pages:
            print(f'  [{i+1}/{total_pages}] stanic celkem: {len(stations_by_id)}')
        time.sleep(0.6)
    return stations_by_id


# ── GPS cache + enrichment ────────────────────────────────────────────────────

def load_gps_cache() -> dict:
    """Načte cache GPS {station_id: [lat, lon]} ze souboru."""
    if os.path.exists(GPS_CACHE):
        try:
            with open(GPS_CACHE, encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_gps_cache(cache: dict):
    with open(GPS_CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f)


def fetch_gps_from_detail(session, url: str):
    """Stáhne detail stránku stanice a extrahuje GPS. Vrátí (lat, lon) nebo (None, None)."""
    try:
        r = session.get(url, timeout=12)
        if r.status_code != 200:
            return None, None
        # GPS pattern: dvě desetinná čísla s 6+ desetinnými místy (CZ: 48-52, 12-19)
        matches = re.findall(r'(4[89]\.\d{5,}|5[012]\.\d{5,}),\s*(1[2-9]\.\d{5,})', r.text)
        if matches:
            lat, lon = float(matches[0][0]), float(matches[0][1])
            if 48.5 <= lat <= 51.2 and 12.0 <= lon <= 18.9:
                return lat, lon
    except Exception:
        pass
    return None, None


def enrich_stations_with_gps(session, stations_by_id: dict) -> dict:
    """
    Pro každou stanici bez GPS: zkusí cache, jinak stáhne detail stránku.
    Vrátí aktualizovaný dict stanic.
    """
    cache = load_gps_cache()
    need_fetch = [s for s in stations_by_id.values() if s['lat'] is None and s['id'] not in cache]
    cached_hits = sum(1 for s in stations_by_id.values() if s['id'] in cache)
    print(f'  GPS cache: {len(cache)} zaznamu ({cached_hits} pouzitelnych)')
    print(f'  GPS potreba stahnout: {len(need_fetch)} stanic')

    # Aplikuj cache na existující stanice
    for s in stations_by_id.values():
        if s['id'] in cache:
            s['lat'], s['lon'] = cache[s['id']]

    # Stáhni GPS pro zbytek
    fetched = 0
    for s in need_fetch:
        lat, lon = fetch_gps_from_detail(session, s['detail_url'])
        cache[s['id']] = [lat, lon]
        if lat is not None:
            s['lat'], s['lon'] = lat, lon
            fetched += 1
        time.sleep(0.8)
        if fetched % 100 == 0 and fetched > 0:
            save_gps_cache(cache)
            print(f'  GPS progress: {fetched}/{len(need_fetch)}')

    save_gps_cache(cache)
    gps_total = sum(1 for s in stations_by_id.values() if s['lat'] is not None)
    print(f'  GPS celkem: {gps_total}/{len(stations_by_id)} stanic')
    return stations_by_id


# ── GPS + name matching ───────────────────────────────────────────────────────

def match_mbenzin_to_osm(mb_stations: list, osm_list: list) -> dict:
    """
    Vrátí dict {osm_id: mbenzin_dict}.
    Priorita:
      1. GPS vzdálenost < 300 m
      2. normalize(name+city) přesná shoda
      3. normalize(brand) + normalize(city) — fuzzy brand matching
    """
    matched = {}
    used_mb = set()

    mb_with_gps = [(i, s) for i, s in enumerate(mb_stations) if s.get('lat')]

    # Průchod 1 — GPS matching < 300 m
    for osm in osm_list:
        best_d, best_i = 300.0, None
        for i, mb in mb_with_gps:
            if i in used_mb:
                continue
            d = haversine_m(osm['lat'], osm['lng'], mb['lat'], mb['lon'])
            if d < best_d:
                best_d, best_i = d, i
        if best_i is not None:
            matched[osm['id']] = mb_stations[best_i]
            used_mb.add(best_i)

    # Průchod 2 — name+city normalizovaná shoda
    for osm in osm_list:
        if osm['id'] in matched:
            continue
        on = normalize(osm['name'])
        oc = normalize(osm.get('city', ''))
        for i, mb in enumerate(mb_stations):
            if i in used_mb:
                continue
            mn = normalize(mb['name'])
            mc = normalize(mb.get('city', ''))
            name_ok = on and mn and (on in mn or mn in on)
            city_ok = not oc or not mc or oc == mc or oc in mc or mc in oc
            if name_ok and city_ok:
                matched[osm['id']] = mb
                used_mb.add(i)
                break

    real = len(matched)
    total = len(osm_list)
    print(f'  Parovani: {real}/{total} OSM stanic ({real*100//total if total else 0}%) ma realne ceny')
    return matched


# ── MAIN ──────────────────────────────────────────────────────────────────────

print('=' * 60)
print('BenzinMapa.cz -- aktualizace cen')
print('=' * 60)

session = requests.Session()
session.headers.update(H)

print('\n[1/5] Prumerne ceny z mbenzin.cz...')
AVG = fetch_mbenzin_averages(session)

print('\n[2/5] Stanice z mbenzin.cz (sitemap -> mesta/znacky)...')
listing_urls = get_mbenzin_listing_urls(session)
stations_by_id = scrape_all_mbenzin_stations(session, listing_urls)
print(f'  Unikatnich stanic z mbenzin.cz: {len(stations_by_id)}')

print('\n[3/5] GPS obohaceni (cache + detail stranky)...')
stations_by_id = enrich_stations_with_gps(session, stations_by_id)
mb_list = list(stations_by_id.values())

print('\n[4/5] Cerpaci stanice z OpenStreetMap...')
osm_resp = requests.get(
    OVERPASS, params={'data': QUERY},
    headers={'User-Agent': 'BenzinMapa.cz/1.0 data-builder'},
    timeout=100
)
els = osm_resp.json().get('elements', [])
print(f'  OSM stanic: {len(els)}')

ts = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
stations = []
osm_tags_map = {}

for el in els:
    lat = el.get('lat')
    lng = el.get('lon')
    if not lat or not lng:
        continue
    tags      = el.get('tags', {})
    raw_brand = tags.get('brand') or tags.get('operator') or ''
    name      = tags.get('name') or raw_brand or 'Cerpaci stanice'
    brand     = raw_brand or 'Nezavisla'
    city      = (tags.get('addr:city') or tags.get('addr:town') or tags.get('addr:village') or '').strip()
    parts = [p for p in [
        tags.get('addr:street', ''), tags.get('addr:housenumber', ''),
        tags.get('addr:postcode', ''), city,
    ] if p]
    address = ', '.join(parts) if parts else f'GPS {lat:.4f},{lng:.4f}'
    region  = get_region(lat, lng)
    oh = tags.get('opening_hours', '')
    if '24/7' in oh or '00:00-24:00' in oh.lower():
        opening = '24/7'
    elif oh:
        opening = oh[:25]
    else:
        opening = 'Overtes na miste'
    services = []
    if tags.get('toilets') == 'yes':                               services.append('wc')
    if tags.get('car_wash') == 'yes':                              services.append('mycka')
    if tags.get('shop') in ('convenience', 'fuel', 'supermarket'): services.append('obcerstveni')
    if tags.get('lpg') == 'yes':                                   services.append('lpg')
    if tags.get('cng') == 'yes':                                   services.append('cnr')
    sid = f'osm_{el["id"]}'
    stations.append({
        'id': sid, 'name': name[:60], 'brand': brand[:30],
        'lat': round(lat, 6), 'lng': round(lng, 6),
        'address': address[:80], 'city': city[:40] or region,
        'region': region, 'services': services, 'opening_hours': opening,
    })
    osm_tags_map[sid] = tags

print('\n[5/5] Parovani a sestaveni cen...')
match_map = match_mbenzin_to_osm(mb_list, stations)

prices = []
for station in stations:
    sid  = station['id']
    bk   = station['brand'].lower()
    tags = osm_tags_map.get(sid, {})

    if sid in match_map:
        mb = match_map[sid]
        def rp(v):
            return round_price(max(30.0, min(65.0, v))) if v else None
        lpg_val = rp(mb.get('lpg'))
        if lpg_val is None and (tags.get('lpg') == 'yes' or any(k in bk for k in LPG_BRANDS)):
            lpg_val = round_price(AVG['lpg'])
        nat98 = rp(mb.get('nat98'))
        if nat98 is None and any(b in bk for b in PREMIUM_BRANDS):
            nat98 = round_price(max(40.5, min(49.0, (mb.get('nat95') or AVG['nat95']) + 3.0)))
        prices.append({
            'station_id':  sid,
            'natural_95':  rp(mb.get('nat95')),
            'natural_98':  nat98,
            'nafta':       rp(mb.get('nafta')),
            'lpg':         lpg_val,
            'source':      'mbenzin.cz',
            'reported_at': ts,
        })
    else:
        # Záloha: průměr + brand offset — pouze pro stanice kde nemáme data
        offset  = get_offset(station['brand'])
        nat95   = round_price(max(37.5, min(44.5, AVG['nat95'] + offset)))
        nafta   = round_price(max(39.0, min(46.0, AVG['nafta'] + offset)))
        nat98   = round_price(max(40.5, min(47.0, AVG['nat98'] + offset)))
        has_lpg = tags.get('lpg') == 'yes' or any(k in bk for k in LPG_BRANDS)
        lpg_val = round_price(AVG['lpg']) if has_lpg else None
        has98   = tags.get('fuel:octane_98') == 'yes' or any(b in bk for b in PREMIUM_BRANDS)
        prices.append({
            'station_id':  sid,
            'natural_95':  nat95,
            'natural_98':  nat98 if has98 else None,
            'nafta':       nafta,
            'lpg':         lpg_val,
            'source':      'mbenzin-avg-offset',
            'reported_at': ts,
        })

real_count = sum(1 for p in prices if p['source'] == 'mbenzin.cz')
est_count  = len(prices) - real_count
print(f'\n  Vysledek: {len(stations)} stanic')
print(f'  OK Realne ceny (mbenzin.cz): {real_count}')
print(f'  ~  Odhad (prumer + offset):  {est_count}')

# ── statistiky ────────────────────────────────────────────────────────────────
nat95_vals = [p['natural_95'] for p in prices if p['source'] == 'mbenzin.cz' and p['natural_95']]
nafta_vals = [p['nafta']      for p in prices if p['source'] == 'mbenzin.cz' and p['nafta']]
lpg_vals   = [p['lpg']        for p in prices if p['lpg']]

def safe_avg(lst):
    return round_price(sum(lst) / len(lst)) if lst else None

cheapest = {}
for fuel, pool in [
    ('natural_95', [p for p in prices if p['natural_95'] and p['source'] == 'mbenzin.cz']),
    ('nafta',      [p for p in prices if p['nafta']      and p['source'] == 'mbenzin.cz']),
    ('lpg',        [p for p in prices if p['lpg']]),
]:
    if not pool:
        continue
    entry = min(pool, key=lambda p: p[fuel])
    city_v = next((s['city'] for s in stations if s['id'] == entry['station_id']), 'CR')
    cheapest[fuel] = {'price': entry[fuel], 'station_id': entry['station_id'], 'city': city_v}

stats = {
    'last_updated': ts,
    'averages': {
        'natural_95': safe_avg(nat95_vals) or AVG['nat95'],
        'natural_98': AVG['nat98'],
        'nafta':      safe_avg(nafta_vals) or AVG['nafta'],
        'lpg':        safe_avg(lpg_vals)   or AVG['lpg'],
    },
    'cheapest_today': cheapest,
    'trend_7d': {'natural_95': -0.20, 'nafta': -0.40, 'lpg': 0.0},
    'total_stations': len(stations),
    'stations_updated_today': len(prices),
    'real_prices_count': real_count,
    'estimated_prices_count': est_count,
}

# ── uložení ───────────────────────────────────────────────────────────────────
out = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web', 'public', 'data'))
os.makedirs(out, exist_ok=True)

with open(os.path.join(out, 'stations_latest.json'), 'w', encoding='utf-8') as f:
    json.dump({'last_updated': ts, 'stations': stations}, f, ensure_ascii=False)

with open(os.path.join(out, 'prices_latest.json'), 'w', encoding='utf-8') as f:
    json.dump({'last_updated': ts, 'prices': prices}, f, ensure_ascii=False)

with open(os.path.join(out, 'stats_latest.json'), 'w', encoding='utf-8') as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)

print()
for fn in ['stations_latest.json', 'prices_latest.json', 'stats_latest.json']:
    kb = os.path.getsize(os.path.join(out, fn)) // 1024
    print(f'  {fn}: {kb} kB')

print(f'\nHotovo! {real_count} realne + {est_count} odhadove ceny')
print(f'Prumery: Natural 95={stats["averages"]["natural_95"]} Kc | Nafta={stats["averages"]["nafta"]} Kc')
print('=' * 60)
