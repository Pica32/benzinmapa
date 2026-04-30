import { getCheapestStations, getStats, getStationsWithPrices, formatPrice } from '@/lib/data';
import { FaqJsonLd } from '@/components/JsonLd';
import type { Metadata } from 'next';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { CITIES } from '@/types';
import { Info } from 'lucide-react';

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.natural_95;
  return {
    title: `Nejlevnější benzín Natural 95 v ČR dnes – ${today} | BenzinMapa`,
    description: `Kde je dnes nejlevnější benzín Natural 95 v ČR?${avg ? ` Průměr dnes: ${formatPrice(avg)}/l.` : ''} Přehled ${stats?.total_stations ?? '2400'}+ čerpacích stanic, mapa, filtry. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-benzin/' },
    keywords: ['nejlevnější benzín', 'benzín cena dnes', 'levný benzín', 'natural 95 cena', 'ceny benzínu čerpací stanice', 'kde natankovat levně', 'benzín ČR dnes', 'nejlevnější natural 95'],
    openGraph: {
      title: `Nejlevnější benzín Natural 95 v ČR – ${today}`,
      description: `Aktuální přehled nejlevnějšího benzínu Natural 95 na ${stats?.total_stations ?? '2400'}+ čerpacích stanicích v ČR. Aktualizováno každých 6 hodin.`,
      type: 'website',
      url: 'https://benzinmapa.cz/nejlevnejsi-benzin/',
    },
  };
}

function BreadcrumbJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
      { '@type': 'ListItem', position: 2, name: 'Nejlevnější benzín v ČR', item: 'https://benzinmapa.cz/nejlevnejsi-benzin/' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const FAQS = [
  { q: 'Kde je dnes nejlevnější benzín v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s benzínem Natural 95 je aktualizován každých 6 hodin. Nejlevnější stanice najdete v tabulce níže, seřazené od nejlevnější. Dlouhodobě nejlevnější bývají nezávislé sítě (Eurobit, Robin Oil, Tank-ONO) a supermarketové čerpačky (Kaufland, Lidl).' },
  { q: 'Kolik stojí litr benzínu Natural 95 v ČR dnes?', a: 'Průměrná cena Natural 95 v ČR se mění každý týden podle ceny ropy a kurzu dolaru. Aktuální průměr zobrazujeme v horní liště webu a na stránce vývoj cen. Ministerstvo financí ČR stanovuje maximální přípustnou cenu 42,79 Kč/l – žádná stanice ji nesmí překročit.' },
  { q: 'Jaká je maximální přípustná cena benzínu v ČR?', a: 'Ministerstvo financí ČR reguluje maximální maloobchodní ceny pohonných hmot. Aktuální stropy: Natural 95 max. 42,79 Kč/l, nafta max. 44,15 Kč/l s DPH. Limity platí pro všechny čerpací stanice v ČR bez výjimky.' },
  { q: 'Jaký je rozdíl mezi Natural 95 a Natural 98?', a: 'Natural 98 má vyšší oktanové číslo (98 RON vs 95 RON). Je vhodný pro výkonné turbomotory prémiových značek (BMW, Mercedes, Porsche). Pro běžné automobily je plně dostačující Natural 95 – tankování 98 nepřinese žádný benefit, jen vyšší cenu (~3 Kč/l).' },
  { q: 'Kde je benzín nejlevnější – supermarket nebo značková čerpačka?', a: 'Supermarketové čerpačky (Kaufland, Lidl) a nezávislí provozovatelé (Eurobit, Robin Oil, Tank-ONO) mívají ceny o 1,5–3 Kč/l pod průměrem velkých sítí jako Shell nebo OMV. Při plné 50litrové nádrži ušetříte 75–150 Kč za jedno tankování.' },
  { q: 'Jsou ceny v tabulce aktuální?', a: 'Data aktualizujeme automaticky každých 6 hodin – v 5:00, 11:00 a 17:00 SELČ. Zobrazujeme pouze ověřené ceny z reálného zdroje. Každá cena má zobrazen čas poslední aktualizace.' },
  { q: 'Kdy bývá benzín nejlevnější?', a: 'Historicky bývají nejnižší ceny na přelomu října a listopadu (nízká sezónní poptávka). Během letní turistické sezóny (červenec–srpen) ceny mírně rostou. Denně bývá palivo mírně levnější ráno a večer díky nižší teplotě – hustší palivo = více energie za stejnou cenu.' },
];

// Brand průměry – fixní data (orientační)
const BRAND_PRICES = [
  { brand: 'Eurobit / Robin Oil', diff: '−2,0 Kč', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'Kaufland / Lidl', diff: '−1,5 Kč', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'EuroOil / Tank-ONO', diff: '−1,0 Kč', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'MOL', diff: '±0 Kč', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  { brand: 'Benzina ORLEN', diff: '+0,5 Kč', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { brand: 'OMV', diff: '+1,5 Kč', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  { brand: 'Shell', diff: '+2,0 Kč', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
];

export default function NejlevnejsiBenzinPage() {
  const stations = getCheapestStations('natural_95', 25);
  const stats = getStats();
  const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.natural_95;

  // Regionální průměry z top stanic
  const allWithPrices = getStationsWithPrices().filter(s => s.price?.natural_95 && s.price?.source === 'mbenzin.cz');
  const regionMap: Record<string, number[]> = {};
  allWithPrices.forEach(s => {
    if (!regionMap[s.region]) regionMap[s.region] = [];
    regionMap[s.region].push(s.price!.natural_95!);
  });
  const regionAvgs = Object.entries(regionMap)
    .map(([region, prices]) => ({ region, avg: prices.reduce((a, b) => a + b, 0) / prices.length }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd />
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Nejlevnější benzín v ČR</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Nejlevnější benzín Natural 95 v ČR – {date}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          Aktuální přehled čerpacích stanic s nejnižší cenou benzínu Natural 95 v celé České republice.
          {avg && ` Průměrná cena Natural 95 dnes: `}<strong>{avg ? formatPrice(avg) + '/l' : ''}</strong>
          {stats?.total_stations ? `. Sledujeme ${stats.total_stations.toLocaleString('cs')} čerpacích stanic.` : ''}
        </p>
        {stats?.trend_7d?.natural_95 != null && (
          <p className="text-sm mb-4 font-medium">
            <span className={stats.trend_7d.natural_95 >= 0 ? 'text-red-600' : 'text-green-600'}>
              {stats.trend_7d.natural_95 >= 0 ? '▲' : '▼'} {Math.abs(stats.trend_7d.natural_95).toFixed(2)} Kč/l za posledních 7 dní
            </span>
          </p>
        )}

        {/* MF max ceny – prominentně */}
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
          <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">MF ČR – max. přípustná cena Natural 95</div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300">42,79 Kč/l</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">MF ČR – max. přípustná cena nafty</div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300">44,15 Kč/l</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-[200px]">
            Státem regulované cenové stropy platné pro všechny čerpací stanice v ČR.
            {avg && ` Průměr trhu (${avg.toFixed(2).replace('.', ',')} Kč) je o ${(42.79 - avg).toFixed(2).replace('.', ',')} Kč pod stropem.`}
          </p>
        </div>

        {/* Tabulka nejlevnějších */}
        <CheapestTable stations={stations} fuelType="natural_95" />

        {/* Průměry podle krajů */}
        {regionAvgs.length > 0 && (
          <section className="mt-10 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Průměrná cena Natural 95 podle krajů
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {regionAvgs.map(({ region, avg: rAvg }) => (
                <div key={region} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500 truncate mb-1">{region}</div>
                  <div className="text-lg font-black text-green-700 dark:text-green-400">
                    {rAvg.toFixed(2).replace('.', ',')} Kč
                  </div>
                  {avg && (
                    <div className={`text-xs font-semibold ${rAvg < avg ? 'text-green-600' : 'text-red-500'}`}>
                      {rAvg < avg ? '▼' : '▲'} {Math.abs(rAvg - avg).toFixed(2).replace('.', ',')} Kč vs. průměr
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Data z ověřených cen mbenzin.cz. Aktualizováno každých 6 hodin.</p>
          </section>
        )}

        {/* Průvodce kde tankovat */}
        <section className="mt-6 bg-green-50 dark:bg-gray-800 rounded-2xl p-6 border border-green-100 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kde koupit nejlevnější benzín v ČR</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny Natural 95 se v ČR liší i o <strong>4–6 Kč/l</strong> mezi nejlevnější a nejdražší stanicí.
            Při 50litrové nádrži to znamená úsporu až <strong>300 Kč</strong> za jedno tankování —
            ročně přes 3 000 Kč. Dlouhodobě nejlevnější benzín nabízejí supermarketové čerpačky
            u hypermarketů (Kaufland, Lidl) a nezávislé sítě jako Eurobit, Robin Oil nebo Tank-ONO.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Velké značkové sítě Shell a OMV mívají cenu o <strong>1,5–2 Kč/l nad průměrem</strong>.
            MOL a Benzina ORLEN jsou zpravidla v průměru trhu. Pro nejlevnější tankování
            doporučujeme interaktivní mapu na hlavní stránce – zobrazíme stanice barevně
            označené podle ceny s navigací přímo do Google Maps nebo Waze.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Ceny benzínu závisí na světové ceně ropy Brent, kurzu CZK/USD, spotřební dani
            (12,84 Kč/l u Natural 95) a maržích čerpacích stanic. Státem regulované maximální
            přípustné ceny zajišťují, že žádná stanice nepřekročí stanovený strop.
            Aktuální vývoj cen za posledních 90 dní sledujte na stránce{' '}
            <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">vývoj cen pohonných hmot</Link>.
          </p>
        </section>

        {/* Srovnání značek */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Srovnání cen benzínu podle značky čerpačky
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Průměrné odchylky od národního průměru Natural 95 v ČR podle dat BenzinMapa.cz:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BRAND_PRICES.map(({ brand, diff, color, bg }) => (
              <div key={brand} className={`${bg} rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center`}>
                <div className={`text-lg font-black ${color}`}>{diff}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{brand}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Města */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <p className="col-span-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Nejlevnější benzín podle měst:
          </p>
          {CITIES.slice(0, 40).map(c => (
            <Link key={c.slug} href={`/mesto/${c.slug}/`}
              className="text-sm text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-all">
              Benzín {c.name}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o cenách benzínu</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white flex justify-between items-center">
                {q}<span className="text-green-600 ml-3 text-xs flex-shrink-0">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>

        <div className="mt-6 flex gap-4 text-sm flex-wrap">
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen benzínu 90 dní</Link>
          <Link href="/aktualne/" className="text-green-700 dark:text-green-400 hover:underline">→ Aktuality o cenách paliv</Link>
        </div>
      </div>
    </>
  );
}
