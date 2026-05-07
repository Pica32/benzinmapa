import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import PartnersFooter from '@/components/PartnersFooter';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/JsonLd';
import WebVitals from '@/components/WebVitals';
import CookieConsent from '@/components/CookieConsent';

const GA_ID = 'G-NE6QMNHHJ9';

const consentDefaults = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });
`;

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: true });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://benzinmapa.cz'),
  title: {
    // "BenzinMapa" bez .cz na začátku = doména není v titulku jako primární klíčové slovo
    default: 'Nejlevnější benzín a nafta v ČR dnes – BenzinMapa',
    template: '%s – BenzinMapa',
  },
  description: 'Nejlevnější benzín a nafta v ČR. Srovnání cen pohonných hmot na čerpacích stanicích, interaktivní mapa, aktuální ceny dnes. Natural 95, nafta, LPG, CNG.',
  keywords: [
    'nejlevnější benzín', 'nejlevnější nafta', 'ceny benzínu', 'ceny nafty',
    'čerpací stanice', 'pohonné hmoty', 'natural 95', 'nafta cena dnes',
    'benzin cena', 'levný benzín', 'levná nafta', 'srovnání cen benzínu',
    'mapa čerpacích stanic', 'čerpačka', 'benzinmapa',
  ],
  authors: [{ name: 'BenzinMapa.cz' }],
  creator: 'BenzinMapa.cz',
  publisher: 'BenzinMapa.cz',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://benzinmapa.cz/',
    siteName: 'BenzinMapa',
    title: 'Nejlevnější benzín a nafta v ČR – BenzinMapa',
    description: 'Aktuální ceny pohonných hmot na 2 400+ čerpacích stanicích. Interaktivní mapa. Natural 95, nafta, LPG.',
    images: [{
      url: 'https://benzinmapa.cz/og-image.jpg',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
      alt: 'BenzinMapa – mapa nejlevnějších čerpacích stanic v ČR',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nejlevnější benzín a nafta v ČR – BenzinMapa',
    description: 'Aktuální ceny pohonných hmot na 2 400+ stanicích. Najděte nejlevnější čerpačku.',
    images: ['https://benzinmapa.cz/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://benzinmapa.cz/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <head>
        {/* Google tag (gtag.js) — Consent Mode v2 default 'denied'; aktivuje CookieConsent */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        {/* Apple touch icon – vyžadováno iOS a SEO auditory */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#16a34a" />
        {/* Preload kritická data – browser stáhne zároveň s HTML, ne až po JS hydrataci */}
        <link rel="preload" href="/data/map_data.json" as="fetch" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://ip-api.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col`}>
        <WebVitals />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <PartnersFooter />
        <footer className="bg-gray-900 text-gray-400 text-center py-4 text-xs border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
            <span>© {new Date().getFullYear()} BenzinMapa.cz</span>
            <span>Ceny jsou orientační a aktualizovány každých 6 hodin.</span>
            <a href="/zasady-cookies" className="hover:text-blue-400 transition-colors">
              Zásady cookies
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61589320316796"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
              aria-label="BenzinMapa.cz na Facebooku"
            >
              Facebook
            </a>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
