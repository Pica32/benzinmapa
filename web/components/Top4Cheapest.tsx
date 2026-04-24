import { StationWithPrice, FuelType, FUEL_LABELS } from '@/types';
import { formatPrice } from '@/lib/data';
import Link from 'next/link';
import { TrendingDown, MapPin, Medal } from 'lucide-react';

interface Props {
  stations: StationWithPrice[];
}

const MEDAL_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-gray-300 text-gray-700',
  'bg-amber-600 text-amber-100',
  'bg-green-100 text-green-800',
];

export default function Top4Cheapest({ stations }: Props) {
  const top4nafta  = [...stations].filter(s => s.price?.nafta).sort((a,b) => (a.price!.nafta??999)-(b.price!.nafta??999)).slice(0,4);
  const top4nat95  = [...stations].filter(s => s.price?.natural_95).sort((a,b) => (a.price!.natural_95??999)-(b.price!.natural_95??999)).slice(0,4);

  return (
    <section className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={20} className="text-green-300" />
          <h2 className="text-white font-bold text-lg">Nejlevnější čerpací stanice v ČR – dnes</h2>
          <span className="ml-auto text-green-300 text-xs">Aktualizováno před chvílí</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nafta */}
          <div>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">Nafta (diesel)</p>
            <div className="space-y-2">
              {top4nafta.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/stanice/${s.id}`}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 transition-colors group"
                >
                  <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${MEDAL_COLORS[i]}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate group-hover:text-green-300 transition-colors">
                      {s.name}
                    </div>
                    <div className="flex items-center gap-1 text-green-300 text-xs">
                      <MapPin size={10} />
                      {s.city}
                    </div>
                  </div>
                  <span className={`font-black text-xl tabular-nums flex-shrink-0 ${i === 0 ? 'text-yellow-300' : 'text-white'}`}>
                    {s.price!.nafta!.toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-green-300 ml-0.5">Kč</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Natural 95 */}
          <div>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">Natural 95 (benzín)</p>
            <div className="space-y-2">
              {top4nat95.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/stanice/${s.id}`}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 transition-colors group"
                >
                  <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${MEDAL_COLORS[i]}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate group-hover:text-green-300 transition-colors">
                      {s.name}
                    </div>
                    <div className="flex items-center gap-1 text-green-300 text-xs">
                      <MapPin size={10} />
                      {s.city}
                    </div>
                  </div>
                  <span className={`font-black text-xl tabular-nums flex-shrink-0 ${i === 0 ? 'text-yellow-300' : 'text-white'}`}>
                    {s.price!.natural_95!.toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-green-300 ml-0.5">Kč</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
