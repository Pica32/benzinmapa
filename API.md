# BenzinMapa.cz — API dokumentace

Veřejné API pro orientační průměrné ceny pohonných hmot v České republice.

Vhodné jako doplňková orientační služba (např. zobrazení aktuální průměrné
ceny PHM řidičům ve fleet management platformě).

---

## Endpoint

```
GET https://benzinmapa.cz/api/average-prices/
```

- **Metoda:** `GET`
- **Autentizace:** žádná (veřejný endpoint)
- **CORS:** povoleno pro všechny domény (`Access-Control-Allow-Origin: *`)
- **Formát odpovědi:** `application/json; charset=utf-8`
- **Pozn.:** URL je s koncovým lomítkem. Volání bez lomítka
  (`/api/average-prices`) skončí přesměrováním 308 na verzi s lomítkem.

---

## Příklad odpovědi (HTTP 200)

```json
{
  "source": "BenzinMapa.cz",
  "country": "CZ",
  "currency": "CZK",
  "unit": "Kč/l",
  "last_updated": "2026-06-09T05:22:17Z",
  "total_stations": 2546,
  "averages": {
    "natural_95": 41.8,
    "natural_98": 45.2,
    "nafta": 42.2,
    "lpg": 19.5
  },
  "details": [
    { "fuel_type": "natural_95", "label": "Natural 95", "avg": 41.8, "count": 932, "avg_formatted": "41,80 Kč" },
    { "fuel_type": "natural_98", "label": "Natural 98", "avg": 45.2, "count": 410, "avg_formatted": "45,20 Kč" },
    { "fuel_type": "nafta",      "label": "Nafta",      "avg": 42.2, "count": 940, "avg_formatted": "42,20 Kč" },
    { "fuel_type": "lpg",        "label": "LPG",        "avg": 19.5, "count": 318, "avg_formatted": "19,50 Kč" }
  ],
  "disclaimer": "Orientační průměrné ceny pohonných hmot v ČR. Data: BenzinMapa.cz."
}
```

---

## Popis polí

| Pole | Typ | Popis |
|------|-----|-------|
| `source` | string | Zdroj dat — vždy `"BenzinMapa.cz"`. |
| `country` | string | Kód země (ISO 3166-1 alpha-2) — `"CZ"`. |
| `currency` | string | Měna cen (ISO 4217) — `"CZK"`. |
| `unit` | string | Jednotka — `"Kč/l"` (Kč za litr). |
| `last_updated` | string | Čas poslední aktualizace dat (ISO 8601, UTC). |
| `total_stations` | number | Celkový počet sledovaných čerpacích stanic v ČR. |
| `averages` | object | Průměrná cena podle druhu paliva (číslo v Kč/l). |
| `averages.natural_95` | number | Benzín Natural 95. |
| `averages.natural_98` | number | Benzín Natural 98. |
| `averages.nafta` | number | Motorová nafta. |
| `averages.lpg` | number | LPG. |
| `details[]` | array | Detail za jednotlivá paliva (vhodné pro vykreslení v UI). |
| `details[].fuel_type` | string | Strojový klíč paliva (`natural_95` \| `natural_98` \| `nafta` \| `lpg`). |
| `details[].label` | string | Lidský název paliva (CZ). |
| `details[].avg` | number | Průměrná cena (Kč/l). |
| `details[].count` | number | Počet stanic s ověřenou reálnou cenou, ze kterých je průměr spočítán. |
| `details[].avg_formatted` | string | Cena naformátovaná v české lokalizaci, např. `"41,80 Kč"`. |
| `disclaimer` | string | Upozornění, že jde o orientační data. |

---

## Aktualizace dat a cache

- Data se obnovují **3× denně** (cca 05:00, 10:00, 15:00 SEČ/SELČ).
- Odpověď je na CDN cachovaná **1 hodinu** (`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`).
- Doporučené volání z vaší strany: **maximálně 1× za hodinu** (častější volání vrací totéž z cache). Hodnoty si na své straně klidně cachujte.

---

## Příklady volání

### curl
```bash
curl -s https://benzinmapa.cz/api/average-prices/
```

### JavaScript (fetch)
```js
const res = await fetch('https://benzinmapa.cz/api/average-prices/');
const data = await res.json();
console.log(data.averages.natural_95); // 41.8
```

### Python (requests)
```python
import requests
data = requests.get('https://benzinmapa.cz/api/average-prices/').json()
print(data['averages']['nafta'])  # 42.2
```

---

## Podmínky použití

- Data jsou poskytována jako **orientační** (průměrné ceny za ČR), bez záruky
  přesnosti pro konkrétní čerpací stanici v konkrétní okamžik.
- Při zobrazení dat prosíme o uvedení zdroje **„BenzinMapa.cz"** (ideálně
  s odkazem na https://benzinmapa.cz).
- Pro vyšší objemy volání, vyhrazený přístup nebo rozšířená data
  (ceny podle krajů / měst, případně přístup k jednotlivým stanicím)
  nás kontaktujte — rádi domluvíme individuální podmínky.

---

*Kontakt: provoz BenzinMapa.cz*
