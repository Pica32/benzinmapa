'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Bar,
} from 'recharts';

type DayData = {
  date: string;
  natural_95: number;
  natural_98?: number;
  nafta: number;
  lpg?: number;
  brent_usd?: number;
  source?: string;
};

const FUEL_COLORS = {
  natural_95: '#16a34a',
  natural_98: '#0ea5e9',
  nafta:      '#f59e0b',
  lpg:        '#8b5cf6',
};
const BRENT_COLOR = '#ef4444';

const FUEL_LABELS: Record<string, string> = {
  natural_95: 'Natural 95 (Kč/l)',
  natural_98: 'Natural 98 (Kč/l)',
  nafta:      'Nafta (Kč/l)',
  lpg:        'LPG (Kč/l)',
  brent_usd:  'Ropa Brent (USD/barel)',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 text-sm min-w-[200px]">
      <p className="font-bold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">
        {new Date(label).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500 text-xs">{FUEL_LABELS[p.dataKey] ?? p.dataKey}</span>
          </div>
          <span className="font-bold text-xs" style={{ color: p.color }}>
            {p.dataKey === 'brent_usd'
              ? `$${Number(p.value).toFixed(1)}`
              : `${Number(p.value).toFixed(2).replace('.', ',')} Kč`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PriceCharts() {
  const [data, setData] = useState<DayData[]>([]);
  const [range, setRange] = useState<30 | 60 | 90>(30);
  const [fuels, setFuels] = useState({
    natural_95: true,
    natural_98: false,
    nafta: true,
    lpg: false,
    brent_usd: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/history_90d.json')
      .then(r => r.json())
      .then(d => { setData(d.days || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.slice(-range);

  const toggleFuel = (f: keyof typeof fuels) =>
    setFuels(prev => ({ ...prev, [f]: !prev[f] }));

  // Statistiky
  const statKeys = Object.keys(fuels) as Array<keyof typeof fuels>;
  const stats = statKeys.map(key => {
    const vals = filtered.map(d => d[key as keyof DayData] as number).filter(Boolean);
    if (!vals.length) return null;
    const change = vals[vals.length - 1] - vals[0];
    return {
      key,
      min: Math.min(...vals),
      max: Math.max(...vals),
      last: vals[vals.length - 1],
      change,
      isBrent: key === 'brent_usd',
    };
  }).filter(Boolean);

  // Zdroj dat
  const realDays = filtered.filter(d => d.source === 'real').length;
  const totalDays = filtered.length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Zdroj dat info */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
          ✓ {Math.min(realDays, 14)} dní reálná data mbenzin.cz
        </span>
        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          ✓ Brent crude: EIA.gov (US vládní data)
        </span>
        <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 text-gray-500 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600">
          ~ Starší CZ ceny: odvozeno z Brent
        </span>
      </div>

      {/* Ovládání */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {([30, 60, 90] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                range === r
                  ? 'bg-white dark:bg-gray-600 shadow text-green-700 dark:text-green-400'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>{r} dní</button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(fuels) as Array<keyof typeof fuels>).map(f => {
            const color = f === 'brent_usd' ? BRENT_COLOR : FUEL_COLORS[f as keyof typeof FUEL_COLORS];
            return (
              <button key={f} onClick={() => toggleFuel(f)}
                className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                style={fuels[f]
                  ? { background: color, borderColor: color, color: 'white' }
                  : { background: 'white', borderColor: '#d1d5db', color: '#6b7280' }}>
                {f === 'brent_usd' ? '🛢 Brent USD' : FUEL_LABELS[f].split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graf – dvě osy Y */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={filtered} margin={{ top: 5, right: 60, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              interval={Math.floor(filtered.length / 7)}
            />
            {/* Levá osa – Kč/l */}
            <YAxis
              yAxisId="czk"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              tickFormatter={v => `${v} Kč`}
              width={62}
            />
            {/* Pravá osa – USD/barel */}
            <YAxis
              yAxisId="usd"
              orientation="right"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#ef4444' }}
              tickLine={false}
              tickFormatter={v => `$${v}`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={v => FUEL_LABELS[v] ?? v} />

            {/* Čáry paliv */}
            {(Object.keys(FUEL_COLORS) as Array<keyof typeof FUEL_COLORS>)
              .filter(f => fuels[f])
              .map(f => (
                <Line
                  key={f}
                  yAxisId="czk"
                  type="monotone"
                  dataKey={f}
                  stroke={FUEL_COLORS[f]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}

            {/* Brent crude – červená čárkovaná čára */}
            {fuels.brent_usd && (
              <Line
                yAxisId="usd"
                type="monotone"
                dataKey="brent_usd"
                stroke={BRENT_COLOR}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-center text-xs text-gray-400 mt-1">
          Levá osa: ceny paliv (Kč/l) &nbsp;·&nbsp; Pravá osa: ropa Brent (USD/barel)
        </p>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {stats.filter(s => s && fuels[s.key as keyof typeof fuels]).map(s => s && (
          <div key={s.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: s.isBrent ? BRENT_COLOR : FUEL_COLORS[s.key as keyof typeof FUEL_COLORS] }} />
              <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold truncate">
                {s.isBrent ? 'Brent' : FUEL_LABELS[s.key]?.split(' ')[0]}
              </span>
            </div>
            <div className="font-black text-lg" style={{ color: s.isBrent ? BRENT_COLOR : FUEL_COLORS[s.key as keyof typeof FUEL_COLORS] }}>
              {s.isBrent ? `$${s.last.toFixed(0)}` : `${s.last.toFixed(2).replace('.', ',')} Kč`}
            </div>
            <div className={`text-xs font-semibold mt-0.5 ${s.change < 0 ? 'text-green-600' : 'text-red-500'}`}>
              {s.change > 0 ? '+' : ''}{s.isBrent ? `$${s.change.toFixed(1)}` : `${s.change.toFixed(2).replace('.', ',')} Kč`}
              <span className="text-gray-400 font-normal"> / {range}d</span>
            </div>
            <div className="text-[10px] text-gray-400">
              min {s.isBrent ? `$${s.min.toFixed(0)}` : `${s.min.toFixed(1).replace('.', ',')} Kč`}
              {' · '}max {s.isBrent ? `$${s.max.toFixed(0)}` : `${s.max.toFixed(1).replace('.', ',')} Kč`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
