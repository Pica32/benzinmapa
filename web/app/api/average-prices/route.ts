import { NextResponse } from 'next/server';
import { getNationalAverages, formatPrice } from '@/lib/data';

// Statická data se obnovují 3× denně (commit scraperu → redeploy).
// CDN cache na 1 h, stale-while-revalidate 24 h — Wedos/Vercel ji jen servíruje.
export const revalidate = 3600;

export async function GET() {
  const { averages, details, total_stations, last_updated } = getNationalAverages();

  return NextResponse.json(
    {
      source: 'BenzinMapa.cz',
      country: 'CZ',
      currency: 'CZK',
      unit: 'Kč/l',
      last_updated,
      total_stations,
      averages,
      details: details.map(d => ({ ...d, avg_formatted: formatPrice(d.avg) })),
      disclaimer: 'Orientační průměrné ceny pohonných hmot v ČR. Data: BenzinMapa.cz.',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
