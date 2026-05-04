import type { Metadata } from 'next';
import { BRAND_PAGES } from '@/types';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ceny benzínu podle značky čerpačky – Shell, MOL, OMV, Orlen | BenzinMapa',
  description: 'Srovnání cen pohonných hmot podle značky čerpací stanice v ČR. Shell, MOL, Benzina ORLEN, OMV, EuroOil, Robin Oil – aktuální průměry a srovnání s národním průměrem.',
  alternates: { canonical: 'https://benzinmapa.cz/znacka/' },
  keywords: ['Shell ceny benzínu', 'MOL cena nafty', 'OMV benzín cena', 'Orlen ceny paliv', 'EuroOil benzín', 'srovnání značek čerpacích stanic'],
};

export default function ZnackaIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Ceny benzínu podle značky', item: 'https://benzinmapa.cz/znacka/' },
      ]} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Značky čerpacích stanic</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Ceny benzínu a nafty podle značky čerpačky
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Aktuální průměrné ceny pohonných hmot na stanicích největších sítí v ČR. Klikněte na značku pro detailní přehled stanic a cen.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {BRAND_PAGES.map(brand => (
            <Link key={brand.slug} href={`/znacka/${brand.slug}/`}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${brand.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-black">{brand.name[0]}</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">{brand.fullName}</div>
                  <div className="text-xs text-gray-500">~{brand.stationsCount} stanic v ČR</div>
                </div>
                <div className={`ml-auto text-lg font-black ${brand.priceOffsetNum < 0 ? 'text-green-700 dark:text-green-400' : brand.priceOffsetNum > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {brand.priceOffset}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{brand.description}</p>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">Cenové odchylky jsou průměrné hodnoty oproti národnímu průměru Natural 95 v ČR. Data z BenzinMapa.cz, aktualizováno každých 6 hodin.</p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/" className="text-green-700 dark:text-green-400 hover:underline">→ Mapa čerpacích stanic</Link>
        </div>
      </div>
    </>
  );
}
