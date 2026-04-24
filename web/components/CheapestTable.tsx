import { StationWithPrice, FuelType, FUEL_LABELS } from '@/types';
import { formatPrice } from '@/lib/data';
import Link from 'next/link';
import { TrendingDown, MapPin } from 'lucide-react';

interface Props {
  stations: StationWithPrice[];
  fuelType: FuelType;
  city?: string;
}

export default function CheapestTable({ stations, fuelType, city }: Props) {
  const sorted = [...stations]
    .filter(s => s.price?.[fuelType] != null)
    .sort((a, b) => (a.price![fuelType] ?? 999) - (b.price![fuelType] ?? 999))
    .slice(0, 10);

  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-4">
        <TrendingDown className="text-green-600" size={22} />
        Nejlevnější {FUEL_LABELS[fuelType]}{city ? ` v ${city}` : ' v ČR'} dnes
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Stanice</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Město</th>
              <th className="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">Cena</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Nat. 95</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Nafta</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/stanice/${s.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-green-700 dark:hover:text-green-400 transition-colors"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />
                    <span className="sm:hidden">{s.city}</span>
                    <span className="hidden sm:inline">{s.address}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  <Link href={`/mesto/${s.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`}
                    className="hover:text-green-600 transition-colors">
                    {s.city}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold text-base ${i === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                    {formatPrice(s.price?.[fuelType] ?? null)}
                  </span>
                  {i === 0 && (
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">nejlevnější</span>
                  )}
                  {s.price?.source === 'mbenzin.cz'
                    ? <div className="text-[9px] text-green-500">✓ ověřeno</div>
                    : <div className="text-[9px] text-gray-400">~ odhad</div>
                  }
                </td>
                <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {formatPrice(s.price?.natural_95 ?? null)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {formatPrice(s.price?.nafta ?? null)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
