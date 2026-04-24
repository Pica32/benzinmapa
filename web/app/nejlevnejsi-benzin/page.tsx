import { getCheapestStations, getStats, formatPrice } from '@/lib/data';
import { FaqJsonLd } from '@/components/JsonLd';
import type { Metadata } from 'next';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { CITIES } from '@/types';

export const revalidate = 21600;

const today = () => new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

export const metadata: Metadata = {
  title: `Nejlevnější benzín v ČR dnes – aktuální ceny Natural 95`,
  description: 'Kde je dnes nejlevnější benzín Natural 95 v České republice? Kompletní přehled cen benzínu na čerpacích stanicích. Aktualizováno každých 6 hodin.',
  alternates: { canonical: 'https://benzinmapa.cz/nejlevnejsi-benzin' },
  keywords: ['nejlevnější benzín', 'benzín cena dnes', 'levný benzín', 'natural 95 cena', 'ceny benzínu čerpací stanice'],
};

const FAQS = [
  { q: 'Kde je dnes nejlevnější benzín v ČR?', a: 'Přehled nejlevnějších čerpacích stanic s benzínem Natural 95 je aktualizován každých 6 hodin. Viz tabulka níže.' },
  { q: 'Kolik stojí litr benzínu Natural 95?', a: 'Průměrná cena Natural 95 v ČR se mění každý týden. Aktuální průměr najdete v přehledu na naší stránce.' },
  { q: 'Jaký je rozdíl mezi Natural 95 a Natural 98?', a: 'Natural 98 má vyšší oktanové číslo, které je vhodné pro výkonné motory. Pro běžné automobily je plně dostačující Natural 95.' },
];

export default function NejlevnejsiBenzinPage() {
  const stations = getCheapestStations('natural_95', 20);
  const stats = getStats();
  const date = today();

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
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Aktuální přehled čerpacích stanic s nejnižší cenou benzínu Natural 95 v celé České republice.
          {stats && ` Průměrná cena Natural 95 dnes: ${formatPrice(stats.averages.natural_95)}/l.`}
        </p>

        <CheapestTable stations={stations} fuelType="natural_95" />

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

        <div className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white">{q}</summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
