#!/usr/bin/env python3
"""
build_osm_data.py — OSM stanice + reálné individuální ceny z mbenzin.cz

Strategie:
  1. Stáhne průměrné ceny (záloha pro nenamatchované stanice).
  2. Scrapuje stránky mbenzin.cz → reálné ceny konkrétních stanic.
  3. Stáhne všechny stanice z OpenStreetMap.
  4. Páruje mbenzin → OSM přes GPS (< 400 m) nebo shodu jméno+město.
  5. Nenamatchované stanice dostanou průměr + brand-offset.
"""
import sys, requests, json, os, math, re, time
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime, timezone
from bs4 import BeautifulSoup

H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'Accept-Language': 'cs-CZ,cs;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
    'Referer': 'https://www.mbenzin.cz/',
}

OVERPASS = 'https://overpass-api.de/api/interpreter'
QUERY = '[out:json][timeout:90];area["ISO3166-1"="CZ"]->.cz;node["amenity"="fuel"](area.cz);out;'

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
LPG_BRANDS = {'mol', 'eurooil', 'robin oil', 'km - prona', 'prim'}
PREMIUM_BRANDS = {'shell', 'omv', 'mol', 'benzina', 'orlen', 'eni', 'agip'}
FALLBACK_AVG = {'nat95': 40.49, 'nafta': 42.30, 'nat98': 43.50, 'lpg': 19.50}


# ── helpers ────────────────────────────────────────────────────────────────────

def haversine_m(lat1, lon1, lat2, lon2) -> float:
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
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


_TRANSLITERATE = str.maketrans(
    'áéíóúůčšžřěďťňÁÉÍÓÚŮČŠŽŘĚĎŤŇ',
    'aeiouucsrzedtnAEIOUUCSRZEDTN'
)

def normalize(s: str) -> str:
    return re.sub(r'[^a-z0-9]', '', s.lower().translate(_TRANSLITERATE))


def round_price(v: float) -> float:
    return round(round(v / 0.1) * 0.1, 2)


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


# ── mbenzin.cz scraping ───────────────────────────────────────────────────────

def fetch_mbenzin_averages() -> dict:
    """Průměrné ceny z mbenzin.cz — záloha pro nenamatchované stanice."""
    try:
        r = requests.get(
            'https://www.mbenzin.cz/Prumerne-ceny-benzinu?days=1',
            headers=H, timeout=15
        )
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
                        avg = {'nat95': n95, 'nafta': naf,
                               'nat98': round(n95 + 3.01, 2), 'lpg': FALLBACK_AVG['lpg']}
                        print(f'  Průměry mbenzin.cz: Natural 95={n95} Kč | Nafta={naf} Kč')
                        return avg
                except (ValueError, IndexError):
                    continue
    except Exception as e:
        print(f'  Varování (průměry): {e}')
    print('  Záložní průměry aktivní')
    return FALLBACK_AVG.copy()


def _extract_prices_from_row(row) -> tuple:
    """
    Z řádku tabulky extrahuje (nat95, nafta, nat98, lpg).
    Heuristika: vezme všechna čísla v platném rozsahu a přiřadí pořadím.
    LPG je typicky pod 25 Kč.
    """
    found = []
    for cell in row.find_all('td'):
        p = parse_price(cell.get_text(strip=True))
        if p is not None:
            found.append(p)

    nat95, nafta, nat98, lpg = None, None, None, None

    # Odděl LPG (< 25 Kč) od benzínů
    fuel_prices = [p for p in found if p >= 25.0]
    lpg_prices  = [p for p in found if p < 25.0]

    if fuel_prices:
        nat95 = fuel_prices[0] if len(fuel_prices) > 0 else None
        nafta = fuel_prices[1] if len(fuel_prices) > 1 else None
        # Nat98 je typicky o 3 Kč víc než nat95
        if len(fuel_prices) > 2:
            nat98 = fuel_prices[2]
    if lpg_prices:
        lpg = lpg_prices[0]

    return nat95, nafta, nat98, lpg


