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
  const avg = stats?.averages.lpg;
  return {
    title: `Nejlevnější LPG autogas v ČR dnes – ${today} | BenzinMapa`,
    description: `Kde je dnes nejlevnější LPG autogas v ČR?${avg ? ` Průměr dnes: ${formatPrice(avg)}/l.` : ''} Přehled ${stats?.total_stations ?? '2400'}+ čerpacích stanic, srovnání značek, regionální průměry. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-lpg/' },
    keywords: [
      'nejlevnější LPG', 'LPG cena dnes', 'LPG autogas cena', 'levné LPG',
      'LPG ČR dnes', 'ceny LPG čerpací stanice', 'kde natankovat LPG levně',
      'LPG cena litr dnes', 'autogas cena 2026',
    ],
    openGraph: {
      title: `Nejlevnější LPG autogas v ČR dnes – ${today}`,
      description: `Aktuální přehled nejlevnějšího LPG autogas na čerpacích stanicích v ČR. Srovnání značek, krajové průměry. Aktualizováno každých 6 hodin.`,
      type: 'website',
      url: 'https://benzinmapa.cz/nejlevnejsi-lpg/',
    },
  };
}

const FAQS = [
  { q: 'Kde je dnes nejlevnější LPG v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s LPG autogas je aktualizován každých 6 hodin. Nejlevnější stanice najdete v tabulce níže. Dlouhodobě nejlevnější LPG nabízejí nezávislé sítě a supermarketové čerpačky.' },
  { q: 'Kolik stojí litr LPG autogas v ČR dnes?', a: 'Průměrná cena LPG v ČR se pohybuje kolem 14–18 Kč/l — tedy přibližně třetinu ceny benzínu. Aktuální průměr a nejlevnější stanice najdete v přehledu výše.' },
  { q: 'Kolik ušetřím s LPG oproti benzínu?', a: 'LPG je zhruba 2,5–3× levnější na litr než Natural 95, ale motor spotřebuje asi o 20–25 % více. Čistá úspora bývá 50–60 % na ujetý kilometr. Při průměrném ročním nájezdu 15 000 km ušetříte 20 000–30 000 Kč.' },
  { q: 'Je LPG dostupné na všech čerpacích stanicích v ČR?', a: 'LPG autogas nabízí přibližně 500–700 čerpacích stanic v ČR. Oproti benzínu nebo naftě je síť řidší — hlavně ve větších městech a na hlavních tazích. Přesný přehled stanic s LPG najdete na BenzinMapa.cz pomocí filtru paliva.' },
  { q: 'Je přestavba auta na LPG výhodná?', a: 'Přestavba stojí 25 000–45 000 Kč. Návratnost je typicky 2–4 roky při ročním nájezdu nad 15 000 km. LPG je vhodné především pro auta s motory do 2 l a pro pravidelné dálkové cestování.' },
  { q: 'Jaký je rozdíl mezi LPG a CNG?', a: 'LPG (zkapalněný ropný plyn) je kapalný při nízkém tlaku, CNG (stlačený zemní plyn) vyžaduje vysokotlaké nádrže. LPG je dostupnější, CNG je levnější na km. Obě paliva jsou šetrnější k životnímu prostředí než benzín nebo nafta.' },
  { q: 'Jsou ceny v tabulce aktuální?', a: 'Data aktualizujeme automaticky každých 6 hodin – v 5:00, 11:00 a 17:00 SELČ. Zobrazujeme pouze ověřené ceny z reálného zdroje. Každá cena má zobrazen čas poslední aktualizace.' },
];

const BRAND_PRICES_LPG = [
  { brand: 'Eurobit / Robin Oil', diff: '−1,5 Kč', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'Kaufland / Lidl', diff: '−1,0 Kč', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { brand: 'MOL', diff: '±0 Kč', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  { brand: 'Benzina ORLEN', diff: '+0,3 Kč', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { brand: 'OMV', diff: '+1,0 Kč', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  { brand: 'Shell', diff: '+1,5 Kč', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
];

export default function NejlevnejsiLpgPage() {
  const stations = getCheapestStations('lpg', 25);
  const stats = getStats();
  const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.lpg;
  const avgBenzin = stats?.averages.natural_95;

  const allWithPrices = getStationsWithPrices().filter(s => s.price?.lpg && s.price?.source === 'mbenzin.cz');
  const regionMap: Record<string, number[]> = {};
  allWithPrices.forEach(s => {
    if (!regionMap[s.region]) regionMap[s.region] = [];
    regionMap[s.region].push(s.price!.lpg!);
  });
  const regionAvgs = Object.entries(regionMap)
    .map(([region, prices]) => ({ region, avg: prices.reduce((a, b) => a + b, 0) / prices.length }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Nejlevnější LPG autogas v ČR', item: 'https://benzinmapa.cz/nejlevnejsi-lpg/' },
      ]} />
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Nejlevnější LPG v ČR</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Nejlevnější LPG autogas v ČR – {date}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          Aktuální přehled čerpacích stanic s nejnižší cenou LPG autogas v celé České republice.
          {avg && ` Průměrná cena LPG dnes: `}<strong>{avg ? formatPrice(avg) + '/l' : ''}</strong>
          {avgBenzin && avg && (
            <span className="text-green-700 dark:text-green-400 ml-2 font-semibold">
              (o {((1 - avg / avgBenzin) * 100).toFixed(0)} % levnější než benzín)
            </span>
          )}
        </p>
        {stats?.trend_7d?.lpg != null && (
          <p className="text-sm mb-4 font-medium">
            <span className={stats.trend_7d.lpg >= 0 ? 'text-red-600' : 'text-green-600'}>
              {stats.trend_7d.lpg >= 0 ? '▲' : '▼'} {Math.abs(stats.trend_7d.lpg).toFixed(2)} Kč/l za posledních 7 dní
            </span>
          </p>
        )}

        {/* Srovnání s benzínem */}
        {avg && avgBenzin && (
          <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
            <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">LPG autogas průměr dnes</div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{avg.toFixed(2).replace('.', ',')} Kč/l</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Natural 95 průměr dnes</div>
              <div className="text-2xl font-black text-gray-600 dark:text-gray-300">{avgBenzin.toFixed(2).replace('.', ',')} Kč/l</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-[200px]">
              LPG je o <strong>{(avgBenzin - avg).toFixed(2).replace('.', ',')} Kč/l</strong> levnější než benzín.
              Při spotřebě 10 l/100 km ušetříte {((avgBenzin - avg) * 10).toFixed(0)} Kč na každých 100 km.
            </p>
          </div>
        )}

        <CheapestTable stations={stations} fuelType="lpg" />

        {/* Průměry podle krajů */}
        {regionAvgs.length > 0 && (
          <section className="mt-10 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Průměrná cena LPG podle krajů
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

        {/* Průvodce */}
        <section className="mt-6 bg-green-50 dark:bg-gray-800 rounded-2xl p-6 border border-green-100 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Proč tankovat LPG autogas?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            LPG (liquefied petroleum gas) je v ČR oblíbenou alternativou k benzínu.
            Cena LPG se pohybuje kolem třetiny ceny Natural 95, takže přes vyšší spotřebu (o cca 20–25 %)
            ušetříte na každém kilometru <strong>50–60 %</strong> nákladů za palivo.
            Přestavba auta stojí 25 000–45 000 Kč a návratnost bývá 2–4 roky při nájezdu nad 15 000 km ročně.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            LPG je dostupné na přibližně 500–700 čerpacích stanicích v ČR — hustota sítě je nižší
            než u benzínu nebo nafty, ale pro každodenní provoz ve městě i na dálnicích plně postačí.
            Nejlevnější LPG tradičně nabízejí nezávislé sítě a supermarketové pumpy.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            LPG produkuje o 15–20 % méně CO₂ než benzín a nespadá pod případné restrikce vjezdu
            do nízkoemisních zón v centru měst (ty zatím mířící hlavně na diesel Euro 4 a starší).
            Aktuální vývoj cen sledujte na stránce{' '}
            <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">vývoj cen pohonných hmot</Link>.
          </p>
        </section>

        {/* Srovnání značek */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Srovnání cen LPG podle značky čerpačky
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Průměrné odchylky od národního průměru LPG v ČR podle dat BenzinMapa.cz:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BRAND_PRICES_LPG.map(({ brand, diff, color, bg }) => (
              <div key={brand} className={`${bg} rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center`}>
                <div className={`text-lg font-black ${color}`}>{diff}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{brand}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Města s LPG */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <p className="col-span-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            LPG čerpací stanice podle měst:
          </p>
          {CITIES.slice(0, 40).map(c => (
            <Link key={c.slug} href={`/mesto/${c.slug}/`}
              className="text-sm text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-all">
              LPG {c.name}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o LPG autogas</h2>
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
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen LPG 90 dní</Link>
          <Link href="/aktualne/" className="text-green-700 dark:text-green-400 hover:underline">→ Aktuality o cenách paliv</Link>
        </div>
      </div>
    </>
  );
}
