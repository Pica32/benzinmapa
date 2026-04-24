import { Station, StationPrice, StationWithPrice, Stats, FuelType } from '@/types';
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

export function getStationsByRegion(region: string): StationWithPrice[] {
  const normalized = region.toLowerCase();
  return getStationsWithPrices().filter(s =>
    slugify(s.region) === normalized
  );
}

export function getCheapestStations(fuelType: FuelType, limit = 10): StationWithPrice[] {
  return getStationsWithPrices()
    .filter(s => s.price?.[fuelType] != null)
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

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  return `před ${Math.floor(hours / 24)} dny`;
}
