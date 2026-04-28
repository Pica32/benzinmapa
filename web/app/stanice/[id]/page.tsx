import { getStationById, getStationsWithPrices, formatPrice } from '@/lib/data';
import { GasStationJsonLd } from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, ChevronLeft, Navigation } from 'lucide-react';
import GpsButtons from './GpsButtons';
import StationPrices from '@/components/StationPrices';
import StationMiniMap from '@/components/StationMiniMap';
import ShareButtons from '@/components/ShareButtons';

export const revalidate = 21600;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  // Předgenerujeme všechny stanice s reálnou cenou, zbytek se vygeneruje on-demand
  const all = getStationsWithPrices()
    .filter(s => s.price?.natural_95 != null || s.price?.nafta != null);
  return all.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const station = getStationById(id);
  if (!station) return { title: 'Stanice nenalezena' };
  const p95 = station.price?.natural_95;
  const pNafta = station.price?.nafta;
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const priceStr = [
    p95 ? `Natural 95: ${formatPrice(p95)}/l` : '',
    pNafta ? `nafta: ${formatPrice(pNafta)}/l` : '',
  ].filter(Boolean).join(', ');

  return {
    title: `${station.name} – ceny paliv ${today} | ${station.city}`,
    description: `Aktuální ceny pohonných hmot – ${station.name}, ${station.address}, ${station.city}. ${priceStr}. Otevírací doba: ${station.opening_hours}. Navigace, GPS souřadnice a mapa.`,
    alternates: { canonical: `https://benzinmapa.cz/stanice/${id}/` },
    openGraph: {
      title: `${station.name} – ceny paliv | ${station.city}`,
      description: `${priceStr ? priceStr + '. ' : ''}${station.address}, ${station.city}. Aktuální ceny, mapa a navigace.`,
      type: 'website',
      url: `https://benzinmapa.cz/stanice/${id}/`,
    },
    keywords: [
      `${station.name}`, `${station.brand} ${station.city}`,
      `čerpací stanice ${station.city}`, `benzín ${station.city}`,
      `nafta ${station.city}`, `ceny paliv ${station.city}`,
    ],
  };
}

const SERVICE_ICONS: Record<string, string> = {
  wc: '🚻 WC',
  mycka: '🚗 Myčka',
  obcerstveni: '☕ Občerstvení',
  lpg: '🟢 LPG',
  cnr: '🔵 CNG',
};

export default async function StationPage({ params }: Props) {
  const { id } = await params;
  const station = getStationById(id);
  if (!station) notFound();

  const lat = station.lat.toFixed(6);
  const lng = station.lng.toFixed(6);

  const googleMapsUrl  = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeUrl        = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const appleMapsUrl   = `https://maps.apple.com/?daddr=${lat},${lng}`;
  const osmUrl         = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;

  return (
    <>
      <GasStationJsonLd station={station} />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link href="/" className="hover:text-green-600">Mapa</Link>
          <span>›</span>
          <Link href={`/mesto/${station.city.toLowerCase().normalize('NFD').replace(/[̀-͟]/g,'').replace(/\s+/g,'-')}/`}
                className="hover:text-green-600">{station.city}</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{station.name}</span>
        </nav>

        {/* Hlavní karta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2.5 py-0.5 rounded-full uppercase tracking-wide mb-2">
                {station.brand}
              </span>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{station.name}</h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin size={13} /> {station.address}
              </p>
              <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                <Clock size={13} /> {station.opening_hours}
              </p>
            </div>
          </div>

          {/* Služby */}
          {station.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              {station.services.map(s => (
                <span key={s} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">
                  {SERVICE_ICONS[s] ?? s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CENY + HLÁŠENÍ CEN */}
        <StationPrices station={station} />

        {/* GPS + NAVIGACE */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-green-600" /> GPS a navigace
          </h2>

          {/* GPS souřadnice */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4 font-mono text-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-gray-400 text-xs">Zeměpisná šířka</span>
                <p className="font-bold text-gray-900 dark:text-white text-base">{lat}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Zeměpisná délka</span>
                <p className="font-bold text-gray-900 dark:text-white text-base">{lng}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Formát decimal</span>
                <p className="font-bold text-gray-900 dark:text-white text-base">{lat}, {lng}</p>
              </div>
            </div>
          </div>

          {/* Tlačítko kopírovat GPS – client component */}
          <GpsButtons lat={lat} lng={lng} name={station.name} />

          {/* Navigační tlačítka */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700 transition-all group">
              <span className="text-2xl">🗺</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400">Google Maps</span>
            </a>

            <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group">
              <span className="text-2xl">📡</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Waze</span>
            </a>

            <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group">
              <span className="text-2xl">🍎</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-700">Apple Maps</span>
            </a>

            <a href={osmUrl} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all group">
              <span className="text-2xl">🌍</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-700">OpenStreetMap</span>
            </a>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5 shadow-sm">
          <div className="w-full" style={{ height: 280 }}>
            <StationMiniMap lat={station.lat} lng={station.lng} name={station.name} />
          </div>
          <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={10} />
            {station.address} &nbsp;·&nbsp; GPS: {lat}, {lng}
          </div>
        </div>

        {/* SDÍLENÍ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sdílet tuto stanici</p>
          <ShareButtons url={`https://benzinmapa.cz/stanice/${id}`} title={`${station.name} – ceny paliv | BenzinMapa.cz`} />
        </div>

        {/* SEO textový obsah */}
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            O čerpací stanici {station.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Čerpací stanice <strong>{station.name}</strong> se nachází na adrese <strong>{station.address}</strong> v <strong>{station.city}</strong>
            {station.region ? `, ${station.region}` : ''}.
            {station.price?.source === 'mbenzin.cz' && station.price.natural_95
              ? ` Aktuální cena Natural 95 je ${formatPrice(station.price.natural_95)} Kč/l`
              : ''
            }
            {station.price?.nafta ? `, nafta ${formatPrice(station.price.nafta)} Kč/l` : ''}.
            {station.opening_hours && station.opening_hours !== 'Neznámá' ? ` Otevírací doba: ${station.opening_hours}.` : ''}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Stanici {station.name} provozuje síť <strong>{station.brand}</strong>.
            {station.services.length > 0
              ? ` Na stanici jsou k dispozici tyto služby: ${station.services.map(s => ({ wc: 'WC', mycka: 'myčka aut', obcerstveni: 'občerstvení', lpg: 'LPG', cnr: 'CNG' }[s] ?? s)).join(', ')}.`
              : ''
            }
            {' '}GPS souřadnice: {lat}°N, {lng}°E.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Ceny pohonných hmot na BenzinMapa.cz jsou aktualizovány automaticky každých 6 hodin.
            Pokud znáte aktuální cenu, nahlaste ji prostřednictvím formuláře výše — pomůžete ostatním řidičům.
            Srovnání cen všech čerpacích stanic v {station.city} najdete na stránce{' '}
            <Link
              href={`/mesto/${station.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`}
              className="text-green-700 dark:text-green-400 hover:underline"
            >
              ceny benzínu {station.city}
            </Link>.
          </p>
        </section>

        <div className="mt-5 flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 dark:text-green-400 font-medium">
            <ChevronLeft size={16} /> Zpět na mapu
          </Link>
          <Link
            href={`/mesto/${station.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`}
            className="text-sm text-gray-500 hover:text-green-700 dark:text-gray-400"
          >
            Všechny stanice v {station.city} →
          </Link>
        </div>

      </div>
    </>
  );
}
