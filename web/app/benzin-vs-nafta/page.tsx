import type { Metadata } from 'next';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { getStats, formatPrice } from '@/lib/data';
import Link from 'next/link';

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  const avg95 = stats?.averages.natural_95;
  const avgNafta = stats?.averages.nafta;
  return {
    title: 'Benzín vs nafta – co je levnější a výhodnější? 2026 | BenzinMapa',
    description: `Detailní srovnání benzínu a nafty v ČR. ${avg95 ? `Natural 95 dnes: ${formatPrice(avg95)}/l` : 'Aktuální ceny'}${avgNafta ? `, nafta: ${formatPrice(avgNafta)}/l.` : '.'} Kdy se vyplatí diesel? Náklady na km, spotřeba, daně.`,
    alternates: { canonical: 'https://benzinmapa.cz/benzin-vs-nafta/' },
    keywords: [
      'benzín vs nafta', 'co je levnější benzín nebo nafta', 'diesel nebo benzín', 'nafta vs benzín 2026',
      'kdy se vyplatí diesel', 'spotřeba benzín nafta srovnání', 'náklady na km benzín nafta',
      'benzín nebo diesel co koupit',
    ],
    openGraph: {
      title: 'Benzín vs nafta – co je levnější? Aktuální srovnání 2026',
      description: 'Srovnání nákladů, spotřeby a výhod benzínu a nafty. Pomůžeme vám rozhodnout, co tankovat.',
      type: 'website',
      url: 'https://benzinmapa.cz/benzin-vs-nafta/',
    },
  };
}

const FAQS = [
  { q: 'Je nafta levnější než benzín v ČR?', a: 'Nafta bývá v ČR zpravidla o 1–3 Kč/l levnější než Natural 95. Závisí na světové ceně ropy a spotřební dani (nafta 9,95 Kč/l vs. benzín 12,84 Kč/l). Aktuální rozdíl najdete v porovnání výše.' },
  { q: 'Co je výhodnější – benzín nebo diesel na 100 km?', a: 'Dieselové auto spotřebuje průměrně 5–7 l/100 km, benzínové 7–10 l/100 km. I když je nafta levnější, záleží na konkrétním vozidle. Při průměrné ceně paliva a spotřebě je diesel zpravidla o 15–25 % levnější na ujetý km.' },
  { q: 'Kdy se vyplatí koupit diesel místo benzínu?', a: 'Diesel se ekonomicky vyplatí při ročním nájezdu nad 20 000–25 000 km. Dieselové auto bývá o 50 000–150 000 Kč dražší při nákupu a servis je nákladnější. Při malém nájezdu (pod 15 000 km/rok) je benzínový motor ekonomičtější.' },
  { q: 'Jaký vliv mají emise na výběr paliva?', a: 'Benzínové motory produkují méně pevných částic (PM2.5) a méně NOx než diesel. Diesel produkuje méně CO₂ na ujetý km (nižší spotřeba). Nízkoemisní zóny (LEZ) ve městech typicky omezují starší diesely (Euro 4 a starší), benzíny jsou méně postiženy.' },
  { q: 'Proč jsou ceny nafty a benzínu různé?', a: 'Hlavní rozdíl je ve spotřební dani: benzín 12,84 Kč/l, nafta 9,95 Kč/l. Nafta má navíc jiný výrobní proces v rafinérii. Cena ropy, kurz CZK/USD a distribuční marže jsou stejné pro obě paliva.' },
  { q: 'Má smysl tankovat Natural 98 místo 95?', a: 'Natural 98 (97–99 RON) je vhodný pro výkonné motory s vysokým kompresním poměrem (BMW, Mercedes, Porsche turbo). Pro běžná auta nepřinese žádný benefit a stojí o 2–4 Kč/l více. Zkontrolujte doporučení výrobce ve servisní knize.' },
];

