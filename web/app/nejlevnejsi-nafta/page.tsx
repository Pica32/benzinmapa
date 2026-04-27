import { getCheapestStations, getStats, formatPrice } from '@/lib/data';
import { FaqJsonLd } from '@/components/JsonLd';
import type { Metadata } from 'next';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { CITIES } from '@/types';

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg = stats?.averages.nafta;
  return {
    title: `Nejlevnější nafta v ČR – ${today}`,
    description: `Kde je dnes nejlevnější nafta v ČR?${avg ? ` Průměr dnes: ${formatPrice(avg)}/l.` : ''} Aktuální přehled nejlevnějších čerpacích stanic. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-nafta' },
    keywords: ['nejlevnější nafta', 'nafta cena dnes', 'levná nafta', 'nafta ČR', 'ceny nafty čerpací stanice', 'kde natankovat naftu levně'],
    openGraph: {
      title: `Nejlevnější nafta v ČR – ${today}`,
      description: `Aktuální přehled nejlevnější nafty na čerpacích stanicích v ČR. Aktualizováno každých 6 hodin.`,
      type: 'website',
      url: 'https://benzinmapa.cz/nejlevnejsi-nafta',
    },
  };
}

const FAQS = [
  { q: 'Kde je dnes nejlevnější nafta v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s naftou je aktualizován každých 6 hodin. Nejlevnější stanice jsou v tabulce níže, seřazené od nejlevnější ceny.' },
  { q: 'Kolik stojí litr nafty v ČR dnes?', a: 'Průměrná cena nafty v ČR se pohybuje kolem 34–36 Kč/l a mění se každý týden. Aktuální průměr a nejlevnější stanice najdete v přehledu výše.' },
  { q: 'Je nafta levnější než benzín?', a: 'Nafta bývá v ČR zpravidla o 1–3 Kč/l levnější než Natural 95. Záleží na aktuálním stavu ropného trhu a kurzu dolaru.' },
  { q: 'Kde je nafta nejlevnější – supermarket nebo čerpačka?', a: 'Supermarketové čerpačky (Kaufland, Lidl) a nezávislí provozovatelé (Eurobit, Robin Oil) mívají naftu o 1,5–3 Kč/l pod průměrem velkých sítí jako Shell nebo OMV.' },
  { q: 'Jak se liší ceny nafty v různých krajích ČR?', a: 'Cenové rozdíly mezi kraji jsou obvykle do 1,5 Kč/l. Nejlevnější nafta bývá v pohraničních oblastech Ústeckého a Moravskoslezského kraje, kde je silná konkurence.' },
];

export default function NejlevnejsiNaftaPage() {
  const stations = getCheapestStations('nafta', 20);
  const stats = getStats();
  const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Nejlevnější nafta</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Nejlevnější nafta v ČR – {date}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Aktuální přehled čerpacích stanic s nejnižší cenou nafty v celé České republice.
          {stats && ` Průměrná cena nafty dnes: ${formatPrice(stats.averages.nafta)}/l.`}
        </p>
        {stats?.trend_7d?.nafta != null && (
          <p className="text-sm mb-6 font-medium">
            <span className={stats.trend_7d.nafta >= 0 ? 'text-red-600' : 'text-green-600'}>
              {stats.trend_7d.nafta >= 0 ? '▲' : '▼'} {Math.abs(stats.trend_7d.nafta).toFixed(2)} Kč/l za posledních 7 dní
            </span>
          </p>
        )}

        <CheapestTable stations={stations} fuelType="nafta" />

        <section className="mt-10 bg-green-50 dark:bg-gray-800 rounded-2xl p-6 border border-green-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kde koupit nejlevnější naftu v ČR</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny nafty se v ČR liší i o 4–5 Kč/l mezi nejlevnější a nejdražší stanicí. Při 60litrové nádrži dieselového auta to znamená úsporu až <strong>300 Kč</strong> za tankování. Dlouhodobě nejlevnější naftu nabízejí supermarketové čerpačky (Kaufland, Lidl) a nezávislé sítě jako Eurobit nebo Robin Oil.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Dálniční čerpací stanice bývají o 1,5–2,5 Kč/l dražší než průměr. Pokud jedete po dálnici, vyplatí se zatankovat ještě před výjezdem nebo si vybrat stanici v nejbližším městě. Vývoj cen nafty za posledních 90 dní sledujte na naší stránce{' '}
            <Link href="/vyvoj-ceny" className="text-green-700 dark:text-green-400 hover:underline">vývoj cen paliv</Link>.
          </p>
        </section>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <p className="col-span-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Nejlevnější nafta podle měst:
          </p>
          {CITIES.map(c => (
            <Link key={c.slug} href={`/mesto/${c.slug}`}
              className="text-sm text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-700 transition-all">
              Nafta {c.name}
            </Link>
          ))}
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o cenách nafty</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white">{q}</summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a}</p>
            </details>
          ))}
        </section>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/nejlevnejsi-benzin" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR</Link>
          <Link href="/vyvoj-ceny" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen nafty</Link>
        </div>
      </div>
    </>
  );
}
