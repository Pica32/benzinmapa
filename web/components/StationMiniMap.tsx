'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function StationMiniMap({ lat, lng, name }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !ref.current) return;

      const map = L.map(ref.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
        iconAnchor: [9, 9],
      });

      L.marker([lat, lng], { icon })
        .bindPopup(`<b>${name}</b>`)
        .addTo(map)
        .openPopup();

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name]);

  return <div ref={ref} className="w-full h-full" style={{ zIndex: 0 }} />;
}
