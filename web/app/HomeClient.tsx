'use client';

import { useState, useCallback, useEffect, Suspense, lazy, useMemo, useTransition } from 'react';
import { StationWithPrice, FuelType, Stats } from '@/types';
import FilterBar from '@/components/FilterBar';
import StatsBar from '@/components/StatsBar';
import NearbyPanel from '@/components/NearbyPanel';

const MapView = lazy(() => import('@/components/MapView'));

interface HomeClientProps {
  stats: Stats;
}

export default function HomeClient({ stats }: HomeClientProps) {
  const [stations, setStations] = useState<StationWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapActivated, setMapActivated] = useState(false);
  const [, startTransition] = useTransition();

  const [fuelType, setFuelType] = useState<FuelType>('natural_95');
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const [locationSource, setLocationSource] = useState<'ip' | 'gps' | null>(null);
  const [locating, setLocating] = useState(false);

  // Načti data přes Web Worker – parsování 2548 stanic proběhne mimo main thread
  useEffect(() => {
    let worker: Worker | null = null;

    const loadWithWorker = (data: any) => {
      try {
        worker = new Worker('/workers/station-parser.js');
        worker.onmessage = (e) => {
          if (e.data.ok) {
            startTransition(() => {
              setStations(e.data.stations);
              setLoading(false);
            });
          } else {
            loadFallbackParse(data);
          }
          worker?.terminate();
        };
        worker.onerror = () => { loadFallbackParse(data); worker?.terminate(); };
        worker.postMessage({ data });
      } catch {
        loadFallbackParse(data);
      }
    };

    const loadFallbackParse = (data: any) => {
      startTransition(() => {
        const stations: StationWithPrice[] = data.stations.map((s: any) => {
          const p = s.p;
          return { ...s, price: p ? { station_id: s.id, natural_95: p.n95 ?? null, natural_98: p.n98 ?? null, nafta: p.naf ?? null, lpg: p.lpg ?? null, source: p.src, reported_at: p.at ?? '' } : null };
        });
        setStations(stations);
        setLoading(false);
      });
    };

    fetch('/data/map_data.json')
      .then(r => r.json())
      .then(loadWithWorker)
      .catch(() => {
        Promise.all([
          fetch('/data/stations_latest.json').then(r => r.json()),
          fetch('/data/prices_latest.json').then(r => r.json()),
        ]).then(([sData, pData]) => {
          startTransition(() => {
            const priceMap = new Map<string, any>();
            for (const p of pData.prices) priceMap.set(p.station_id, p);
            setStations(sData.stations.map((s: any) => ({ ...s, price: priceMap.get(s.id) ?? null })));
            setLoading(false);
          });
        }).catch(() => setLoading(false));
      });

    return () => { worker?.terminate(); };
  }, []);

  // IP geolokace – odložena o 4s aby neblokovala kritické načítání stránky
  useEffect(() => {
    const t = setTimeout(() => {
      fetch('https://ip-api.com/json?fields=status,lat,lon')
        .then(r => r.json())
        .then(d => {
          if (d.status === 'success' && userLat == null) {
            setUserLat(d.lat);
            setUserLng(d.lon);
            setLocationSource('ip');
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) { alert('Prohlížeč nepodporuje geolokaci.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationSource('gps');
        setLocating(false);
      },
      err => {
        setLocating(false);
        if (err.code === 1) alert('Přístup k poloze zamítnut. Povolte v nastavení prohlížeče.');
        else alert('Polohu nelze získat. Zkuste znovu.');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // useMemo: přefiltrování 2400+ stanic jen při změně závislostí, ne při každém renderu
  const filtered = useMemo(() => stations.filter(s => {
    const price = s.price?.[fuelType];
    if (price == null) return false;
    if (price > maxPrice) return false;
    if (selectedBrands.length && !selectedBrands.includes(s.brand)) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);
    }
    return true;
  }), [stations, fuelType, maxPrice, selectedBrands, search]);

  return (
    <>
      <StatsBar stats={stats} />
      <FilterBar
        fuelType={fuelType} onFuelChange={setFuelType}
        maxPrice={maxPrice} onMaxPriceChange={setMaxPrice}
        selectedBrands={selectedBrands} onBrandsChange={setSelectedBrands}
        onLocate={handleLocate}
        search={search} onSearchChange={setSearch}
        locating={locating}
        locationSource={locationSource}
      />

      {userLat != null && userLng != null && locationSource != null && stations.length > 0 && (
        <NearbyPanel
          stations={stations}
          userLat={userLat}
          userLng={userLng}
          fuelType={fuelType}
          locationSource={locationSource}
          onRequestGps={handleLocate}
        />
      )}

      <div style={{ height: '65vh', minHeight: '420px', maxHeight: '720px' }} className="relative w-full">
        {!mapActivated ? (
          /* Placeholder s náhledem mapy – maplibre-gl se nenačte dokud uživatel neinteraguje */
          <button
            onClick={() => setMapActivated(true)}
            onMouseEnter={() => setMapActivated(true)}
            aria-label="Kliknutím nebo přejetím načíst interaktivní mapu čerpacích stanic"
            className="w-full h-full relative overflow-hidden cursor-pointer border-0 group"
          >
            {/* Náhled mapy jako pozadí */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/map-preview.png"
              alt="Náhled mapy čerpacích stanic v ČR"
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-500"
            />

            {/* Překrytí */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Obsah uprostřed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm font-medium drop-shadow">
                    Načítám {stats.total_stations.toLocaleString('cs')} stanic…
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-green-600 group-hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl shadow-xl transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Zobrazit interaktivní mapu
                  </div>
                  <p className="text-white/80 text-xs drop-shadow">
                    {stats.total_stations.toLocaleString('cs')} čerpacích stanic · kliknutím nebo přejetím myší
                  </p>
                </>
              )}
            </div>
          </button>
        ) : (
          /* Mapa se načte až po kliknutí — maplibre-gl se vyhodnotí teprve teď */
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 text-sm">Načítám mapu…</p>
              </div>
            </div>
          }>
            <MapView stations={filtered} fuelType={fuelType} userLat={userLat} userLng={userLng} />
          </Suspense>
        )}

        {mapActivated && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-gray-500 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
              <span>↓</span>
              <span>Přejeďte dolů pro seznam nejlevnějších stanic</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