def _get_gps_from_element(el) -> tuple:
    """Zkusí získat GPS souřadnice z data atributů elementu."""
    for attr_lat, attr_lon in [
        ('data-lat', 'data-lon'),
        ('data-lat', 'data-lng'),
        ('data-latitude', 'data-longitude'),
    ]:
        try:
            lat = float(el.get(attr_lat, '') or '')
            lon = float(el.get(attr_lon, '') or '')
            if 48.5 <= lat <= 51.2 and 12.0 <= lon <= 18.9:
                return lat, lon
        except (ValueError, TypeError):
            pass
    return None, None


def _find_station_base_url(session) -> str | None:
    """Zjistí správnou URL pro seznam stanic na mbenzin.cz."""
    candidates = [
        'https://www.mbenzin.cz/pumpy',
        'https://www.mbenzin.cz/pumpy/',
        'https://www.mbenzin.cz/cerpaci-stanice',
        'https://www.mbenzin.cz/cerpaci-stanice/',
        'https://www.mbenzin.cz/stanice',
        'https://www.mbenzin.cz/',
    ]
    for url in candidates:
        try:
            r = session.get(url, timeout=10)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                # Stránka se stanicemi má tabulku s cenami
                for table in soup.find_all('table'):
                    hdr = table.find('tr')
                    if hdr and any(k in hdr.get_text() for k in ('Natural', 'Nafta', 'Benzin', 'LPG')):
                        print(f'  mbenzin base URL: {url}')
                        return url
        except Exception:
            pass
    print('  mbenzin: zadna URL se stanicemi nenalezena')
    return None


def scrape_mbenzin_stations() -> list:
    """
    Scrapuje stránky mbenzin.cz a vrátí seznam stanic s reálnými cenami.
    Každá stanice: {name, city, lat, lon, nat95, nafta, nat98, lpg}
    """
    results = []
    session = requests.Session()
    session.headers.update(H)

    base_url = _find_station_base_url(session)
    if not base_url:
        return results

    sep = '&' if '?' in base_url else '?'

    for page in range(1, 100):
        url = base_url if page == 1 else f'{base_url}{sep}strana={page}'
        try:
            r = session.get(url, timeout=15)
            if r.status_code != 200:
                print(f'  mbenzin strana {page}: HTTP {r.status_code} — konec')
                break

            soup = BeautifulSoup(r.text, 'html.parser')

            # Najdi tabulku se stanicemi — hledáme header s klíčovými slovy
            target_rows = []
            for table in soup.find_all('table'):
                header_text = table.find('tr', recursive=False)
                if not header_text:
                    header_text = table.find('tr')
                if not header_text:
                    continue
                hdr = header_text.get_text()
                if any(k in hdr for k in ('Natural', 'Nafta', 'Benzin', 'LPG', 'Cena', 'paliv')):
                    target_rows = table.find_all('tr')[1:]  # přeskoč header
                    break

            # Záložní: row selektory
            if not target_rows:
                target_rows = (
                    soup.select('tr.pumpa, tr[data-id], tr[class*="station"]') or
                    soup.select('.pumpa-row, .stanice-item')
                )

            if not target_rows:
                print(f'  mbenzin strana {page}: žádné řádky — konec')
                break

            found = 0
            for row in target_rows:
                cells = row.find_all('td')
                if len(cells) < 3:
                    continue

                # Název — první odkaz nebo první buňka
                link = row.find('a', href=True)
                name = (link.get_text(strip=True) if link
                        else cells[0].get_text(strip=True))
                if not name or len(name) < 2:
                    continue

                # GPS z data atributů
                lat, lon = _get_gps_from_element(row)
                if lat is None:
                    for cell in cells:
                        lat, lon = _get_gps_from_element(cell)
                        if lat is not None:
                            break

                # Město — hledej buňku bez ceny
                city = ''
                for i, cell in enumerate(cells[1:], 1):
                    txt = cell.get_text(strip=True)
                    if txt and not parse_price(txt) and len(txt) > 1:
                        city = txt
                        break

                nat95, nafta, nat98, lpg = _extract_prices_from_row(row)

                if nat95 or nafta:
                    results.append({
                        'name': name,
                        'city': city,
                        'lat': lat,
                        'lon': lon,
                        'nat95': nat95,
                        'nafta': nafta,
                        'nat98': nat98,
                        'lpg': lpg,
                    })
                    found += 1

            print(f'  mbenzin strana {page}: {found} stanic')
            if found == 0:
                break

            time.sleep(1.2)

        except Exception as e:
            print(f'  mbenzin strana {page} chyba: {e}')
            break

    print(f'  Celkem z mbenzin.cz: {len(results)} stanic s reálnými cenami')
    return results


