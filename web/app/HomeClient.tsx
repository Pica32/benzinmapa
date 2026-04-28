'use client';

import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
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

  const [fuelType, setFuelType] = useState<FuelType>('natural_95');
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const [locationSource, setLocationSource] = useState<'ip' | 'gps' | null>(null);
  const [locating, setLocating] = useState(false);

  // Načti data na klientovi – jeden request (map_data.json = stations + prices)
  useEffect(() => {
    fetch('/data/map_data.json')
      .then(r => r.json())
      .then((data: any) => {
        const merged: StationWithPrice[] = data.stations.map((s: any) => {
          const p = s.p;
          return {
            ...s,
            price: p ? {
              station_id:  s.id,
              natural_95:  p.n95 ?? null,
              natural_98:  p.n98 ?? null,
              nafta:       p.naf ?? null,
              lpg:         p.lpg ?? null,
              source:      p.src,
              reported_at: p.at ?? '',
            } : null,
          };
        });
        setStations(merged);
        setLoading(false);
      })
      .catch(() => {
        // fallback na původní soubory
        Promise.all([
          fetch('/data/stations_latest.json').then(r => r.json()),
          fetch('/data/prices_latest.json').then(r => r.json()),
        ]).then(([sData, pData]) => {
          const priceMap = new Map<string, any>();
          for (const p of pData.prices) priceMap.set(p.station_id, p);
          setStations(sData.stations.map((s: any) => ({ ...s, price: priceMap.get(s.id) ?? null })));
          setLoading(false);
        }).catch(() => setLoading(false));
      });
  }, []);

  // IP geolokace – automaticky při načtení stránky (přibližná poloha, bez oprávnění)
  useEffect(() => {
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

  const filtered = stations.filter(s => {
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
  });

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
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 text-sm">
                {loading ? `Načítám ${stats.total_stations.toLocaleString('cs')} čerpacích stanic...` : 'Načítám mapu...'}
              </p>
            </div>
          </div>
        }>
          {!loading && (
            <MapView stations={filtered} fuelType={fuelType} userLat={userLat} userLng={userLng} />
          )}
          {loading && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 text-sm">Načítám {stats.total_stations.toLocaleString('cs')} čerpacích stanic...</p>
              </div>
            </div>
          )}
        </Suspense>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-gray-500 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
            <span>↓</span>
            <span>Přejeďte dolů pro seznam nejlevnějších stanic</span>
          </div>
        </div>
      </div>
    </>
  );
}
