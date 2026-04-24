'use client';

import { FuelType, FUEL_LABELS, BRANDS } from '@/types';
import { MapPin, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  fuelType: FuelType;
  onFuelChange: (f: FuelType) => void;
  maxPrice: number;
  onMaxPriceChange: (p: number) => void;
  selectedBrands: string[];
  onBrandsChange: (b: string[]) => void;
  onLocate: () => void;
  search: string;
  onSearchChange: (s: string) => void;
  locating?: boolean;
  locationSource?: 'ip' | 'gps' | null;
}

export default function FilterBar({
  fuelType, onFuelChange,
  maxPrice, onMaxPriceChange,
  selectedBrands, onBrandsChange,
  onLocate, search, onSearchChange,
  locating, locationSource,
}: FilterBarProps) {
  const fuels: FuelType[] = ['natural_95', 'natural_98', 'nafta', 'lpg'];

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Hledat město, ulici nebo stanici..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Locate button */}
          <button
            onClick={onLocate}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {locating
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <MapPin size={16} />
            }
            <span className="hidden sm:inline">
              {locating ? 'Hledám...' : locationSource === 'gps' ? 'GPS ✓' : 'GPS poloha'}
            </span>
          </button>
        </div>

        {/* Fuel type tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {fuels.map(f => (
            <button
              key={f}
              onClick={() => onFuelChange(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                fuelType === f
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {FUEL_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Price range + brands */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Max. cena:</span>
            <input
              type="range"
              min={25}
              max={50}
              step={0.5}
              value={maxPrice}
              onChange={e => onMaxPriceChange(Number(e.target.value))}
              className="w-28 accent-green-600"
            />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400 w-16">
              {maxPrice.toFixed(1)} Kč
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {BRANDS.slice(0, 6).map(b => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedBrands.includes(b)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
