export interface Station {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  region: string;
  services: string[];
  opening_hours: string;
}

export interface StationPrice {
  station_id: string;
  natural_95: number | null;
  natural_98: number | null;
  nafta: number | null;
  lpg: number | null;
  source: string;
  reported_at: string;
}

export interface StationWithPrice extends Station {
  price: StationPrice | null;
}

export interface Stats {
  last_updated: string;
  averages: {
    natural_95: number;
    natural_98: number;
    nafta: number;
    lpg: number;
  };
  cheapest_today: {
    natural_95: { price: number; station_id: string; city: string };
    nafta: { price: number; station_id: string; city: string };
    lpg: { price: number; station_id: string; city: string };
  };
  trend_7d: {
    natural_95: number;
    nafta: number;
    lpg: number;
  };
  total_stations: number;
  stations_updated_today: number;
}

export type FuelType = 'natural_95' | 'natural_98' | 'nafta' | 'lpg';

export const FUEL_LABELS: Record<FuelType, string> = {
  natural_95: 'Natural 95',
  natural_98: 'Natural 98',
  nafta: 'Nafta',
  lpg: 'LPG',
};

export const BRANDS = [
  'Benzina', 'MOL', 'Shell', 'OMV', 'Eurobit',
  'Robin Oil', 'Terno', 'EuroOil', 'Tank-ONO', 'Slovnaft',
];

export const CITIES = [
  { name: 'Praha', slug: 'praha', lat: 50.0755, lng: 14.4378 },
  { name: 'Brno', slug: 'brno', lat: 49.1951, lng: 16.6068 },
  { name: 'Ostrava', slug: 'ostrava', lat: 49.8209, lng: 18.2625 },
  { name: 'Plzeň', slug: 'plzen', lat: 49.7506, lng: 13.3697 },
  { name: 'Liberec', slug: 'liberec', lat: 50.7671, lng: 15.0561 },
  { name: 'Olomouc', slug: 'olomouc', lat: 49.5938, lng: 17.2509 },
  { name: 'České Budějovice', slug: 'ceske-budejovice', lat: 48.9747, lng: 14.4744 },
  { name: 'Hradec Králové', slug: 'hradec-kralove', lat: 50.2104, lng: 15.8325 },
  { name: 'Ústí nad Labem', slug: 'usti-nad-labem', lat: 50.6607, lng: 14.0325 },
  { name: 'Pardubice', slug: 'pardubice', lat: 50.0343, lng: 15.7812 },
  { name: 'Zlín', slug: 'zlin', lat: 49.2243, lng: 17.6628 },
  { name: 'Karlovy Vary', slug: 'karlovy-vary', lat: 50.2324, lng: 12.8713 },
];

export const REGIONS = [
  { name: 'Jihomoravský kraj', slug: 'jihomoravsky' },
  { name: 'Jihočeský kraj', slug: 'jihocesky' },
  { name: 'Karlovarský kraj', slug: 'karlovarsky' },
  { name: 'Královéhradecký kraj', slug: 'kralovehradecky' },
  { name: 'Liberecký kraj', slug: 'liberecky' },
  { name: 'Moravskoslezský kraj', slug: 'moravskoslezsky' },
  { name: 'Olomoucký kraj', slug: 'olomoucky' },
  { name: 'Pardubický kraj', slug: 'pardubicky' },
  { name: 'Plzeňský kraj', slug: 'plzensky' },
  { name: 'Středočeský kraj', slug: 'stredocesky' },
  { name: 'Ústecký kraj', slug: 'ustecky' },
  { name: 'Vysočina', slug: 'vysocina' },
  { name: 'Zlínský kraj', slug: 'zlinsky' },
  { name: 'Hlavní město Praha', slug: 'praha' },
];
