'use client';

import Link from 'next/link';
import { Navigation } from 'lucide-react';
import { StationWithPrice, FuelType, FUEL_LABELS } from '@/types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeAgo(isoStr: string): string {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 300) return 'aktuálně';
  if (diff < 3600) return `před ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `před ${Math.round(diff / 3600)} h`;
  return `před ${Math.round(diff / 86400)} dny`;
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

interface Props {
  stations: StationWithPrice[];
  userLat: number;
  userLng: number;
  fuelType: FuelType;
  locationSource: 'ip' | 'gps';
  onRequestGps: () => void;
}

export default function NearbyPanel({ stations, userLat, userLng, fuelType, locationSource, onRequestGps }: Props) {
  const now = Date.now();

  const nearby = stations
    .filter(s => {
      if (s.price?.[fuelType] == null) return false;
      // jen reálné ceny (mbenzin.cz) aktualizované max 2 dny nazpět
      if (s.price.source !== 'mbenzin.cz') return false;
      if (now - new Date(s.price.reported_at).getTime() > TWO_DAYS_MS) return false;
      return true;
    })
    .map(s => ({ ...s, dist: haversineKm(userLat, userLng, s.lat, s.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);

  if (!nearby.length) return null;

  const formatDist = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  return (
    <div className="bg-green-50 dark:bg-gray-800 border-b border-green-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">
              📍 Nejbližší {FUEL_LABELS[fuelType].toLowerCase()} — ověřené ceny
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
              {locationSource === 'gps' ? 'GPS' : 'přibližná poloha'}
            </span>
          </div>
          {locationSource === 'ip' && (
            <button
              onClick={onRequestGps}
              className="text-xs text-green-700 dark:text-green-400 underline hover:no-underline"
            >
              Zpřesnit GPS →
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
          {nearby.map(s => {
            const price = s.price![fuelType]!;
            const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

            return (
              <div
                key={s.id}
                className="flex-shrink-0 snap-start w-44 bg-white dark:bg-gray-700 rounded-xl border border-green-200 dark:border-gray-600 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate max-w-[90px]">
                    {s.brand}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDist(s.dist)}</span>
                </div>

                <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight mb-2 line-clamp-2">
                  {s.name}
                </p>

                <div className="flex items-end justify-between mb-1">
                  <span className="text-xl font-black text-green-700 dark:text-green-400">
                    {price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-gray-400 mb-0.5">Kč/l</span>
                </div>

                <p className="text-[10px] text-gray-400 mb-2">
                  🕐 {timeAgo(s.price!.reported_at)}
                </p>

                <div className="flex gap-1.5">
                  <Link
                    href={`/stanice/${s.id}`}
                    className="flex-1 text-center text-[10px] font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg py-1.5 transition-colors"
                  >
                    Detail
                  </Link>
                  <a
                    href={gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    title="Navigovat v Google Maps"
                  >
                    <Navigation size={12} className="text-gray-600 dark:text-gray-300" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
