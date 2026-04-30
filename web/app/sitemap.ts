import { MetadataRoute } from 'next';
import { getStationsWithPrices } from '@/lib/data';
import { CITIES } from '@/types';

const BASE = 'https://benzinmapa.cz';

const AKTUALNE_SLUGS = [
  'trumpova-celni-valka-a-ceny-benzinu-cr-2026',
  'tankovat-v-polsku-nebo-slovensku-2026',
  'proc-je-nafta-drazsi-nez-benzin-2026',
  'vernostni-karty-cerpackich-stanic-srovnani',
  'proc-ceny-benzinu-rostou-2026',
  'co-ovlivnuje-ceny-pohonnych-hmot',
  'rozdil-natural-95-vs-98',
  'jak-usetrit-za-palivo-10-tipu',
  'srovnani-cen-lpg-vs-nafta-2026',
  'dalnicni-vs-mestska-cerpacka',
  'nejlevnejsi-cerpaci-stanice-cr-2026',
  'benzin-vs-diesel-co-je-ekonomictejsi',
];

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const stations = getStationsWithPrices();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE}/nejlevnejsi-benzin`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/nejlevnejsi-nafta`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/aktualne`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/vyvoj-ceny`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  const cityPages: MetadataRoute.Sitemap = CITIES.map(city => ({
    url: `${BASE}/mesto/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));

  // Všechny stanice s cenou – stránky existují (dynamicParams = true, ISR)
  const stationPages: MetadataRoute.Sitemap = stations
    .filter(s => s.price?.natural_95 != null || s.price?.nafta != null)
    .map(s => ({
      url: `${BASE}/stanice/${s.id}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: s.price?.source === 'mbenzin.cz' ? 0.75 : 0.6,
    }));

  const aktualne: MetadataRoute.Sitemap = AKTUALNE_SLUGS.map(slug => ({
    url: `${BASE}/aktualne/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  return [...staticPages, ...cityPages, ...stationPages, ...aktualne];
}
