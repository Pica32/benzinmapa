import { Station, StationPrice, StationWithPrice, Stats, FuelType, FUEL_LABELS, BrandPage } from '@/types';
import fs from 'fs';
import path from 'path';

function readJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function getStations(): Station[] {
  try {
    const data = readJson<{ stations: Station[] }>('stations_latest.json');
    return data.stations;
  } catch {
    return [];
  }
}

export function getPrices(): StationPrice[] {
  try {
    const data = readJson<{ prices: StationPrice[] }>('prices_latest.json');
    return data.prices;
  } catch {
    return [];
  }
}

export function getStats(): Stats | null {
  try {
    return readJson<Stats>('stats_latest.json');
  } catch {
    return null;
  }
}

export function getStationsWithPrices(): StationWithPrice[] {
  const stations = getStations();
  const prices = getPrices();
  const priceMap = new Map<string, StationPrice>();
  prices.forEach(p => priceMap.set(p.station_id, p));
  return stations.map(s => ({ ...s, price: priceMap.get(s.id) ?? null }));
}

export function getStationById(id: string): StationWithPrice | null {
  return getStationsWithPrices().find(s => s.id === id) ?? null;
}

export function getStationsByCity(city: string): StationWithPrice[] {
  const normalized = city.toLowerCase();
  return getStationsWithPrices().filter(s =>
    s.city.toLowerCase().includes(normalized) ||
    slugify(s.city) === normalized
  );
}

export function getStationsByBrand(brand: BrandPage): StationWithPrice[] {
  const keys = brand.brandKeys.map(k => k.toLowerCase());
  return getStationsWithPrices().filter(s =>
    keys.some(k => s.brand.toLowerCase().includes(k))
  );
}

export function getStationsByRegion(region: string): StationWithPrice[] {
  const normalized = region.toLowerCase();
  return getStationsWithPrices().filter(s =>
    slugify(s.region) === normalized
  );
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function isPriceStale(reportedAt: string): boolean {
  return Date.now() - new Date(reportedAt).getTime() > TWO_DAYS_MS;
}

// Preferovaná minima — filtrují nereálná čísla (LPG místo Natural apod.)
const PRICE_MIN: Record<FuelType, number> = {
  natural_95: 35,
  natural_98: 38,
  nafta:      34,
  lpg:        15,
};

// Pokud by preferované minimum vyřadilo >80 % stanic, sníž práh na 10. percentil
function adaptiveMin(prices: number[], preferred: number): number {
  if (!prices.length) return preferred;
  const aboveMin = prices.filter(p => p >= preferred).length;
  if (aboveMin / prices.length >= 0.20) return preferred; // dost stanic prošlo → nech limit
  const sorted = [...prices].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.10)]; // 10. percentil jako záchranný práh
}

export function getCheapestStations(fuelType: FuelType, limit = 10): StationWithPrice[] {
  const cutoff = Date.now() - TWO_DAYS_MS;
  const allWithPrices = getStationsWithPrices().filter(s =>
    s.price?.[fuelType] != null &&
    s.price?.source === 'mbenzin.cz' &&
    new Date(s.price.reported_at).getTime() > cutoff
  );
  const allPrices = allWithPrices.map(s => s.price![fuelType] as number);
  const min = adaptiveMin(allPrices, PRICE_MIN[fuelType]);

  return allWithPrices
    .filter(s => (s.price![fuelType] as number) >= min)
    .sort((a, b) => (a.price![fuelType] ?? 999) - (b.price![fuelType] ?? 999))
    .slice(0, limit);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getPriceCategory(price: number, allPrices: number[]): 'cheap' | 'mid' | 'expensive' {
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)];
  const p80 = sorted[Math.floor(sorted.length * 0.8)];
  if (price <= p20) return 'cheap';
  if (price >= p80) return 'expensive';
  return 'mid';
}

export function formatPrice(price: number | null): string {
  if (price == null) return 'N/A';
  return price.toFixed(2).replace('.', ',') + ' Kč';
}

// Skupiny značek pro srovnávací tabulku — počítáno z reálných dat mbenzin.cz
const BRAND_GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Eurobit / Robin Oil', keys: ['eurobit', 'robin'] },
  { label: 'Kaufland / Lidl',     keys: ['kaufland', 'lidl'] },
  { label: 'EuroOil',              keys: ['eurooil', 'euroil'] },
  { label: 'MOL',                  keys: ['mol'] },
  { label: 'Benzina ORLEN',        keys: ['benzina', 'orlen'] },
  { label: 'OMV',                  keys: ['omv'] },
  { label: 'Shell',                keys: ['shell'] },
];

export interface BrandStat {
  label: string;
  diff: number;        // odchylka v Kč od národního průměru (záporné = levnější)
  diffLabel: string;   // formátované např. "−1,2 Kč" / "+0,8 Kč" / "±0 Kč"
  avg: number;         // průměrná cena dané skupiny
  count: number;       // počet stanic s cenou v dané skupině
}

/**
 * Spočítá průměrnou odchylku ceny daného paliva pro každou skupinu značek
 * vůči národnímu průměru. Pouze z čerstvých dat mbenzin.cz.
 */
