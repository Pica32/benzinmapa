import { getStats, getCheapestStations } from '@/lib/data';
import HomeClient from './HomeClient';
import CheapestTable from '@/components/CheapestTable';
import Top4Cheapest from '@/components/Top4Cheapest';
import { FaqJsonLd } from '@/components/JsonLd';
import Link from 'next/link';
import { CITIES } from '@/types';
import type { Metadata } from 'next';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Nejlevnější benzín a nafta v ČR dnes – mapa čerpacích stanic',
  description: 'Aktuální ceny pohonných hmot dnes na 2 400+ čerpacích stanicích. Interaktivní mapa. Natural 95, nafta, LPG. Najděte nejlevnější čerpačku ve svém okolí.',
  alternates: {
    canonical: 'https://benzinmapa.cz/',
    languages: { 'x-default': 'https://benzinmapa.cz/' },
  },
};

const FAQS = [
  { q: 'Kde je dnes nejlevnější benzín v ČR?', a: 'Aktuální nejlevnější ceny Natural 95 a nafty najdete na naší interaktivní mapě a v tabulce nejlevnějších stanic nahoře. Data aktualizujeme každých 6 hodin.' },
  { q: 'Jak najdu nejlevnější naftu ve svém okolí?', a: 'Klikněte na tlačítko „Moje poloha" na mapě – zobrazí vám čerpací stanice seřazené podle vzdálenosti od vaší aktuální polohy s cenami nafty.' },
  { q: 'Jsou ceny na BenzinMapa aktuální?', a: 'Data aktualizujeme automaticky každých 6 hodin. Každá cena má zobrazený čas poslední aktualizace.' },
  { q: 'Jak funguje barevné označení stanic na mapě?', a: 'Zelená = nejlevnějších 20 % stanic, oranžová = průměrná cena, červená = nejdražších 20 %. Barvy se mění podle zvoleného typu paliva.' },
  { q: 'Jaký je průměr ceny nafty v ČR dnes?', a: 'Průměrná cena nafty v ČR je zobrazena v horní liště webu. Data jsou stahována každých 6 hodin a průměrována přes všechny sledované stanice.' },
  { q: 'Kolik čerpacích stanic sledujete?', a: 'Sledujeme přes 2 400 čerpacích stanic v celé České republice – od velkých sítí (Benzina, MOL, Shell, OMV) po nezávislé provozovatele.' },
];

export default async function HomePage() {
  const stats = getStats();
  if (!stats) return <div className="p-8 text-center text-gray-500">Chyba načítání dat</div>;

  // Předáme jen top 10 pro SSR tabulky – mapa se načte client-side
  const cheapestNafta  = getCheapestStations('nafta', 10);
  const cheapestBenzin = getCheapestStations('natural_95', 10);

  return (
    <>
      <FaqJsonLd faqs={FAQS} />

      {/* H1 – viditelný nadpis pro SEO (vizuálně zakomponovaný do stránky) */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Nejlevnější benzín a nafta v ČR –{' '}
            <span className="text-green-700 dark:text-green-400">
              {stats.total_stations.toLocaleString('cs')} čerpacích stanic
            </span>
            {' '}na mapě dnes
          </h1>
        </div>
      </div>

      {/* TOP 4 nejlevnější */}
      <Top4Cheapest stations={cheapestBenzin.concat(cheapestNafta)} />

      {/* Mapa – data se načtou client-side (HTML zůstane malé) */}
      <HomeClient stats={stats} />

      {/* Obsah pod mapou */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* Nejlevnější tabulky (SSR data – rychlé) */}
        <div className="grid md:grid-cols-2 gap-8">
          <CheapestTable stations={cheapestNafta}  fuelType="nafta"      />
          <CheapestTable stations={cheapestBenzin} fuelType="natural_95" />
        </div>

        {/* Města – lokální SEO */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ceny pohonných hmot podle měst
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Vyberte město a zobrazte nejlevnější čerpací stanice ve vašem regionu.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/mesto/${city.slug}/`}
                className="block p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all text-center group"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Časté dotazy o cenách pohonných hmot
          </h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-green-600 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▼</span>
                </summary>
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* O nás */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 border border-green-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">O BenzinMapa.cz</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            BenzinMapa sleduje ceny benzínu a nafty na {stats.total_stations.toLocaleString('cs')} čerpacích stanicích
            v celé České republice – od velkých sítí Benzina ORLEN, MOL, Shell a OMV po nezávislé
            provozovatele jako EuroOil, Robin Oil nebo Eurobit, kteří mívají nejnižší ceny.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Data aktualizujeme automaticky každých 6 hodin. Interaktivní mapa a filtry vám
            pomohou najít nejlevnější čerpačku v okolí a ušetřit 2–5 Kč na každém litru.
          </p>
        </section>

      </div>
    </>
  );
}
