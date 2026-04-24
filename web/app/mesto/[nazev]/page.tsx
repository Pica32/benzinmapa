import { getStationsByCity, getStats, getCheapestStations, formatPrice } from '@/lib/data';
import { CityPageJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CITIES } from '@/types';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { MapPin, TrendingDown } from 'lucide-react';

export const revalidate = 21600;

type Props = { params: Promise<{ nazev: string }> };

export async function generateStaticParams() {
  return CITIES.map(c => ({ nazev: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nazev } = await params;
  const city = CITIES.find(c => c.slug === nazev);
  if (!city) return { title: 'Město nenalezeno' };

  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const stations = getStationsByCity(city.name);
  const cheapest95 = stations.filter(s => s.price?.natural_95).sort((a, b) => (a.price!.natural_95 ?? 999) - (b.price!.natural_95 ?? 999))[0];
  const cheapestNafta = stations.filter(s => s.price?.nafta).sort((a, b) => (a.price!.nafta ?? 999) - (b.price!.nafta ?? 999))[0];

  return {
    title: `Nejlevnější benzín v ${city.name} dnes – ${today}`,
    description: `Aktuální ceny pohonných hmot v ${city.name}. ${cheapest95 ? `Nejlevnější Natural 95: ${formatPrice(cheapest95.price!.natural_95)} (${cheapest95.name}). ` : ''}${cheapestNafta ? `Nejlevnější nafta: ${formatPrice(cheapestNafta.price!.nafta)} (${cheapestNafta.name}).` : ''} Přehled všech čerpacích stanic.`,
    alternates: { canonical: `https://benzinmapa.cz/mesto/${nazev}` },
    openGraph: {
      title: `Nejlevnější benzín v ${city.name} dnes`,
      description: `Srovnání cen pohonných hmot v ${city.name}. Aktualizováno dnes.`,
      type: 'website',
    },
  };
}

export default async function MestoPage({ params }: Props) {
  const { nazev } = await params;
  const city = CITIES.find(c => c.slug === nazev);
  if (!city) notFound();

  const stations = getStationsByCity(city.name);
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const faqs = [
    { q: `Kde je dnes nejlevnější benzín v ${city.name}?`, a: `Nejlevnější Natural 95 v ${city.name} najdete v tabulce níže. Data jsou aktualizována každých 6 hodin.` },
    { q: `Kde je nejlevnější nafta v ${city.name}?`, a: `Aktuální nejlevnější ceny nafty v ${city.name} jsou uvedeny v přehledu čerpacích stanic. Použijte filtr pro zobrazení na mapě.` },
    { q: `Kolik stojí benzín v ${city.name}?`, a: `Průměrná cena Natural 95 v ${city.name} se pohybuje kolem ${stats?.averages.natural_95.toFixed(2)} Kč/l. Nafta je průměrně ${stats?.averages.nafta.toFixed(2)} Kč/l.` },
  ];

  const nearbyCity = CITIES.filter(c => c.slug !== nazev).slice(0, 6);

  return (
    <>
      <CityPageJsonLd city={city.name} stations={stations} />
      <FaqJsonLd faqs={faqs} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">{city.name}</span>
        </nav>

        {/* H1 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MapPin className="text-green-600" size={28} />
            Ceny benzínu a nafty v {city.name} – {today}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Přehled aktuálních cen pohonných hmot na {stations.length} čerpacích stanicích v {city.name}.
            Najděte nejlevnější čerpačku a ušetřete při tankování.
          </p>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Natural 95 – průměr', value: stats.averages.natural_95 },
              { label: 'Nafta – průměr', value: stats.averages.nafta },
              { label: 'LPG – průměr', value: stats.averages.lpg },
              { label: 'Sledované stanice', value: stations.length, suffix: 'ks' },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">
                  {typeof value === 'number' && !suffix ? value.toFixed(2).replace('.', ',') : value}
                  <span className="text-sm font-normal text-gray-400 ml-1">{suffix ?? 'Kč'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        <div className="space-y-8 mb-10">
          <CheapestTable stations={stations} fuelType="nafta" city={city.name} />
          <CheapestTable stations={stations} fuelType="natural_95" city={city.name} />
        </div>

        {/* Map link */}
        <div className="bg-green-50 dark:bg-gray-800 rounded-2xl p-6 mb-10 border border-green-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Zobrazit na mapě</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Na interaktivní mapě vidíte všechny stanice v {city.name} barevně označené podle ceny.
          </p>
          <Link
            href={`/?mesto=${city.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <TrendingDown size={16} />
            Otevřít mapu – {city.name}
          </Link>
        </div>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Časté dotazy – {city.name}</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none">{q}</summary>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Nearby cities */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Ceny v okolních městech</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCity.map(c => (
              <Link
                key={c.slug}
                href={`/mesto/${c.slug}`}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500 text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 rounded-lg transition-all"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
