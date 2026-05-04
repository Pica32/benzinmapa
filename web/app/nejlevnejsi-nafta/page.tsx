import { getCheapestStations, getStats, getStationsWithPrices, formatPrice } from '@/lib/data';
import { FaqJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import type { Metadata } from 'next';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { CITIES } from '@/types';
import { Info } from 'lucide-react';

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.nafta;
  return {
    title: `Nejlevnější nafta v ČR dnes – ${today} | BenzinMapa`,
    description: `Kde je dnes nejlevnější nafta v ČR?${avg ? ` Průměr dnes: ${formatPrice(avg)}/l.` : ''} Přehled ${stats?.total_stations ?? '2400'}+ čerpacích stanic, srovnání značek, regionální průměry. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-nafta/' },
    keywords: ['nejlevnější nafta', 'nafta cena dnes', 'nafta cena litr', 'levná nafta', 'nafta ČR dnes', 'ceny nafty čerpací stanice', 'kde natankovat naftu levně', 'nafta cena litr dnes'],
    openGraph: {
      title: `Nejlevnější nafta v ČR dnes – ${today}`,
      description: `Aktuální přehled nejlevnější nafty na ${stats?.total_stations ?? '2400'}+ čerpacích stanicích v ČR. Srovnání značek, krajové průměry. Aktualizováno každých 6 hodin.`,
      type: 'website',
      url: 'https://benzinmapa.cz/nejlevnejsi-nafta/',
    },
  };
}

const FAQS = [
  { q: 'Kde je dnes nejlevnější nafta v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s naftou je aktualizován každých 6 hodin. Nejlevnější stanice jsou v tabulce níže, seřazené od nejlevnější ceny. Dlouhodobě nejlevnější naftu nabízejí nezávislé sítě (Eurobit, Robin Oil, Tank-ONO) a supermarketové čerpačky (Kaufland, Lidl).' },
  { q: 'Kolik stojí litr nafty v ČR dnes?', a: 'Průměrná cena nafty v ČR se pohybuje kolem 34–38 Kč/l a mění se každý týden podle ceny ropy a kurzu dolaru. Ministerstvo financí ČR stanovuje maximální přípustnou cenu 44,15 Kč/l – žádná stanice ji nesmí překročit.' },
  { q: 'Jaká je maximální přípustná cena nafty v ČR?', a: 'Ministerstvo financí ČR reguluje maximální maloobchodní ceny pohonných hmot. Aktuální strop pro naftu je 44,15 Kč/l s DPH. Limit platí pro všechny čerpací stanice v ČR bez výjimky.' },
  { q: 'Je nafta levnější než benzín?', a: 'Nafta bývá v ČR zpravidla o 1–3 Kč/l levnější než Natural 95. Záleží na aktuálním stavu ropného trhu, kurzu dolaru a spotřební dani (nafta 9,95 Kč/l, benzín 12,84 Kč/l).' },
  { q: 'Kde je nafta nejlevnější – supermarket nebo čerpačka?', a: 'Supermarketové čerpačky (Kaufland, Lidl) a nezávislí provozovatelé (Eurobit, Robin Oil) mívají naftu o 1,5–3 Kč/l pod průměrem velkých sítí jako Shell nebo OMV. Při 60litrové nádrži diezelového auta ušetříte 90–180 Kč za tankování.' },
  { q: 'Jak se liší ceny nafty v různých krajích ČR?', a: 'Cenové rozdíly mezi kraji jsou obvykle do 1,5 Kč/l. Nejlevnější nafta bývá v pohraničních oblastech Ústeckého a Moravskoslezského kraje, kde je silná konkurence a vyšší hustota nezávislých provozovatelů.' },
  { q: 'Jsou ceny nafty v tabulce aktuální?', a: 'Data aktualizujeme automaticky každých 6 hodin – v 5:00, 11:00 a 17:00 SELČ. Zobrazujeme pouze ověřené ceny z reálného zdroje. Každá cena má zobrazen čas poslední aktualizace.' },
];

const BRAND_PRICES_NAFTA = [
  { brand: 'Eurobit / Robin Oil', diff: '−2,0 Kč', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'Kaufland / Lidl', diff: '−1,5 Kč', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'EuroOil / Tank-ONO', diff: '−1,0 Kč', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'MOL', diff: '±0 Kč', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  { brand: 'Benzina ORLEN', diff: '+0,5 Kč', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { brand: 'OMV', diff: '+1,5 Kč', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  { brand: 'Shell', diff: '+2,0 Kč', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
];

export default function NejlevnejsiNaftaPage() {
  const stations = getCheapestStations('nafta', 25);
  const stats = getStats();
  const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.nafta;

  const allWithPrices = getStationsWithPrices().filter(s => s.price?.nafta && s.price?.source === 'mbenzin.cz');
  const regionMap: Record<string, number[]> = {};
  allWithPrices.forEach(s => {
    if (!regionMap[s.region]) regionMap[s.region] = [];
    regionMap[s.region].push(s.price!.nafta!);
  });
  const regionAvgs = Object.entries(regionMap)
    .map(([region, prices]) => ({ region, avg: prices.reduce((a, b) => a + b, 0) / prices.length }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Nejlevnější nafta v ČR', item: 'https://benzinmapa.cz/nejlevnejsi-nafta/' },
      ]} />
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Nejlevnější nafta v ČR</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Nejlevnější nafta v ČR – {date}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          Aktuální přehled čerpacích stanic s nejnižší cenou nafty v celé České republice.
          {avg && ` Průměrná cena nafty dnes: `}<strong>{avg ? formatPrice(avg) + '/l' : ''}</strong>
          {stats?.total_stations ? `. Sledujeme ${stats.total_stations.toLocaleString('cs')} čerpacích stanic.` : ''}
        </p>
        {stats?.trend_7d?.nafta != null && (
          <p className="text-sm mb-4 font-medium">
            <span className={stats.trend_7d.nafta >= 0 ? 'text-red-600' : 'text-green-600'}>
              {stats.trend_7d.nafta >= 0 ? '▲' : '▼'} {Math.abs(stats.trend_7d.nafta).toFixed(2)} Kč/l za posledních 7 dní
            </span>
          </p>
        )}

        {/* MF max ceny */}
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
          <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">MF ČR – max. přípustná cena nafty</div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300">44,15 Kč/l</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">MF ČR – max. přípustná cena Natural 95</div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300">42,79 Kč/l</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-[200px]">
            Státem regulované cenové stropy platné pro všechny čerpací stanice v ČR.
            {avg && ` Průměr trhu (${avg.toFixed(2).replace('.', ',')} Kč) je o ${(44.15 - avg).toFixed(2).replace('.', ',')} Kč pod stropem.`}
          </p>
        </div>

        <CheapestTable stations={stations} fuelType="nafta" />

        {/* Průměry podle krajů */}
        {regionAvgs.length > 0 && (
          <section className="mt-10 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Průměrná cena nafty podle krajů
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kde koupit nejlevnější naftu v ČR</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny nafty se v ČR liší i o <strong>4–5 Kč/l</strong> mezi nejlevnější a nejdražší stanicí.
            Při 60litrové nádrži dieselového auta to znamená úsporu až <strong>300 Kč</strong> za tankování —
            ročně přes 3 600 Kč. Dlouhodobě nejlevnější naftu nabízejí supermarketové čerpačky
            (Kaufland, Lidl) a nezávislé sítě jako Eurobit, Robin Oil nebo Tank-ONO.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Dálniční čerpací stanice bývají o <strong>1,5–2,5 Kč/l dražší</strong> než průměr.
            Pokud jedete po dálnici, vyplatí se zatankovat ještě před výjezdem nebo si vybrat stanici
            v nejbližším městě. Shell a OMV mívají cenu o 1,5–2 Kč/l nad průměrem —
            u nezávislých provozovatelů ušetříte výrazně více.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Ceny nafty závisí na světové ceně ropy Brent, kurzu CZK/USD a spotřební dani
            (nafta 9,95 Kč/l, nižší než benzín 12,84 Kč/l – proto bývá nafta levnější).
            Aktuální vývoj cen za posledních 90 dní sledujte na stránce{' '}
            <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">vývoj cen pohonných hmot</Link>.
          </p>
        </section>

        {/* Srovnání značek */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Srovnání cen nafty podle značky čerpačky
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Průměrné odchylky od národního průměru nafty v ČR podle dat BenzinMapa.cz:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BRAND_PRICES_NAFTA.map(({ brand, diff, color, bg }) => (
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
            Nejlevnější nafta podle měst:
          </p>
          {CITIES.slice(0, 40).map(c => (
            <Link key={c.slug} href={`/mesto/${c.slug}/`}
              className="text-sm text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-all">
              Nafta {c.name}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o cenách nafty</h2>
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
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR</Link>
          <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen nafty 90 dní</Link>
          <Link href="/aktualne/" className="text-green-700 dark:text-green-400 hover:underline">→ Aktuality o cenách paliv</Link>
        </div>
      </div>
    </>
  );
}
