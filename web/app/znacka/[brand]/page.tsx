import { getStationsByBrand, getStats, formatPrice, getBrandStatsByKeys } from '@/lib/data';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BRAND_PAGES } from '@/types';
import CheapestTable from '@/components/CheapestTable';
import Link from 'next/link';
import { MapPin, TrendingDown } from 'lucide-react';

export const revalidate = 21600;

type Props = { params: Promise<{ brand: string }> };

export async function generateStaticParams() {
  return BRAND_PAGES.map(b => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = BRAND_PAGES.find(b => b.slug === slug);
  if (!brand) return { title: 'Značka nenalezena' };

  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const stations = getStationsByBrand(brand);
  const withPrice = stations.filter(s => s.price?.natural_95);
  const avg95 = withPrice.length
    ? withPrice.reduce((a, s) => a + (s.price!.natural_95 ?? 0), 0) / withPrice.length
    : null;

  return {
    title: `${brand.fullName} ceny benzínu a nafty dnes – ${today} | BenzinMapa`,
    description: `Aktuální ceny pohonných hmot na čerpacích stanicích ${brand.fullName} v ČR.${avg95 ? ` Průměrná cena Natural 95: ${formatPrice(avg95)}/l.` : ''} Přehled ${stations.length} stanic, srovnání s průměrem, mapa.`,
    alternates: { canonical: `https://benzinmapa.cz/znacka/${slug}/` },
    keywords: [
      `${brand.name} ceny benzínu`,
      `${brand.name} cena nafty`,
      `${brand.name} čerpací stanice`,
      `${brand.name} Natural 95 cena`,
      `${brand.name} benzín dnes`,
      `${brand.name} ceny paliv 2026`,
      `${brand.fullName} nejlevnější stanice`,
    ],
    openGraph: {
      title: `${brand.fullName} – aktuální ceny benzínu a nafty`,
      description: `Ceny pohonných hmot na stanicích ${brand.fullName} v ČR dnes. ${stations.length} stanic, srovnání cen.`,
      type: 'website',
      url: `https://benzinmapa.cz/znacka/${slug}/`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: slug } = await params;
  const brand = BRAND_PAGES.find(b => b.slug === slug);
  if (!brand) notFound();

  const stations = getStationsByBrand(brand);
  const stats = getStats();
  const brandStats = getBrandStatsByKeys('natural_95', BRAND_PAGES);
  const myStat = brandStats.get(brand.slug);
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const withPrice95 = stations.filter(s => s.price?.natural_95 && s.price.source === 'mbenzin.cz');
  const withPriceNafta = stations.filter(s => s.price?.nafta && s.price.source === 'mbenzin.cz');

  const avg95 = withPrice95.length
    ? withPrice95.reduce((a, s) => a + (s.price!.natural_95 ?? 0), 0) / withPrice95.length
    : null;
  const avgNafta = withPriceNafta.length
    ? withPriceNafta.reduce((a, s) => a + (s.price!.nafta ?? 0), 0) / withPriceNafta.length
    : null;

  const national95 = stats?.averages.natural_95;
  const nationalNafta = stats?.averages.nafta;

  const top10benzin = [...withPrice95]
    .sort((a, b) => (a.price!.natural_95 ?? 999) - (b.price!.natural_95 ?? 999))
    .slice(0, 10);
  const top10nafta = [...withPriceNafta]
    .sort((a, b) => (a.price!.nafta ?? 999) - (b.price!.nafta ?? 999))
    .slice(0, 10);

  // Rozložení stanic po krajích
  const regionMap: Record<string, number> = {};
  stations.forEach(s => { regionMap[s.region] = (regionMap[s.region] ?? 0) + 1; });
  const topRegions = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const faqs = [
    { q: `Kolik stojí benzín na ${brand.fullName} dnes?`, a: avg95 ? `Průměrná cena Natural 95 na stanicích ${brand.fullName} je dnes ${formatPrice(avg95)}/l. ${national95 && avg95 ? `Oproti národnímu průměru (${formatPrice(national95)}/l) je to o ${Math.abs(avg95 - national95).toFixed(2).replace('.', ',')} Kč ${avg95 < national95 ? 'levněji' : 'dráže'}.` : ''}` : `Aktuální ceny benzínu na stanicích ${brand.fullName} najdete v tabulce výše.` },
    { q: `Kolik stojí nafta na ${brand.fullName} dnes?`, a: avgNafta ? `Průměrná cena nafty na stanicích ${brand.fullName} je dnes ${formatPrice(avgNafta)}/l. ${nationalNafta && avgNafta ? `Oproti národnímu průměru (${formatPrice(nationalNafta)}/l) je to o ${Math.abs(avgNafta - nationalNafta).toFixed(2).replace('.', ',')} Kč ${avgNafta < nationalNafta ? 'levněji' : 'dráže'}.` : ''}` : `Aktuální ceny nafty na stanicích ${brand.fullName} najdete v tabulce výše.` },
    { q: `Kde jsou nejlevnější stanice ${brand.fullName}?`, a: `Nejlevnější stanice ${brand.fullName} najdete seřazené v tabulkách výše. Ceny se liší podle regionu – obvykle jsou levnější stanice mimo dálnice a velká města.` },
    { q: `Kolik má ${brand.fullName} čerpacích stanic v ČR?`, a: `${brand.fullName} provozuje v ČR přibližně ${stations.length} čerpacích stanic, z nichž ${withPrice95.length} má aktuálně nahlášenou cenu benzínu.` },
    { q: `Je ${brand.fullName} levnější nebo dražší než průměr?`, a: myStat
        ? `${brand.fullName} se pohybuje průměrně ${myStat.diffLabel} od národního průměru ceny Natural 95 (vypočítáno z ${myStat.count} stanic s aktuální cenou). ${myStat.diff > 0.05 ? 'Jde o dražší síť než průměr.' : myStat.diff < -0.05 ? 'Patří mezi levnější sítě v ČR.' : 'Ceny jsou přibližně na úrovni národního průměru.'}`
        : `Pro ${brand.fullName} aktuálně nemáme dost dat na výpočet průměrné odchylky. Konkrétní ceny stanic najdete v tabulkách výše.` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Značky čerpacích stanic', item: 'https://benzinmapa.cz/znacka/' },
        { name: brand.fullName },
      ]} />
      <FaqJsonLd faqs={faqs} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <Link href="/znacka/" className="hover:text-green-600">Značky</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">{brand.fullName}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 ${brand.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-black text-lg">{brand.name[0]}</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              {brand.fullName} – ceny benzínu a nafty dnes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{today} · {stations.length} stanic v ČR</p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{brand.description}</p>

        {/* Srovnání průměrů */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {avg95 && national95 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Natural 95 průměr {brand.fullName}</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{avg95.toFixed(2).replace('.', ',')} Kč</div>
              <div className={`text-sm font-semibold mt-1 ${avg95 < national95 ? 'text-green-600' : 'text-red-500'}`}>
                {avg95 < national95 ? '▼' : '▲'} {Math.abs(avg95 - national95).toFixed(2).replace('.', ',')} Kč vs. národní průměr ({national95.toFixed(2).replace('.', ',')} Kč)
              </div>
            </div>
          )}
          {avgNafta && nationalNafta && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Nafta průměr {brand.fullName}</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{avgNafta.toFixed(2).replace('.', ',')} Kč</div>
              <div className={`text-sm font-semibold mt-1 ${avgNafta < nationalNafta ? 'text-green-600' : 'text-red-500'}`}>
                {avgNafta < nationalNafta ? '▼' : '▲'} {Math.abs(avgNafta - nationalNafta).toFixed(2).replace('.', ',')} Kč vs. národní průměr ({nationalNafta.toFixed(2).replace('.', ',')} Kč)
              </div>
            </div>
          )}
        </div>

        {/* Nejlevnější stanice benzín */}
        {top10benzin.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingDown size={18} className="text-green-600" />
              Nejlevnější Natural 95 na stanicích {brand.fullName}
            </h2>
            <CheapestTable stations={top10benzin} fuelType="natural_95" />
          </section>
        )}

        {/* Nejlevnější stanice nafta */}
        {top10nafta.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingDown size={18} className="text-green-600" />
              Nejlevnější nafta na stanicích {brand.fullName}
            </h2>
            <CheapestTable stations={top10nafta} fuelType="nafta" />
          </section>
        )}

        {/* Rozložení po krajích */}
        {topRegions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Stanice {brand.fullName} podle krajů
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topRegions.map(([region, count]) => (
                <div key={region} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500 truncate mb-1">{region}</div>
                  <div className="text-lg font-black text-gray-900 dark:text-white">{count}</div>
                  <div className="text-xs text-gray-400">stanic</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Srovnání s ostatními značkami – počítáno z reálných dat */}
        <section className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Srovnání všech značek</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BRAND_PAGES.map(b => {
              const stat = brandStats.get(b.slug);
              const diff = stat?.diff;
              const diffLabel = stat?.diffLabel ?? '—';
              const colorCls = diff == null
                ? 'text-gray-400'
                : diff < 0
                ? 'text-green-700 dark:text-green-400'
                : diff > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-300';
              return (
                <Link key={b.slug} href={`/znacka/${b.slug}/`}
                  className={`rounded-xl border p-3 text-center transition-all ${b.slug === slug ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-green-400'}`}>
                  <div className={`text-base font-black ${colorCls}`}>{diffLabel}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{b.name}</div>
                  {stat && <div className="text-[10px] text-gray-400 mt-0.5">{stat.count} stanic</div>}
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">Průměrné odchylky od národního průměru Natural 95 v ČR — vypočítáno v reálném čase z aktuálních cen.</p>
        </section>

        {/* FAQ */}
        <section className="space-y-3 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o {brand.fullName}</h2>
          {faqs.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white flex justify-between items-center">
                {q}<span className="text-green-600 ml-3 text-xs flex-shrink-0">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR</Link>
          <Link href="/" className="text-green-700 dark:text-green-400 hover:underline">→ Mapa čerpacích stanic</Link>
        </div>
      </div>
    </>
  );
}
