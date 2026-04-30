import { getStationsByCity, getStats, formatPrice, slugify } from '@/lib/data';
import { CityPageJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CITIES } from '@/types';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { MapPin, TrendingDown, Info, Fuel } from 'lucide-react';

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
  const real = stations.filter(s => s.price?.source === 'mbenzin.cz');
  const cheapest95 = real.filter(s => s.price?.natural_95).sort((a, b) => (a.price!.natural_95 ?? 999) - (b.price!.natural_95 ?? 999))[0];
  const cheapestNafta = real.filter(s => s.price?.nafta).sort((a, b) => (a.price!.nafta ?? 999) - (b.price!.nafta ?? 999))[0];

  const priceStr = [
    cheapest95 ? `Natural 95 od ${formatPrice(cheapest95.price!.natural_95)}` : '',
    cheapestNafta ? `nafta od ${formatPrice(cheapestNafta.price!.nafta)}` : '',
  ].filter(Boolean).join(', ');

  return {
    title: `Nejlevnější benzín ${city.name} dnes – ${today} | Ceny paliv`,
    description: `Aktuální ceny pohonných hmot v ${city.name} – ${stations.length} čerpacích stanic. ${priceStr ? priceStr + '.' : ''} Interaktivní mapa, filtry podle značky, navigace. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: `https://benzinmapa.cz/mesto/${nazev}/` },
    openGraph: {
      title: `Nejlevnější benzín ${city.name} – ceny dnes`,
      description: `Srovnání cen pohonných hmot v ${city.name}. ${priceStr ? priceStr + '. ' : ''}Mapa a přehled ${stations.length} čerpacích stanic.`,
      type: 'website',
      url: `https://benzinmapa.cz/mesto/${nazev}/`,
    },
    keywords: [
      `nejlevnější benzín ${city.name}`,
      `ceny benzínu ${city.name}`,
      `benzín ${city.name} dnes`,
      `nafta ${city.name}`,
      `čerpací stanice ${city.name}`,
      `nejlevnější nafta ${city.name}`,
      `ceny paliv ${city.name}`,
      `pumpa ${city.name}`,
    ],
  };
}

