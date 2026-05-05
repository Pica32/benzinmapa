'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { FuelType, FUEL_LABELS, BRANDS, CITIES } from '@/types';
import { MapPin, SlidersHorizontal, Search, X } from 'lucide-react';

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
  onMapPan?: (lat: number, lng: number, zoom?: number) => void;
  locating?: boolean;
  locationSource?: 'ip' | 'gps' | null;
}

// Kraje ČR s centroidem pro navigaci
const REGIONS = [
  { name: 'Praha',                    lat: 50.0755, lng: 14.4378, zoom: 12 },
  { name: 'Středočeský kraj',         lat: 49.8805, lng: 14.6576, zoom: 10 },
  { name: 'Jihočeský kraj',           lat: 49.0000, lng: 14.4800, zoom: 10 },
  { name: 'Plzeňský kraj',            lat: 49.7385, lng: 13.3736, zoom: 10 },
  { name: 'Karlovarský kraj',         lat: 50.1440, lng: 12.9338, zoom: 10 },
  { name: 'Ústecký kraj',             lat: 50.6113, lng: 13.8259, zoom: 10 },
  { name: 'Liberecký kraj',           lat: 50.6565, lng: 15.0543, zoom: 10 },
  { name: 'Královéhradecký kraj',     lat: 50.3592, lng: 15.8351, zoom: 10 },
  { name: 'Pardubický kraj',          lat: 49.9450, lng: 15.7690, zoom: 10 },
  { name: 'Vysočina',                 lat: 49.3961, lng: 15.5933, zoom: 10 },
  { name: 'Jihomoravský kraj',        lat: 49.0200, lng: 16.6200, zoom: 10 },
  { name: 'Olomoucký kraj',           lat: 49.5938, lng: 17.2509, zoom: 10 },
  { name: 'Zlínský kraj',             lat: 49.2243, lng: 17.6628, zoom: 10 },
  { name: 'Moravskoslezský kraj',     lat: 49.8216, lng: 18.2625, zoom: 10 },
];

type Suggestion = {
  label: string;
  sublabel?: string;
  lat: number;
  lng: number;
  zoom: number;
};

export default function FilterBar({
  fuelType, onFuelChange,
  maxPrice, onMaxPriceChange,
  selectedBrands, onBrandsChange,
  onLocate, search, onSearchChange,
  onMapPan,
  locating, locationSource,
}: FilterBarProps) {
  const fuels: FuelType[] = ['natural_95', 'natural_98', 'nafta', 'lpg'];
  const [inputValue, setInputValue] = useState(search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  // Suggestions: města + kraje filtrované podle inputu
  const suggestions = useMemo((): Suggestion[] => {
    const q = inputValue.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: Suggestion[] = [];

    // Kraje
    for (const r of REGIONS) {
      if (r.name.toLowerCase().includes(q)) {
        results.push({ label: r.name, sublabel: 'kraj', lat: r.lat, lng: r.lng, zoom: r.zoom });
      }
    }

    // Města
    for (const c of CITIES) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ label: c.name, sublabel: 'město', lat: c.lat, lng: c.lng, zoom: 13 });
      }
    }

    return results.slice(0, 8);
  }, [inputValue]);

  // Sync external search → input when cleared externally
  useEffect(() => {
    if (!search) setInputValue('');
  }, [search]);

  const handleSelect = (s: Suggestion) => {
    setInputValue(s.label);
    onSearchChange(''); // Vymažeme textový filtr — navigujeme na místo
    setShowSuggestions(false);
    setActiveIdx(-1);
    onMapPan?.(s.lat, s.lng, s.zoom);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onSearchChange(val); // filtr stanic se stále aplikuje
    setShowSuggestions(true);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-3 mb-3">

          {/* Search s autocomplete */}
          <div className="flex-1 min-w-[200px] relative">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleKeyDown}
                placeholder="Hledat město, kraj, ulici nebo stanici…"
                aria-label="Vyhledat město nebo stanici"
                aria-autocomplete="list"
                aria-expanded={showSuggestions && suggestions.length > 0}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  aria-label="Vymazat hledání"
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown se suggestemi */}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={listRef}
                role="listbox"
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-[2000] overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={`${s.label}-${i}`}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseDown={() => handleSelect(s)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                      i === activeIdx
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{s.label}</span>
                    </span>
                    {s.sublabel && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                        {s.sublabel}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Locate button */}
          <button
            onClick={onLocate}
            disabled={locating}
            aria-label={locating ? 'Hledám GPS polohu...' : 'Zjistit moji GPS polohu'}
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
              aria-label={`Zobrazit ceny paliva: ${FUEL_LABELS[f]}`}
              aria-pressed={fuelType === f}
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
              aria-label={`Maximální cena paliva: ${maxPrice.toFixed(1)} Kč`}
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
                aria-label={`Filtrovat značku: ${b}`}
                aria-pressed={selectedBrands.includes(b)}
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
