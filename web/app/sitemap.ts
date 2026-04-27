import { MetadataRoute } from 'next';
import { getStationsWithPrices } from '@/lib/data';
import { CITIES } from '@/types';

const BASE = 'https://benzinmapa.cz';

const BLOG_SLUGS = [
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
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
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

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date('2026-04-20'),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...stationPages, ...blogPages];
}