export function getBrandStats(fuelType: FuelType): BrandStat[] {
  const cutoff = Date.now() - TWO_DAYS_MS;
  const fresh = getStationsWithPrices().filter(s =>
    s.price?.[fuelType] != null &&
    s.price?.source === 'mbenzin.cz' &&
    new Date(s.price.reported_at).getTime() > cutoff
  );

  const allPrices = fresh.map(s => s.price![fuelType] as number);
  if (allPrices.length === 0) return [];
  const min = adaptiveMin(allPrices, PRICE_MIN[fuelType]);
  const valid = fresh.filter(s => (s.price![fuelType] as number) >= min);
  const validPrices = valid.map(s => s.price![fuelType] as number);
  const nationalAvg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

  const results: BrandStat[] = [];
  for (const group of BRAND_GROUPS) {
    const matching = valid.filter(s => {
      const b = s.brand.toLowerCase();
      return group.keys.some(k => b.includes(k));
    });
    if (matching.length < 3) continue; // skupiny pod 3 stanice neukazujem (statisticky nedůvěryhodné)
    const avg = matching.reduce((a, s) => a + (s.price![fuelType] as number), 0) / matching.length;
    const diff = avg - nationalAvg;
    const rounded = Math.round(diff * 10) / 10; // zaokrouhlení na desetinky
    let diffLabel: string;
    if (Math.abs(rounded) < 0.05) diffLabel = '±0 Kč';
    else diffLabel = `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(1).replace('.', ',')} Kč`;
    results.push({ label: group.label, diff: rounded, diffLabel, avg, count: matching.length });
  }
  return results.sort((a, b) => a.diff - b.diff);
}

/**
 * Spočítá BrandStat pro libovolnou skupinu definovanou seznamem `brandKeys`
 * (např. položky z BRAND_PAGES). Vrací mapu slug → BrandStat. Skupiny pod
 * 3 stanice nezahrnuje (statisticky nedůvěryhodné).
 */
export function getBrandStatsByKeys(
  fuelType: FuelType,
  groups: { slug: string; brandKeys: string[] }[]
): Map<string, BrandStat> {
  const cutoff = Date.now() - TWO_DAYS_MS;
  const fresh = getStationsWithPrices().filter(s =>
    s.price?.[fuelType] != null &&
    s.price?.source === 'mbenzin.cz' &&
    new Date(s.price.reported_at).getTime() > cutoff
  );
  const map = new Map<string, BrandStat>();
  const allPrices = fresh.map(s => s.price![fuelType] as number);
  if (allPrices.length === 0) return map;
  const min = adaptiveMin(allPrices, PRICE_MIN[fuelType]);
  const valid = fresh.filter(s => (s.price![fuelType] as number) >= min);
  const validPrices = valid.map(s => s.price![fuelType] as number);
  const nationalAvg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

  for (const g of groups) {
    const matching = valid.filter(s => {
      const b = s.brand.toLowerCase();
      return g.brandKeys.some(k => b.includes(k.toLowerCase()));
    });
    if (matching.length < 3) continue;
    const avg = matching.reduce((a, s) => a + (s.price![fuelType] as number), 0) / matching.length;
    const diff = avg - nationalAvg;
    const rounded = Math.round(diff * 10) / 10;
    let diffLabel: string;
    if (Math.abs(rounded) < 0.05) diffLabel = '±0 Kč';
    else diffLabel = `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(1).replace('.', ',')} Kč`;
    map.set(g.slug, { label: g.slug, diff: rounded, diffLabel, avg, count: matching.length });
  }
  return map;
}

export interface NationalAverage {
  fuel_type: FuelType;
  label: string;
  avg: number;    // průměrná cena v Kč/l
  count: number;  // počet stanic s čerstvou reálnou cenou (mbenzin.cz, < 2 dny)
}

export interface NationalAverages {
  averages: Record<FuelType, number>;
  details: NationalAverage[];
  total_stations: number;
  last_updated: string;
}

/**
 * Národní průměr ceny pro každý druh paliva — počítáno z čerstvých reálných
 * cen mbenzin.cz (< 2 dny) se stejným adaptiveMin filtrem jako zbytek webu.
 * Když pro palivo nejsou čerstvá reálná data, použije se předpočítaný průměr
 * ze scraperu (stats_latest.json). Žádná hardcoded čísla.
 */
export function getNationalAverages(): NationalAverages {
  const cutoff = Date.now() - TWO_DAYS_MS;
  const withPrices = getStationsWithPrices();
  const stats = getStats();
  const fuels: FuelType[] = ['natural_95', 'natural_98', 'nafta', 'lpg'];

  const averages = {} as Record<FuelType, number>;
  const details: NationalAverage[] = [];

  for (const fuel of fuels) {
    const freshPrices = withPrices
      .filter(s =>
        s.price?.[fuel] != null &&
        s.price?.source === 'mbenzin.cz' &&
        new Date(s.price.reported_at).getTime() > cutoff
      )
      .map(s => s.price![fuel] as number);

    let avg: number;
    let count: number;
    if (freshPrices.length > 0) {
      const min = adaptiveMin(freshPrices, PRICE_MIN[fuel]);
      const valid = freshPrices.filter(p => p >= min);
      avg = valid.reduce((a, b) => a + b, 0) / valid.length;
      count = valid.length;
    } else {
      // fallback: předpočítaný průměr ze scraperu
      avg = stats?.averages[fuel] ?? 0;
      count = 0;
    }

    const rounded = Math.round(avg * 100) / 100;
    averages[fuel] = rounded;
    details.push({ fuel_type: fuel, label: FUEL_LABELS[fuel], avg: rounded, count });
  }

  return {
    averages,
    details,
    total_stations: stats?.total_stations ?? withPrices.length,
    last_updated: stats?.last_updated ?? new Date().toISOString(),
  };
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return 'aktuálně';
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  return `před ${Math.floor(hours / 24)} dny`;
}
