// Web Worker: parsuje map_data.json mimo main thread
// Voláno z HomeClient.tsx přes new Worker('/workers/station-parser.js')

self.onmessage = function (e) {
  const { data } = e.data;
  try {
    const stations = data.stations.map((s) => {
      const p = s.p;
      return {
        id: s.id,
        name: s.name,
        brand: s.brand,
        lat: s.lat,
        lng: s.lng,
        address: s.address,
        city: s.city,
        region: s.region,
        services: s.services,
        opening_hours: s.opening_hours,
        price: p ? {
          station_id: s.id,
          natural_95: p.n95 ?? null,
          natural_98: p.n98 ?? null,
          nafta: p.naf ?? null,
          lpg: p.lpg ?? null,
          source: p.src,
          reported_at: p.at ?? '',
        } : null,
      };
    });
    self.postMessage({ ok: true, stations });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) });
  }
};
