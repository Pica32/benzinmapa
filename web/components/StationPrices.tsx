'use client';

import { useState, useRef } from 'react';
import { Fuel } from 'lucide-react';
import { FuelType, FUEL_LABELS, StationWithPrice } from '@/types';
import PriceReport from './PriceReport';

function formatDateCZ(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export default function StationPrices({ station }: { station: StationWithPrice }) {
  const [activeFuel, setActiveFuel] = useState<FuelType | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fuels: FuelType[] = ['natural_95', 'natural_98', 'nafta', 'lpg'];
  const isReal = station.price?.source === 'mbenzin.cz';
  const isStale = isReal && !!station.price?.reported_at &&
    Date.now() - new Date(station.price.reported_at).getTime() > TWO_DAYS_MS;

  function handleUpdate(fuel: FuelType) {
    setActiveFuel(fuel);
    setReportOpen(true);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Fuel size={18} className="text-green-600" /> Aktuální ceny paliv
          </h2>
          {isReal && !isStale && (
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
              ✓ Ověřená cena
            </span>
          )}
          {station.price?.source === 'mbenzin-avg-offset' && (
            <span className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">
              ~ Průměrný odhad
            </span>
          )}
          {isStale && (
            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
              ⚠ Stará cena
            </span>
          )}
        </div>

        {station.price ? (
          <>
            {station.price.source === 'mbenzin-avg-offset' && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-0.5">Nemáme aktuální cenu pro tuto stanici</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Zobrazujeme průměrný odhad podle značky. Znáš skutečnou cenu? Zadej ji tlačítkem níže — pomůžeš ostatním řidičům.
                </p>
              </div>
            )}

            {isStale && station.price.reported_at && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-800 dark:text-red-300">
                <p className="font-semibold mb-0.5">⚠ Cena nebyla dlouho aktualizována</p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  Naposledy z mbenzin.cz: <strong>{formatDateCZ(station.price.reported_at)}</strong>.
                  Znáš aktuální cenu? Pomoz ostatním řidičům a zadej ji tlačítkem níže.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {fuels.map(f => {
                const price = station.price![f];
                const cardBg = price == null
                  ? 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-30'
                  : isStale
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : isReal
                      ? 'bg-green-50 dark:bg-gray-700 border-green-200 dark:border-gray-600'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60';

                const priceCls = price == null
                  ? 'text-gray-300'
                  : isStale
                    ? 'text-red-600 dark:text-red-400'
                    : isReal
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400';

                return (
                  <div key={f} className={`rounded-xl p-4 text-center border transition-opacity ${cardBg}`}>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      {FUEL_LABELS[f]}
                    </div>
                    <div className={`text-2xl font-black ${priceCls}`}>
                      {price != null ? price.toFixed(2).replace('.', ',') : '–'}
                    </div>
                    {price != null && (
                      <div className="text-[10px] mt-0.5">
                        <span className="text-gray-400">Kč/l</span>
                        {!isReal && <span className="text-amber-500 ml-1">~odhad</span>}
                        {isStale && <span className="text-red-400 ml-1">stará</span>}
                      </div>
                    )}
                    <button
                      onClick={() => handleUpdate(f)}
                      className="mt-2 text-[10px] w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 text-gray-500 dark:text-gray-400 rounded-lg px-2 py-1 transition-colors font-semibold"
                    >
                      Aktualizovat
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 text-center">
              {station.price.source === 'mbenzin.cz' && station.price.reported_at
                ? (isStale ? '⚠ ' : '') + `Naposledy z mbenzin.cz: ${formatDateCZ(station.price.reported_at)}`
                : 'Průměrná cena dle značky — není ověřena'
              }
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Ceny momentálně nejsou k dispozici.</p>
        )}
      </div>

      <div ref={reportRef} id="price-report">
        <PriceReport
          stationId={station.id}
          initialFuel={activeFuel ?? 'natural_95'}
          forceOpen={reportOpen}
        />
      </div>
    </>
  );
}
