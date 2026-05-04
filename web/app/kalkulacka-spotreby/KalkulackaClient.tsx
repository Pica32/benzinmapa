'use client';
import { useState } from 'react';

interface Props {
  avgBenzin: number | null;
  avgNafta: number | null;
  avgLpg: number | null;
}

const FUEL_OPTIONS = [
  { value: 'benzin',  label: 'Natural 95 (benzín)' },
  { value: 'nafta',   label: 'Nafta (diesel)' },
  { value: 'lpg',     label: 'LPG autogas' },
];

export default function KalkulackaClient({ avgBenzin, avgNafta, avgLpg }: Props) {
  const [spotreba, setSpotreba] = useState('7.5');
  const [najezd, setNajezd] = useState('15000');
  const [palivo, setPalivo] = useState<'benzin' | 'nafta' | 'lpg'>('benzin');
  const [vlastniCena, setVlastniCena] = useState('');

  const priceMap = { benzin: avgBenzin, nafta: avgNafta, lpg: avgLpg };
  const autoPrice = priceMap[palivo];
  const usedPrice = vlastniCena ? parseFloat(vlastniCena.replace(',', '.')) : autoPrice;

  const spotrebaNum = parseFloat(spotreba.replace(',', '.')) || 0;
  const najezdNum   = parseFloat(najezd.replace(',', '.')) || 0;

  const literuRok    = (spotrebaNum / 100) * najezdNum;
  const nakladyRok   = usedPrice ? literuRok * usedPrice : null;
  const nakladyMesic = nakladyRok ? nakladyRok / 12 : null;
  const nakladyKm    = usedPrice ? (spotrebaNum / 100) * usedPrice : null;

  // Srovnání s ostatními palivy
  const comparisons = FUEL_OPTIONS.map(f => {
    const cena = vlastniCena ? null : priceMap[f.value as keyof typeof priceMap];
    if (!cena) return null;
    const rok = (spotrebaNum / 100) * najezdNum * cena;
    return { label: f.label, rok, cena };
  }).filter(Boolean) as { label: string; rok: number; cena: number }[];

  return (
    <div className="space-y-6">
      {/* Vstupy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Zadejte parametry</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Typ paliva
            </label>
            <select
              value={palivo}
              onChange={e => setPalivo(e.target.value as typeof palivo)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {FUEL_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Průměrná spotřeba (l/100 km)
            </label>
            <input
              type="number" min="1" max="30" step="0.1"
              value={spotreba}
              onChange={e => setSpotreba(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="7.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Roční nájezd (km)
            </label>
            <input
              type="number" min="1000" max="200000" step="1000"
              value={najezd}
              onChange={e => setNajezd(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="15000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vlastní cena paliva (Kč/l)
              {autoPrice && (
                <span className="text-gray-400 font-normal ml-1">
                  — průměr ČR: {autoPrice.toFixed(2).replace('.', ',')} Kč
                </span>
              )}
            </label>
            <input
              type="number" min="5" max="80" step="0.1"
              value={vlastniCena}
              onChange={e => setVlastniCena(e.target.value)}
              placeholder={autoPrice ? autoPrice.toFixed(2) : 'průměr ČR'}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Výsledky */}
      {nakladyRok != null && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-gray-800 rounded-2xl border border-green-200 dark:border-gray-700 p-5 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Náklady za rok</div>
            <div className="text-3xl font-black text-green-700 dark:text-green-400">
              {Math.round(nakladyRok).toLocaleString('cs')} Kč
            </div>
            <div className="text-xs text-gray-500 mt-1">{najezdNum.toLocaleString('cs')} km · {spotrebaNum} l/100 km</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Náklady za měsíc</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {Math.round(nakladyMesic!).toLocaleString('cs')} Kč
            </div>
            <div className="text-xs text-gray-500 mt-1">{(najezdNum / 12).toFixed(0)} km / měsíc</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Náklady na km</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {(nakladyKm! * 100).toFixed(1).replace('.', ',')} hal.
            </div>
            <div className="text-xs text-gray-500 mt-1">haléřů na 1 km</div>
          </div>
        </div>
      )}

      {/* Srovnání paliv */}
      {comparisons.length > 1 && !vlastniCena && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Srovnání nákladů při stejné spotřebě a nájezdu
          </h3>
          <div className="space-y-3">
            {comparisons
              .sort((a, b) => a.rok - b.rok)
              .map((c, i) => {
                const best = Math.min(...comparisons.map(x => x.rok));
                const pct = ((c.rok - best) / best * 100);
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{c.label}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${(best / c.rok) * 100}%` }}
                      />
                    </div>
                    <div className="w-28 text-right text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                      {Math.round(c.rok).toLocaleString('cs')} Kč
                    </div>
                    {pct > 0 && (
                      <div className="w-16 text-right text-xs text-red-500 flex-shrink-0">
                        +{pct.toFixed(0)} %
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Výpočet při aktuálních průměrných cenách v ČR. Spotřeba LPG je přibližně o 20 % vyšší než benzínu.
          </p>
        </div>
      )}

      {/* Litrů za rok */}
      {literuRok > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-400">
          Za rok spotřebujete přibližně <strong className="text-gray-900 dark:text-white">{Math.round(literuRok).toLocaleString('cs')} litrů</strong> paliva
          {usedPrice && (
            <> při ceně <strong className="text-gray-900 dark:text-white">{usedPrice.toFixed(2).replace('.', ',')} Kč/l</strong></>
          )}.
        </div>
      )}
    </div>
  );
}