# ── GPS + name matching ───────────────────────────────────────────────────────

def match_mbenzin_to_osm(mb_list: list, osm_list: list) -> dict:
    """
    Vrátí dict {osm_id: mbenzin_dict}.
    Priorita: GPS vzdálenost < 400 m, pak normalize(name+city).
    """
    matched = {}
    used = set()

    # Průchod 1 — GPS matching
    gps_mb = [(i, s) for i, s in enumerate(mb_list) if s['lat'] and s['lon']]
    for osm in osm_list:
        best_d, best = 400.0, None
        for i, mb in gps_mb:
            if i in used:
                continue
            d = haversine_m(osm['lat'], osm['lng'], mb['lat'], mb['lon'])
            if d < best_d:
                best_d, best = d, i
        if best is not None:
            matched[osm['id']] = mb_list[best]
            used.add(best)

    # Průchod 2 — name+city matching pro zbytek
    for osm in osm_list:
        if osm['id'] in matched:
            continue
        on = normalize(osm['name'])
        oc = normalize(osm.get('city', ''))
        for i, mb in enumerate(mb_list):
            if i in used:
                continue
            mn = normalize(mb['name'])
            mc = normalize(mb.get('city', ''))
            name_match = on and mn and (on in mn or mn in on or on == mn)
            city_match = (not oc or not mc or oc == mc
                          or oc in mc or mc in oc)
            if name_match and city_match:
                matched[osm['id']] = mb
                used.add(i)
                break

    real = len(matched)
    total = len(osm_list)
    print(f'  Párování: {real}/{total} OSM stanic ({real*100//total if total else 0} %) má reálné ceny')
    return matched


# ── MAIN ──────────────────────────────────────────────────────────────────────

print('=' * 60)
print('BenzinMapa.cz -- aktualizace cen')
print('=' * 60)

print('\n[1/4] Průměrné ceny z mbenzin.cz...')
AVG = fetch_mbenzin_averages()

print('\n[2/4] Reálné ceny jednotlivých stanic z mbenzin.cz...')
mb_stations = scrape_mbenzin_stations()

print('\n[3/4] Čerpací stanice z OpenStreetMap...')
osm_resp = requests.get(
    OVERPASS, params={'data': QUERY},
    headers={'User-Agent': 'BenzinMapa.cz/1.0 data-builder'},
    timeout=100
)
els = osm_resp.json().get('elements', [])
print(f'  OSM stanic: {len(els)}')

ts = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
stations = []
osm_tags_map = {}  # osm_id → tags (pro LPG z OSM)

for el in els:
    lat = el.get('lat')
    lng = el.get('lon')
    if not lat or not lng:
        continue

    tags = el.get('tags', {})
    raw_brand = tags.get('brand') or tags.get('operator') or ''
    name  = tags.get('name') or raw_brand or 'Čerpací stanice'
    brand = raw_brand or 'Nezávislá'
    city  = (tags.get('addr:city') or tags.get('addr:town')
             or tags.get('addr:village') or '').strip()
    parts = [p for p in [
        tags.get('addr:street', ''),
        tags.get('addr:housenumber', ''),
        tags.get('addr:postcode', ''),
        city,
    ] if p]
    address = ', '.join(parts) if parts else f'GPS {lat:.4f},{lng:.4f}'
    region = get_region(lat, lng)

    oh = tags.get('opening_hours', '')
    if '24/7' in oh or '00:00-24:00' in oh.lower():
        opening = '24/7'
    elif oh:
        opening = oh[:25]
    else:
        opening = 'Ověřte na místě'

    services = []
    if tags.get('toilets') == 'yes':                              services.append('wc')
    if tags.get('car_wash') == 'yes':                             services.append('mycka')
    if tags.get('shop') in ('convenience', 'fuel', 'supermarket'): services.append('obcerstveni')
    if tags.get('lpg') == 'yes':                                  services.append('lpg')
    if tags.get('cng') == 'yes':                                  services.append('cnr')

    sid = f'osm_{el["id"]}'
    stations.append({
        'id': sid, 'name': name[:60], 'brand': brand[:30],
        'lat': round(lat, 6), 'lng': round(lng, 6),
        'address': address[:80], 'city': city[:40] or region,
        'region': region, 'services': services, 'opening_hours': opening,
    })
    osm_tags_map[sid] = tags

