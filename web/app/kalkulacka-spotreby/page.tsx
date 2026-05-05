import type { Metadata } from 'next';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { getStats } from '@/lib/data';
import Link from 'next/link';
import KalkulackaClient from './KalkulackaClient';
import { Calculator } from 'lucide-react';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Kalkulačka spotřeby paliva – náklady na km, rok, měsíc | BenzinMapa',
  description: 'Zdarma online kalkulačka spotřeby paliva. Spočítejte roční náklady na benzín, naftu nebo LPG. Srovnání paliv, náklady na km. Aktuální průměrné ceny v ČR.',
  alternates: { canonical: 'https://benzinmapa.cz/kalkulacka-spotreby/' },
  keywords: [
    'kalkulačka spotřeby paliva', 'výpočet nákladů na palivo', 'kalkulačka benzín',
    'náklady na km benzín', 'roční náklady na palivo', 'kalkulačka nafta',
    'spotřeba paliva výpočet', 'kalkulačka LPG náklady',
  ],
  openGraph: {
    title: 'Kalkulačka spotřeby paliva – roční náklady, srovnání benzín vs nafta',
    description: 'Spočítejte si roční náklady na palivo. Zadejte spotřebu, nájezd a cenu – kalkulačka vám ukáže přesné náklady.',
    type: 'website',
    url: 'https://benzinmapa.cz/kalkulacka-spotreby/',
  },
};

const FAQS = [
  { q: 'Jak správně změřit spotřebu auta?', a: 'Natankujte plnou nádrž, vynulujte počítadlo km, jezte normálně, při dalším tankování si zapište, kolik litrů jste dotankovali a kolik km ujeli. Spotřeba = (litry / km) × 100.' },
  { q: 'Jaká je průměrná spotřeba benzínového auta?', a: 'Průměrné benzínové auto spotřebuje 6–9 l/100 km. Malá města (Škoda Fabia) cca 6–7 l, střední (Octavia) 7–8 l, SUV 9–12 l. Při jízdě po dálnici je spotřeba zpravidla o 1–2 l nižší než ve městě.' },
  { q: 'Jaká je průměrná spotřeba dieselového auta?', a: 'Dieselová auta jsou úspornější – průměrně 5–7 l/100 km. Malá (Fabia TDI) cca 4,5–5,5 l, střední (Octavia TDI) 5–6,5 l, SUV 6–8 l. Diesel je výhodný hlavně při dálkových jízdách.' },
  { q: 'Kolik ušetřím přechodem z benzínu na LPG?', a: 'LPG je přibližně třetinová cena benzínu, ale spotřeba je o 20–25 % vyšší. Reálná úspora na km je 50–60 %. Při nájezdu 15 000 km/rok a průměrné spotřebě 8 l/100 km ušetříte přibližně 20 000–30 000 Kč ročně.' },
  { q: 'Ovlivňuje jízda po dálnici spotřebu?', a: 'Paradoxně ano – dálniční jízda při konstantní rychlosti 130 km/h spotřebuje více než plynulá jízda 90 km/h. Aerodynamický odpor roste kvadraticky s rychlostí. Nejúspornější je plynulá jízda 80–100 km/h.' },
];

export default function KalkulackaPage() {
  const stats = getStats();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Kalkulačka spotřeby paliva', item: 'https://benzinmapa.cz/kalkulacka-spotreby/' },
      ]} />
      <FaqJsonLd faqs={FAQS} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Kalkulačka spotřeby</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <Calculator size={28} className="text-green-600 flex-shrink-0" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Kalkulačka spotřeby paliva – náklady na km, měsíc a rok
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Spočítejte roční náklady na benzín, naftu nebo LPG. Aktuální průměrné ceny v ČR jsou načteny automaticky.
        </p>

        <KalkulackaClient
          avgBenzin={stats?.averages.natural_95 ?? null}
          avgNafta={stats?.averages.nafta ?? null}
          avgLpg={stats?.averages.lpg ?? null}
        />

        {/* Tipy na úsporu */}
        <section className="mt-10 bg-green-50 dark:bg-gray-800 rounded-2xl border border-green-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Jak snížit náklady na palivo</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            {[
              { tip: 'Tankujte u nejlevnějších stanic', text: 'Rozdíl 3–5 Kč/l mezi nejlevnější a nejdražší stanicí = stovky Kč ročně. Najděte nejlevnější čerpačku v okolí na mapě.' },
              { tip: 'Sledujte vývoj cen', text: 'Tankujte při klesajícím trendu, vyhněte se tankování po zdražení ropy. Sledujte grafy na stránce vývoj cen.' },
              { tip: 'Supermarkety a nezávislé sítě', text: 'Kaufland, Lidl, Eurobit a Robin Oil jsou dlouhodobě 1–3 Kč/l pod průměrem Shell nebo OMV.' },
              { tip: 'Jízda na vyšší rychlostní stupeň', text: 'Řaďte brzy na vyšší stupeň, udržujte plynulou rychlost. Agresivní akcelerace zvyšuje spotřebu o 20–30 %.' },
            ].map(({ tip, text }) => (
              <div key={tip}>
                <div className="font-semibold text-gray-900 dark:text-white mb-1">✓ {tip}</div>
                <div className="leading-relaxed">{text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o spotřebě paliva</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white flex justify-between items-center">
                {q}<span className="text-green-600 ml-3 text-xs flex-shrink-0">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Najít nejlevnější benzín</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Najít nejlevnější naftu</Link>
          <Link href="/benzin-vs-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Benzín vs nafta – co je výhodnější?</Link>
          <Link href="/nejlevnejsi-lpg/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější LPG</Link>
        </div>
      </div>
    </>
  );
}