// BreadcrumbList JSON-LD
function BreadcrumbJsonLd({ city, slug }: { city: string; slug: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
      { '@type': 'ListItem', position: 2, name: 'Nejlevnější benzín', item: 'https://benzinmapa.cz/nejlevnejsi-benzin/' },
      { '@type': 'ListItem', position: 3, name: `Benzín ${city}`, item: `https://benzinmapa.cz/mesto/${slug}/` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function MestoPage({ params }: Props) {
  const { nazev } = await params;
  const city = CITIES.find(c => c.slug === nazev);
  if (!city) notFound();

  const allStations = getStationsByCity(city.name);
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  // Statistiky pro město
  const real = allStations.filter(s => s.price?.source === 'mbenzin.cz');
  const prices95 = real.map(s => s.price?.natural_95).filter(Boolean) as number[];
  const pricesNafta = real.map(s => s.price?.nafta).filter(Boolean) as number[];

  const avg95 = prices95.length ? prices95.reduce((a, b) => a + b, 0) / prices95.length : null;
  const avgNafta = pricesNafta.length ? pricesNafta.reduce((a, b) => a + b, 0) / pricesNafta.length : null;
  const min95 = prices95.length ? Math.min(...prices95) : null;
  const max95 = prices95.length ? Math.max(...prices95) : null;
  const minNafta = pricesNafta.length ? Math.min(...pricesNafta) : null;

  // Brand breakdown
  const brandCount: Record<string, number> = {};
  allStations.forEach(s => {
    const b = s.brand || 'Nezávislá';
    brandCount[b] = (brandCount[b] || 0) + 1;
  });
  const topBrands = Object.entries(brandCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Národní průměr
  const natAvg95 = stats?.averages.natural_95;
  const natAvgNafta = stats?.averages.nafta;

  const diffVsNat = avg95 && natAvg95 ? avg95 - natAvg95 : null;

  // Nejbližší města
  const nearbyCity = CITIES.filter(c => c.slug !== nazev).slice(0, 8);

  const faqs = [
    { q: `Kde je dnes nejlevnější benzín v ${city.name}?`, a: `Nejlevnější Natural 95 v ${city.name} najdete v tabulce níže – seřazené od nejlevnější čerpačky. Data aktualizujeme každých 6 hodin z ověřeného zdroje.${min95 ? ` Aktuálně nejnižší cena v ${city.name}: ${min95.toFixed(2).replace('.', ',')} Kč/l.` : ''}` },
    { q: `Kolik stojí benzín v ${city.name} dnes?`, a: `${avg95 ? `Průměrná cena Natural 95 v ${city.name} je dnes ${avg95.toFixed(2).replace('.', ',')} Kč/l` : `Průměrná cena Natural 95 v ČR je ${natAvg95?.toFixed(2).replace('.', ',')} Kč/l`}. ${natAvg95 && avg95 ? `Národní průměr je ${natAvg95.toFixed(2).replace('.', ',')} Kč/l – ${city.name} je ${diffVsNat && diffVsNat > 0 ? 'dražší' : 'levnější'} o ${Math.abs(diffVsNat ?? 0).toFixed(2).replace('.', ',')} Kč/l.` : ''}` },
    { q: `Kde je nejlevnější nafta v ${city.name}?`, a: `${minNafta ? `Nejlevnější nafta v ${city.name} začíná na ${minNafta.toFixed(2).replace('.', ',')} Kč/l. Průměr v ${city.name}: ${avgNafta?.toFixed(2).replace('.', ',')} Kč/l.` : `Aktuální ceny nafty v ${city.name} jsou v tabulce níže.`} Nafta je v ČR od dubna 2026 regulována stropem 44,15 Kč/l.` },
    { q: `Která čerpací stanice je v ${city.name} nejlevnější?`, a: `Pořadí stanic se mění s každou aktualizací cen. Použijte tabulku nebo interaktivní mapu níže – zelená barva označuje nejlevnější stanice (spodních 20 % cen), červená nejdražší. Obecně nejlevnější bývají nezávislé sítě a supermarketové čerpačky.` },
    { q: `Jsou dálniční čerpačky v okolí ${city.name} dražší?`, a: `Ano. Čerpací stanice přímo u dálničních sjezdů bývají o 1,5–2,5 Kč/l dražší než průměr v ${city.name}. Doporučujeme zatankovat předem ve městě – naše mapa zobrazí nejbližší levnou pumpu na trase.` },
    { q: `Jaká je maximální přípustná cena benzínu v ČR?`, a: `Ministerstvo financí ČR stanovuje maximální přípustné maloobchodní ceny: Natural 95 max. 42,79 Kč/l, nafta max. 44,15 Kč/l. Žádná čerpační stanice v ČR včetně stanic v ${city.name} nesmí tyto limity překročit.` },
  ];

  return (
    <>
      <CityPageJsonLd city={city.name} stations={allStations} />
      <FaqJsonLd faqs={faqs} />
      <BreadcrumbJsonLd city={city.name} slug={nazev} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <Link href="/nejlevnejsi-benzin/" className="hover:text-green-600">Nejlevnější benzín</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">{city.name}</span>
        </nav>

        {/* H1 */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MapPin className="text-green-600 flex-shrink-0" size={28} />
            Nejlevnější benzín {city.name} – {today}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Aktuální ceny pohonných hmot na <strong>{allStations.length} čerpacích stanicích</strong> v {city.name}.
            {real.length > 0 && ` ${real.length} stanic má ověřenou cenu z reálného zdroje.`}
            {' '}Interaktivní mapa, filtry podle značky a přehled nejlevnějších čerpacích stanic vám ušetří až 4 Kč na litru.
          </p>
        </div>

        {/* Cenové statistiky pro město */}
        {(avg95 || avgNafta) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {avg95 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Natural 95 – průměr {city.name}</div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">{avg95.toFixed(2).replace('.', ',')} <span className="text-sm font-normal text-gray-400">Kč</span></div>
                {natAvg95 && diffVsNat !== null && (
                  <div className={`text-xs mt-1 font-semibold ${diffVsNat > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {diffVsNat > 0 ? '▲' : '▼'} {Math.abs(diffVsNat).toFixed(2).replace('.', ',')} Kč vs. ČR průměr
                  </div>
                )}
              </div>
            )}
            {min95 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-300 dark:border-green-800 p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nejlevnější Natural 95</div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">{min95.toFixed(2).replace('.', ',')} <span className="text-sm font-normal text-gray-400">Kč</span></div>
              </div>
            )}
            {avgNafta && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nafta – průměr {city.name}</div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">{avgNafta.toFixed(2).replace('.', ',')} <span className="text-sm font-normal text-gray-400">Kč</span></div>
              </div>
            )}
            {minNafta && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-300 dark:border-green-800 p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nejlevnější nafta</div>
                <div className="text-2xl font-black text-green-700 dark:text-green-400">{minNafta.toFixed(2).replace('.', ',')} <span className="text-sm font-normal text-gray-400">Kč</span></div>
              </div>
            )}
          </div>
        )}

        {/* Tabulky – nafta + benzín */}
        <div className="space-y-8 mb-10">
          <CheapestTable stations={allStations} fuelType="natural_95" city={city.name} />
          <CheapestTable stations={allStations} fuelType="nafta" city={city.name} />
          {allStations.some(s => s.price?.lpg) && (
            <CheapestTable stations={allStations} fuelType="lpg" city={city.name} />
          )}
        </div>

        {/* Mapa + navigace */}
        <div className="bg-green-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-green-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MapPin size={18} className="text-green-600" /> Interaktivní mapa čerpacích stanic – {city.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Na mapě jsou barevně označeny všechny čerpací stanice v {city.name} a okolí.
            <strong className="text-green-700 dark:text-green-400"> Zelená</strong> = nejlevnější (spodních 20 %),
            <strong className="text-amber-600"> oranžová</strong> = průměr,
            <strong className="text-red-600"> červená</strong> = nejdražší.
            Kliknutím na marker zobrazíte aktuální ceny a navigaci.
          </p>
          <Link
            href={`/?q=${encodeURIComponent(city.name)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <TrendingDown size={16} />
            Otevřít mapu – {city.name}
          </Link>
        </div>

        {/* Maximální přípustné ceny MF */}
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">Stát reguluje maximální ceny pohonných hmot</h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Ministerstvo financí ČR stanovilo maximální přípustné maloobchodní ceny. Žádná čerpační stanice v {city.name} ani v celé ČR nesmí tyto limity překročit.
          </p>
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-xs text-gray-500">Natural 95 – maximum</span>
              <div className="text-xl font-black text-blue-700 dark:text-blue-300">42,79 Kč/l</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Nafta – maximum</span>
              <div className="text-xl font-black text-blue-700 dark:text-blue-300">44,15 Kč/l</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Zdroj: <a href="https://mf.gov.cz/cs/kontrola-a-regulace/cenova-regulace-a-kontrola/maximalni-pripustne-ceny-benzinu-a-nafty" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministerstvo financí ČR</a>
          </p>
        </div>

        {/* Brand breakdown */}
        {topBrands.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Fuel size={18} className="text-green-600" /> Značky čerpacích stanic v {city.name}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {topBrands.map(([brand, count]) => (
                <span key={brand} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {brand} <span className="text-gray-400 text-xs">({count})</span>
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              V {city.name} funguje {allStations.length} čerpacích stanic {topBrands.length} různých provozovatelů.
              Nejlevnější ceny dlouhodobě nabízejí nezávislé sítě a supermarketové čerpačky —
              průměrně o 1,5–3 Kč/l pod cenami Shell nebo OMV.
            </p>
          </section>
        )}

        {/* SEO textový obsah */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Ceny benzínu a nafty v {city.name} – jak ušetřit při tankování
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny pohonných hmot v {city.name} se aktualizují každých 6 hodin. Sledujeme
            {' '}{allStations.length} čerpacích stanic a zobrazujeme pouze ověřené ceny z reálného zdroje.
            Interaktivní mapa umožňuje rychle najít nejlevnější stanici na vaší trase — bez nutnosti
            registrace a zdarma.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Rozdíl mezi nejlevnější a nejdražší čerpačkou v {city.name} bývá <strong>2–5 Kč/l</strong>.
            Při tankování 50 litrů to znamená úsporu až <strong>250 Kč za jedno tankování</strong>.
            Při průměrném tankování 2× měsíčně a ročním nájezdu 15 000 km ušetříte výběrem nejlevnější
            stanice {avg95 && max95 ? `přibližně ${Math.round((max95 - avg95) * 15000 / 100 * 7 / 100)} Kč` : 'tisíce korun'} ročně.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny benzínu v {city.name} jsou ovlivněny světovou cenou ropy Brent, kurzem CZK/USD,
            spotřební daní (12,84 Kč/l u Natural 95) a maržemi jednotlivých provozovatelů.
            Velké sítě jako Shell nebo OMV mají zpravidla o 1–2,5 Kč vyšší cenu než nezávislé stanice.
            Ministerstvo financí ČR stanovuje maximální přípustné ceny, které nesmí žádná stanice překročit.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Pro srovnání cen benzínu v celé ČR navštivte{' '}
            <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">
              přehled nejlevnějšího benzínu v ČR
            </Link>
            {' '}nebo{' '}
            <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">
              vývoj cen pohonných hmot za 90 dní
            </Link>.
            Aktuální ceny nafty v {city.name} a celé ČR sledujte na stránce{' '}
            <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">
              nejlevnější nafta v ČR
            </Link>.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Časté dotazy – benzín a nafta v {city.name}
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-green-600 ml-3 flex-shrink-0 text-xs">▼</span>
                </summary>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Okolní města */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Ceny benzínu v okolních městech
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCity.map(c => (
              <Link
                key={c.slug}
                href={`/mesto/${c.slug}/`}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500 text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-lg transition-all"
              >
                Benzín {c.name}
              </Link>
            ))}
            <Link
              href="/nejlevnejsi-benzin/"
              className="px-3 py-1.5 bg-green-50 dark:bg-gray-700 border border-green-300 dark:border-green-700 text-sm text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 transition-all font-medium"
            >
              → Celá ČR
            </Link>
          </div>
        </section>

        {/* Zpět */}
        <div className="flex items-center gap-4 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline font-medium">← Nejlevnější benzín ČR</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-gray-500 hover:text-green-700 dark:text-gray-400">Nejlevnější nafta →</Link>
          <Link href="/vyvoj-ceny/" className="text-gray-500 hover:text-green-700 dark:text-gray-400">Vývoj cen →</Link>
        </div>

      </div>
    </>
  );
}