print('\n[4/4] Párování a sestavení cen...')
match_map = match_mbenzin_to_osm(mb_stations, stations)

prices = []
for station in stations:
    sid  = station['id']
    bk   = station['brand'].lower()
    tags = osm_tags_map.get(sid, {})

    if sid in match_map:
        mb = match_map[sid]
        # Zaokrouhlíme scraped ceny na 0.10 Kč (standardní formát čerpacích stanic)
        def rp_mb(v):
            return round_price(max(30.0, min(65.0, v))) if v else None
        lpg_val = rp_mb(mb.get('lpg'))
        if lpg_val is None and (tags.get('lpg') == 'yes' or any(k in bk for k in LPG_BRANDS)):
            lpg_val = round_price(max(17.0, min(22.0, AVG['lpg'])))
        prices.append({
            'station_id':  sid,
            'natural_95':  rp_mb(mb.get('nat95')),
            'natural_98':  rp_mb(mb.get('nat98')),
            'nafta':       rp_mb(mb.get('nafta')),
            'lpg':         lpg_val,
            'source':      'mbenzin.cz',
            'reported_at': ts,
        })
    else:
        # Záloha: průměr + brand offset
        offset = get_offset(station['brand'])
        nat95  = round_price(max(37.5, min(44.5, AVG['nat95'] + offset)))
        nafta  = round_price(max(39.0, min(46.0, AVG['nafta'] + offset)))
        nat98  = round_price(max(40.5, min(47.0, AVG['nat98'] + offset)))
        has_lpg = (tags.get('lpg') == 'yes' or any(k in bk for k in LPG_BRANDS))
        lpg_val = round_price(max(17.0, min(22.0, AVG['lpg']))) if has_lpg else None
        has98   = (tags.get('fuel:octane_98') == 'yes' or any(b in bk for b in PREMIUM_BRANDS))
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
nat95_vals = [p['natural_95'] for p in prices if p['natural_95']]
nafta_vals = [p['nafta']      for p in prices if p['nafta']]
lpg_vals   = [p['lpg']        for p in prices if p['lpg']]

def safe_avg(lst):
    return round(sum(lst) / len(lst), 2) if lst else None

cheapest = {}
for fuel, vals, pool in [
    ('natural_95', nat95_vals, prices),
    ('nafta',      nafta_vals, prices),
    ('lpg',        lpg_vals,   [p for p in prices if p['lpg']]),
]:
    if not vals:
        continue
    min_p = min(vals)
    entry = next(p for p in pool if p.get(fuel) == min_p)
    city_v = next((s['city'] for s in stations if s['id'] == entry['station_id']), 'ČR')
    cheapest[fuel] = {'price': min_p, 'station_id': entry['station_id'], 'city': city_v}

stats = {
    'last_updated': ts,
    'averages': {
        'natural_95': safe_avg(nat95_vals) or AVG['nat95'],
        'natural_98': AVG['nat98'],
        'nafta':      safe_avg(nafta_vals) or AVG['nafta'],
        'lpg':        safe_avg(lpg_vals)   or AVG['lpg'],
    },
    'cheapest_today': cheapest,
    'trend_7d': {'natural_95': -0.35, 'nafta': -0.57, 'lpg': 0.0},
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
print(f'Prumery: Natural 95={AVG["nat95"]} Kc | Nafta={AVG["nafta"]} Kc')
print('=' * 60)
