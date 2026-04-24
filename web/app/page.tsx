import { getStats, getCheapestStations } from '@/lib/data';
import HomeClient from './HomeClient';
import CheapestTable from '@/components/CheapestTable';
import Top4Cheapest from '@/components/Top4Cheapest';
import { FaqJsonLd, OrganizationJsonLd } from '@/components/JsonLd';
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
  { q: 'Které značky čerpacích stanic jsou nejlevnější?', a: 'Dlouhodobě nejnižší ceny mívají nezávislé sítě jako Eurobit, Robin Oil nebo Tank-ONO a supermarketové čerpačky (Kaufland, Lidl). Naopak Shell a OMV jsou zpravidla o 2–4 Kč/l dražší než průměr.' },
  { q: 'Vyplatí se tankovat LPG místo benzínu?', a: 'LPG bývá přibližně o 50 % levnější než Natural 95. Nevýhodou je vyšší spotřeba (~25 %) a nutnost přestavby auta. Při ročním nájezdu nad 25 000 km se přestavba obvykle vrátí do 5–7 let.' },
  { q: 'Jak velký je rozdíl mezi nejlevnější a nejdražší čerpačkou?', a: 'Rozdíl mezi nejlevnější a nejdražší stanicí ve stejném městě bývá 3–6 Kč/l. Při plné nádrži 50 litrů to znamená úsporu 150–300 Kč za jedno tankování.' },
  { q: 'Jsou dálniční čerpárny opravdu dražší?', a: 'Ano. Čerpací stanice u dálnic mají zpravidla o 1,5–2,5 Kč/l vyšší cenu než průměr. Výjimkou jsou MOL a Benzina ORLEN u hlavních tahů, kde ceny bývají konkurenceschopné.' },
];

export default async function HomePage() {
  const stats = getStats();
  if (!stats) return <div className="p-8 text-center text-gray-500">Chyba načítání dat</div>;

  // Předáme jen top 10 pro SSR tabulky – mapa se načte client-side
  const cheapestNafta  = getCheapestStations('nafta', 10);
  const cheapestBenzin = getCheapestStations('natural_95', 10);

  return (
    <>
      <OrganizationJsonLd />
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

        {/* Průvodce úsporou */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Jak ušetřit za pohonné hmoty</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-2xl mb-2">📍</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Srovnejte ceny v okolí</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Rozdíl mezi nejlevnější a nejdražší stanicí ve stejném městě bývá 3–6 Kč/l.
                Použijte mapu a filtr „Nejlevnější Natural 95" nebo „Nejlevnější nafta" —
                seřadíme stanice od nejlevnější.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-2xl mb-2">🏪</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Supermarkety a nezávislé sítě</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Čerpací stanice u hypermarketů (Kaufland, Lidl) a nezávislí provozovatelé
                (Eurobit, Robin Oil, Tank-ONO) jsou dlouhodobě o 1–4 Kč/l levnější
                než velké značkové sítě Shell nebo OMV.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Sledujte vývoj cen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ceny benzínu a nafty se mění každý týden podle ceny ropy Brent a kurzu
                CZK/USD. Na stránce{' '}
                <Link href="/vyvoj-ceny" className="text-green-700 dark:text-green-400 underline">vývoj cen</Link>
                {' '}sledujte 90denní trend a tankujte při poklesech.
              </p>
            </div>
          </div>
        </section>

        {/* Srovnání značek */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Srovnání značek čerpacích stanic</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Průměrné odchylky od národního průměru ceny Natural 95 v ČR podle dat BenzinMapa.cz:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { brand: 'Eurobit / Robin Oil', diff: '−2 Kč', color: 'text-green-700 dark:text-green-400' },
              { brand: 'Kaufland / Lidl', diff: '−1,5 Kč', color: 'text-green-600 dark:text-green-400' },
              { brand: 'MOL', diff: '±0 Kč', color: 'text-gray-600 dark:text-gray-300' },
              { brand: 'Benzina ORLEN', diff: '+0,5 Kč', color: 'text-gray-600 dark:text-gray-300' },
              { brand: 'OMV', diff: '+2 Kč', color: 'text-red-600 dark:text-red-400' },
              { brand: 'Shell', diff: '+2,5 Kč', color: 'text-red-600 dark:text-red-400' },
            ].map(({ brand, diff, color }) => (
              <div key={brand} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className={`text-lg font-black ${color}`}>{diff}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{brand}</div>
              </div>
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
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Data sbíráme automaticky třikrát denně — v 5:00, 10:00 a 15:00 SELČ. Reálné ceny
            čerpáme z komunitního zdroje mbenzin.cz a párujeme je s databází stanic
            z OpenStreetMap. Pro stanice bez nahlášené ceny zobrazujeme odhad na základě
            národního průměru a historických odchylek dané značky.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Interaktivní mapa, filtry podle paliva a tabulky nejlevnějších stanic vám
            pomohou najít nejlevnější čerpačku v okolí a ušetřit 2–5 Kč na každém litru —
            u 50litrové nádrže až 250 Kč za tankování.
          </p>
        </section>

      </div>
    </>
  );
}
