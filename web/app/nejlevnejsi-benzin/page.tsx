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
  const avg = stats?.averages.natural_95;
  return {
    title: `Nejlevnější benzín Natural 95 v ČR – ${today}`,
    description: `Kde je dnes nejlevnější benzín Natural 95 v ČR?${avg ? ` Průměr dnes: ${formatPrice(avg)}/l.` : ''} Aktuální přehled nejlevnějších čerpacích stanic. Aktualizováno každých 6 hodin.`,
    alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-benzin/' },
    keywords: ['nejlevnější benzín', 'benzín cena dnes', 'levný benzín', 'natural 95 cena', 'ceny benzínu čerpací stanice', 'kde natankovat levně'],
    openGraph: {
      title: `Nejlevnější benzín Natural 95 v ČR – ${today}`,
      description: `Aktuální přehled nejlevnějšího benzínu Natural 95 na čerpacích stanicích v ČR. Aktualizováno každých 6 hodin.`,
      type: 'website',
      url: 'https://benzinmapa.cz/nejlevnejsi-benzin',
    },
  };
}

const FAQS = [
  { q: 'Kde je dnes nejlevnější benzín v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s benzínem Natural 95 je aktualizován každých 6 hodin. Nejlevnější stanice najdete v tabulce níže, seřazené od nejlevnější.' },
  { q: 'Kolik stojí litr benzínu Natural 95 v ČR dnes?', a: 'Průměrná cena Natural 95 v ČR se mění každý týden podle ceny ropy a kurzu dolaru. Aktuální průměr a nejlevnější stanice najdete v přehledu na naší stránce.' },
  { q: 'Jaký je rozdíl mezi Natural 95 a Natural 98?', a: 'Natural 98 má vyšší oktanové číslo (98 RON vs 95 RON). Je vhodný pro výkonné turbomotory prémiových značek. Pro běžné automobily je plně dostačující Natural 95 — tankování 98 nepřinese žádný benefit.' },
  { q: 'Kde je benzín nejlevnější – supermarket nebo značková čerpačka?', a: 'Supermarketové čerpačky (Kaufland, Lidl) a nezávislí provozovatelé (Eurobit, Robin Oil) mívají ceny o 1,5–3 Kč/l pod průměrem velkých sítí jako Shell nebo OMV.' },
  { q: 'Jsou ceny v tabulce aktuální?', a: 'Data aktualizujeme automaticky každých 6 hodin — v 5:00, 11:00 a 17:00 SELČ. Každá cena má zobrazený čas poslední aktualizace.' },
];

export default function NejlevnejsiBenzinPage() {
  const stations = getCheapestStations('natural_95', 20);
  const stats = getStats();
  const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Nejlevnější benzín</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Nejlevnější benzín (Natural 95) v ČR – {date}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Aktuální přehled čerpacích stanic s nejnižší cenou benzínu Natural 95 v celé České republice.
          {stats && ` Průměrná cena Natural 95 dnes: ${formatPrice(stats.averages.natural_95)}/l.`}
        </p>
        {stats?.trend_7d?.natural_95 != null && (
          <p className="text-sm mb-6 font-medium">
            <span className={stats.trend_7d.natural_95 >= 0 ? 'text-red-600' : 'text-green-600'}>
              {stats.trend_7d.natural_95 >= 0 ? '▲' : '▼'} {Math.abs(stats.trend_7d.natural_95).toFixed(2)} Kč/l za posledních 7 dní
            </span>
          </p>
        )}

        <CheapestTable stations={stations} fuelType="natural_95" />

        {/* Průvodce kdy a kde tankovat */}
        <section className="mt-10 bg-green-50 dark:bg-gray-800 rounded-2xl p-6 border border-green-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kde koupit nejlevnější benzín v ČR</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ceny Natural 95 se v ČR liší i o 4–6 Kč/l mezi nejlevnější a nejdražší stanicí. Při 50litrové nádrži to znamená úsporu až <strong>300 Kč</strong> za jedno tankování. Dlouhodobě nejlevnější benzín nabízejí supermarketové čerpačky u hypermarketů (Kaufland, Lidl) a nezávislé sítě jako Eurobit, Robin Oil nebo Tank-ONO.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Velké značkové sítě Shell a OMV mívají cenu o 2–3 Kč/l nad průměrem. MOL a Benzina ORLEN jsou zpravidla v průměru trhu. Pro nejlevnější tankování doporučujeme používat naši interaktivní mapu a filtr „Natural 95" — zobrazíme stanice seřazené od nejlevnější.
          </p>
        </section>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <p className="col-span-full text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Nejlevnější benzín podle měst:
          </p>
          {CITIES.map(c => (
            <Link key={c.slug} href={`/mesto/${c.slug}`}
              className="text-sm text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-700 transition-all">
              Benzín {c.name}
            </Link>
          ))}
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o cenách benzínu</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white">{q}</summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a}</p>
            </details>
          ))}
        </section>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/nejlevnejsi-nafta" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/vyvoj-ceny" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen benzínu</Link>
        </div>
      </div>
    </>
  );
}
