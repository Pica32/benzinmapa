'use client';

import { useEffect, useRef, useCallback } from 'react';
import { StationWithPrice, FuelType, FUEL_LABELS } from '@/types';

interface MapViewProps {
  stations: StationWithPrice[];
  fuelType: FuelType;
  userLat?: number;
  userLng?: number;
}

function getPriceColor(price: number, allPrices: number[]): string {
  if (!allPrices.length) return '#6b7280';
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)];
  const p80 = sorted[Math.floor(sorted.length * 0.8)];
  if (price <= p20) return '#16a34a';
  if (price >= p80) return '#dc2626';
  return '#d97706';
}

function kmBetween(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function MapView({ stations, fuelType, userLat, userLng }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store the Leaflet map instance
  const mapRef = useRef<any>(null);
  // Store the markers layer
  const layerRef = useRef<any>(null);
  // Store Leaflet module itself so we don't import twice
  const LRef = useRef<any>(null);

  // ── Render / refresh markers ──────────────────────────────────
  const renderMarkers = useCallback(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();

    const prices = stations
      .map(s => s.price?.[fuelType])
      .filter((p): p is number => p != null);

    stations.forEach(station => {
      const price = station.price?.[fuelType];
      if (price == null) return;

      const color = getPriceColor(price, prices);
      const dist = (userLat != null && userLng != null)
        ? kmBetween(userLat, userLng, station.lat, station.lng)
        : null;

      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;border-radius:20px;padding:3px 8px;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);white-space:nowrap;cursor:pointer;line-height:1.4">${price.toFixed(2).replace('.', ',')}</div>`,
        iconAnchor: [26, 12],
        popupAnchor: [0, -16],
      });

      const priceRows = ([
        ['Natural 95', station.price?.natural_95],
        ['Nafta', station.price?.nafta],
        ['LPG', station.price?.lpg],
      ] as [string, number | null | undefined][])
        .filter(([, v]) => v != null)
        .map(([lbl, v]) => `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:4px 10px;text-align:center">
            <div style="font-size:9px;color:#166534;text-transform:uppercase;letter-spacing:.05em">${lbl}</div>
            <div style="font-weight:800;color:#15803d;font-size:14px">${Number(v).toFixed(2).replace('.', ',')} Kč</div>
          </div>`).join('');

      const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
      const waze  = `https://waze.com/ul?ll=${station.lat},${station.lng}&navigate=yes`;

      const popup = `
        <div style="font-family:system-ui,sans-serif;min-width:210px;max-width:260px">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px;line-height:1.3">${station.name}</div>
          <div style="color:#6b7280;font-size:11px;margin-bottom:8px">${station.address}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${priceRows}</div>
          ${dist ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:4px">📍 ${dist} km od vás</div>` : ''}
          <div style="font-size:11px;color:#9ca3af;margin-bottom:10px">⏰ ${station.opening_hours}</div>
          <div style="display:flex;gap:6px">
            <a href="${gmaps}" target="_blank" rel="noopener"
               style="flex:1;background:#16a34a;color:#fff;text-align:center;padding:7px 4px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none">
              🗺 Google Maps
            </a>
            <a href="${waze}" target="_blank" rel="noopener"
               style="flex:1;background:#33ccff;color:#000;text-align:center;padding:7px 4px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none">
              📡 Waze
            </a>
          </div>
          <a href="/stanice/${station.id}/"
             style="display:block;margin-top:6px;background:#f3f4f6;color:#374151;text-align:center;padding:7px;border-radius:7px;font-size:11px;font-weight:600;text-decoration:none;border:1px solid #e5e7eb">
            Detail stanice →
          </a>
        </div>`;

      L.marker([station.lat, station.lng], { icon })
        .bindPopup(popup, { maxWidth: 270 })
        .addTo(layer);
    });
  }, [stations, fuelType, userLat, userLng]);

  // ── Init map (only once) ──────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      // Import Leaflet + CSS
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled) return;

      LRef.current = L;

      const map = L.map(containerRef.current!, {
        center: [49.82, 15.47],
        zoom: 8,
        zoomControl: true,
        preferCanvas: false,
        scrollWheelZoom: false,
      });

      containerRef.current!.addEventListener('click', () => {
        map.scrollWheelZoom.enable();
      });
      containerRef.current!.addEventListener('mouseleave', () => {
        map.scrollWheelZoom.disable();
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // MarkerCluster — dynamický import, fallback na layerGroup
      let clusterLayer: any;
      try {
        await import('leaflet.markercluster/dist/MarkerCluster.css');
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
        await import('leaflet.markercluster');
        const mcg = (L as any).markerClusterGroup;
        if (typeof mcg === 'function') {
          clusterLayer = mcg.call(L, {
            maxClusterRadius: 60,
            disableClusteringAtZoom: 13,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster: any) => {
              const count = cluster.getChildCount();
              const size = count < 10 ? 36 : count < 50 ? 44 : 52;
              return L.divIcon({
                className: '',
                html: `<div style="width:${size}px;height:${size}px;background:#16a34a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${size < 44 ? 12 : 14}px;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.3)">${count}</div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
              });
            },
          });
        }
      } catch { /* plugin se nenačetl, fallback */ }

      layerRef.current = (clusterLayer ?? L.layerGroup()).addTo(map);

      // Render markers for the first time after map is ready
      renderMarkers();
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      LRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   // run once

  // ── Re-render markers when filters/data change ───────────────
  useEffect(() => {
    if (!mapRef.current) return;
    renderMarkers();
  }, [renderMarkers]);

  // ── Pan to user location ──────────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || userLat == null || userLng == null) return;

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,.3)"></div>`,
      iconAnchor: [8, 8],
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .bindPopup('<b>Vaše poloha</b>')
      .addTo(map)
      .openPopup();
    map.setView([userLat, userLng], 13);
  }, [userLat, userLng]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />

      {/* Legenda */}
      <div className="absolute bottom-5 left-3 z-[999] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs border border-gray-200 pointer-events-none">
        <p className="font-bold text-gray-600 uppercase tracking-widest text-[9px] mb-2">
          {FUEL_LABELS[fuelType]}
        </p>
        {([
          ['#16a34a', 'Nejlevnější (↓ 20 %)'],
          ['#d97706', 'Průměrná cena'],
          ['#dc2626', 'Nejdražší (↑ 20 %)'],
        ] as const).map(([color, label]) => (
          <div key={color} className="flex items-center gap-2 mb-1">
            <span className="w-3.5 h-3.5 rounded-full inline-block border border-white shadow"
                  style={{ background: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