export default function BenzinVsNaftaPage() {
  const stats = getStats();
  const avg95    = stats?.averages.natural_95;
  const avgNafta = stats?.averages.nafta;
  const avgLpg   = stats?.averages.lpg;

  const diff = avg95 && avgNafta ? avg95 - avgNafta : null;

  // Kalkulace na 100 km (orientační průměrné spotřeby)
  const spotreba = [
    { typ: 'Malé benzínové auto', l: 6.5, palivo: 'benzin' as const },
    { typ: 'Střední benzínové SUV', l: 9.0, palivo: 'benzin' as const },
    { typ: 'Malé dieselové auto', l: 5.0, palivo: 'nafta' as const },
    { typ: 'Střední dieselové SUV', l: 7.0, palivo: 'nafta' as const },
    { typ: 'LPG auto (průměr)', l: 10.0, palivo: 'lpg' as const },
  ];

  const priceMap = { benzin: avg95, nafta: avgNafta, lpg: avgLpg };

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Benzín vs nafta – srovnání', item: 'https://benzinmapa.cz/benzin-vs-nafta/' },
      ]} />
      <FaqJsonLd faqs={FAQS} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Benzín vs nafta</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Benzín vs nafta – co je levnější a výhodnější v ČR?
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Aktuální srovnání cen, spotřeby a celkových nákladů na km. Data aktualizována každých 6 hodin.
        </p>

        {/* Aktuální ceny side by side */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {avg95 && (
            <div className="bg-green-50 dark:bg-gray-800 rounded-2xl border border-green-200 dark:border-gray-700 p-5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Natural 95 dnes</div>
              <div className="text-3xl font-black text-green-700 dark:text-green-400">{avg95.toFixed(2).replace('.', ',')} Kč</div>
              <div className="text-xs text-gray-500 mt-1">průměr ČR / litr</div>
              <Link href="/nejlevnejsi-benzin/" className="mt-3 block text-xs text-green-700 hover:underline">→ Nejlevnější benzín</Link>
            </div>
          )}
          {avgNafta && (
            <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-gray-700 p-5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nafta dnes</div>
              <div className="text-3xl font-black text-blue-700 dark:text-blue-400">{avgNafta.toFixed(2).replace('.', ',')} Kč</div>
              <div className="text-xs text-gray-500 mt-1">průměr ČR / litr</div>
              <Link href="/nejlevnejsi-nafta/" className="mt-3 block text-xs text-blue-700 hover:underline">→ Nejlevnější nafta</Link>
            </div>
          )}
          {avgLpg && (
            <div className="bg-purple-50 dark:bg-gray-800 rounded-2xl border border-purple-200 dark:border-gray-700 p-5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">LPG autogas dnes</div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-400">{avgLpg.toFixed(2).replace('.', ',')} Kč</div>
              <div className="text-xs text-gray-500 mt-1">průměr ČR / litr</div>
              <Link href="/nejlevnejsi-lpg/" className="mt-3 block text-xs text-purple-700 hover:underline">→ Nejlevnější LPG</Link>
            </div>
          )}
        </div>

        {diff != null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-8 text-center">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Nafta je dnes </span>
            <span className="text-xl font-black text-green-700 dark:text-green-400">{diff.toFixed(2).replace('.', ',')} Kč/l</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm"> levnější než benzín</span>
          </div>
        )}

        {/* Náklady na 100 km */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Náklady na 100 km podle typu auta</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Výpočet při aktuálních průměrných cenách paliv v ČR:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Typ vozidla</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Spotřeba</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Cena / 100 km</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Za rok 15 000 km</th>
                </tr>
              </thead>
              <tbody>
                {spotreba.map((s, i) => {
                  const cena = priceMap[s.palivo];
                  const per100 = cena ? cena * s.l : null;
                  const perYear = per100 ? per100 * 150 : null;
                  return (
                    <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}`}>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{s.typ}</td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-400">{s.l.toFixed(1)} l</td>
                      <td className="p-3 text-right font-bold text-gray-900 dark:text-white">{per100 ? per100.toFixed(0) + ' Kč' : '—'}</td>
                      <td className="p-3 text-right text-green-700 dark:text-green-400 font-semibold">{perYear ? Math.round(perYear / 100) * 100 + ' Kč' : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Výpočet orientační na základě průměrné spotřeby. Skutečná spotřeba závisí na vozidle a stylu jízdy.</p>
        </section>

        {/* Srovnávací tabulka */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Komplexní srovnání benzín vs. nafta</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Kritérium</th>
                  <th className="text-center p-3 font-semibold text-green-700 dark:text-green-400">Benzín</th>
                  <th className="text-center p-3 font-semibold text-blue-700 dark:text-blue-400">Nafta (Diesel)</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-gray-100 dark:[&>tr]:border-gray-700">
                {[
                  ['Cena za litr (průměr ČR)', avg95 ? `${avg95.toFixed(2).replace('.', ',')} Kč` : '~40 Kč', avgNafta ? `${avgNafta.toFixed(2).replace('.', ',')} Kč` : '~38 Kč'],
                  ['Průměrná spotřeba', '7–10 l/100 km', '5–7 l/100 km'],
                  ['Spotřební daň ČR', '12,84 Kč/l', '9,95 Kč/l'],
                  ['Cena auta', 'Nižší nákupní cena', 'O 50–150 000 Kč dražší'],
                  ['Servisní náklady', 'Nižší (jednodušší motor)', 'Vyšší (DPF, vstřikovače)'],
                  ['Emise CO₂ na km', 'Vyšší', 'Nižší (nižší spotřeba)'],
                  ['Emise pevných částic', 'Nízké', 'Vyšší (DPF povinný)'],
                  ['Vhodné pro', 'Město, krátké jízdy', 'Dálnice, vysoký nájezd'],
                  ['Výhodný nájezd', 'Do 15 000 km/rok', 'Nad 20 000 km/rok'],
                  ['Nízkoemisní zóny', 'Méně omezován', 'Starší Euro 4 a méně omezovány'],
                ].map(([k, b, n], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{k}</td>
                    <td className="p-3 text-center text-gray-600 dark:text-gray-400">{b}</td>
                    <td className="p-3 text-center text-gray-600 dark:text-gray-400">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Časté dotazy – benzín nebo nafta?</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white flex justify-between items-center">
                {q}<span className="text-green-600 ml-3 text-xs flex-shrink-0">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/nejlevnejsi-lpg/" className="text-green-700 dark:text-green-400 hover:underline">→ LPG autogas – je to výhodné?</Link>
          <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen paliv – grafy</Link>
        </div>
      </div>
    </>
  );
}
