import { StationWithPrice } from '@/types';

export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BenzinMapa.cz',
    alternateName: 'FuelMapa.cz',
    url: 'https://benzinmapa.cz',
    description: 'Nejlevnější benzín a nafta v ČR. Srovnání cen pohonných hmot a interaktivní mapa čerpacích stanic.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://benzinmapa.cz/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function GasStationJsonLd({ station }: { station: StationWithPrice }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'GasStation',
    name: station.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: station.address,
      addressLocality: station.city,
      addressRegion: station.region,
      addressCountry: 'CZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: station.lat,
      longitude: station.lng,
    },
    openingHours: station.opening_hours,
    url: `https://benzinmapa.cz/stanice/${station.id}`,
    ...(station.price?.natural_95 && {
      offers: [
        {
          '@type': 'Offer',
          name: 'Natural 95',
          price: station.price.natural_95,
          priceCurrency: 'CZK',
        },
        ...(station.price?.nafta ? [{
          '@type': 'Offer',
          name: 'Nafta',
          price: station.price.nafta,
          priceCurrency: 'CZK',
        }] : []),
      ],
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CityPageJsonLd({ city, stations }: { city: string; stations: StationWithPrice[] }) {
  const cheapest = stations
    .filter(s => s.price?.natural_95 != null)
    .sort((a, b) => (a.price!.natural_95 ?? 999) - (b.price!.natural_95 ?? 999))[0];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Nejlevnější benzín ${city}`,
    description: `Seznam nejlevnějších čerpacích stanic s cenami pohonných hmot v ${city}`,
    numberOfItems: stations.length,
    ...(cheapest && {
      itemListElement: stations.slice(0, 5).map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'GasStation',
          name: s.name,
          address: s.address,
          url: `https://benzinmapa.cz/stanice/${s.id}`,
        },
      })),
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
