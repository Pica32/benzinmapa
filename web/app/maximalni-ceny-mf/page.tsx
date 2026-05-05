import type { Metadata } from 'next';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { getStats, formatPrice } from '@/lib/data';
import Link from 'next/link';
import { Info, Shield, TrendingDown } from 'lucide-react';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Maximální ceny benzínu a nafty MF ČR 2026 | BenzinMapa',
  description: 'Aktuální maximální přípustné ceny pohonných hmot stanovené Ministerstvem financí ČR. Natural 95, nafta, LPG – zákonné stropy pro všechny čerpací stanice v ČR.',
  alternates: { canonical: 'https://benzinmapa.cz/maximalni-ceny-mf/' },
  keywords: [
    'maximální cena benzínu MF', 'maximální přípustná cena nafty', 'MF ČR ceny pohonných hmot',
    'strop ceny benzínu 2026', 'regulace cen paliv ČR', 'maximální cena Natural 95',
    'cenový strop nafta', 'Ministerstvo financí benzín',
  ],
  openGraph: {
    title: 'Maximální přípustné ceny benzínu a nafty MF ČR 2026',
    description: 'Zákonné stropy cen pohonných hmot pro všechny čerpací stanice v ČR. Aktuální data Ministerstva financí.',
    type: 'website',
    url: 'https://benzinmapa.cz/maximalni-ceny-mf/',
  },
};

const FAQS = [
  { q: 'Co jsou maximální přípustné ceny pohonných hmot?', a: 'Jsou to zákonné stropy cen, které stanovuje Ministerstvo financí ČR. Žádná čerpační stanice v ČR nesmí prodávat palivo nad tyto limity. Stropy jsou stanovovány pravidelně na základě vývoje světových cen ropy a kurzu dolaru.' },
  { q: 'Jak často se maximální ceny mění?', a: 'Ministerstvo financí ČR aktualizuje maximální ceny zpravidla každý týden nebo dvoutýdně. Vyhlašuje je prostřednictvím Cenového věstníku. V době prudkého poklesu cen ropy se stropy snižují, aby odrážely tržní realitu.' },
  { q: 'Co se stane, když čerpací stanice překročí maximální cenu?', a: 'Porušení cenové regulace je správní delikt. Česká obchodní inspekce (ČOI) provádí kontroly a může uložit pokutu až 1 milion Kč. Spotřebitelé mohou případy nahlásit přímo na ČOI.' },
  { q: 'Platí maximální ceny pro všechna paliva?', a: 'Ministerstvo financí reguluje zejména Natural 95 a naftu. LPG a CNG regulaci nepodléhají. Premium paliva (Natural 98, Diesel+) mají zpravidla vyšší limity než základní paliva.' },
  { q: 'Jsou aktuální ceny na čerpačkách blízko stropu?', a: 'V aktuálním tržním prostředí jsou průměrné ceny výrazně pod státními stropy. Stropy fungují jako pojistka pro případy spekulativního zdražování nebo krizových situací – ne jako běžná cena.' },
  { q: 'Jak zjistím aktuální maximální ceny?', a: 'Aktuální stropy zveřejňuje Ministerstvo financí ČR na svých stránkách v sekci Cenový věstník. BenzinMapa.cz zobrazuje stropy spolu s aktuálním průměrem trhu na stránkách vývoje cen a přehledu nejlevnějšího benzínu.' },
];

// Historický přehled stropů (orientační, aktualizovat při změnách)
const HISTORY = [
  { period: 'Duben–Květen 2026', n95: '42,79', nafta: '44,15' },
  { period: 'Únor–Březen 2026',  n95: '44,10', nafta: '45,50' },
  { period: 'Prosinec 2025',     n95: '44,80', nafta: '46,00' },
  { period: 'Září 2025',         n95: '43,50', nafta: '44,90' },
];

export default function MaximalniCenyMfPage() {
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const avg95  = stats?.averages.natural_95;
  const avgNafta = stats?.averages.nafta;

  const MF_N95   = 42.79;
  const MF_NAFTA = 44.15;

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Maximální ceny MF ČR', item: 'https://benzinmapa.cz/maximalni-ceny-mf/' },
      ]} />
      <FaqJsonLd faqs={FAQS} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Maximální ceny MF ČR</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} className="text-blue-600 flex-shrink-0" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Maximální přípustné ceny benzínu a nafty – {today}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Zákonné cenové stropy stanovené Ministerstvem financí ČR. Žádná čerpací stanice v ČR je nesmí překročit.
        </p>

        {/* Aktuální stropy */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
            <div className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">Natural 95 — zákonný strop</div>
            <div className="text-4xl font-black text-blue-700 dark:text-blue-300 mb-1">{MF_N95.toFixed(2).replace('.', ',')} Kč</div>
            <div className="text-xs text-gray-500 mb-3">s DPH / litr · MF ČR</div>
            {avg95 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-0.5">Průměr trhu dnes</div>
                <div className="text-xl font-black text-green-700 dark:text-green-400">{avg95.toFixed(2).replace('.', ',')} Kč</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-semibold">
                  ▼ {(MF_N95 - avg95).toFixed(2).replace('.', ',')} Kč pod stropem ({((MF_N95 - avg95) / MF_N95 * 100).toFixed(1)} %)
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
            <div className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">Nafta — zákonný strop</div>
            <div className="text-4xl font-black text-blue-700 dark:text-blue-300 mb-1">{MF_NAFTA.toFixed(2).replace('.', ',')} Kč</div>
            <div className="text-xs text-gray-500 mb-3">s DPH / litr · MF ČR</div>
            {avgNafta && (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-0.5">Průměr trhu dnes</div>
                <div className="text-xl font-black text-green-700 dark:text-green-400">{avgNafta.toFixed(2).replace('.', ',')} Kč</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-semibold">
                  ▼ {(MF_NAFTA - avgNafta).toFixed(2).replace('.', ',')} Kč pod stropem ({((MF_NAFTA - avgNafta) / MF_NAFTA * 100).toFixed(1)} %)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jak to funguje */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jak regulace maximálních cen funguje</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Ministerstvo financí ČR má ze zákona pravomoc stanovovat <strong>maximální maloobchodní ceny pohonných hmot</strong>.
            Tato regulace byla zavedena jako ochrana spotřebitelů před spekulativním zdražováním — zejména v krizových situacích
            (energetická krize 2022, výpadky dodávek apod.).
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Stropy jsou stanovovány <strong>každý týden nebo dvoutýdně</strong> na základě výpočtu zahrnujícího:
            aktuální cenu ropy Brent, kurz CZK/USD, spotřební daň (Natural 95: 12,84 Kč/l, nafta: 9,95 Kč/l), DPH 21 %
            a přiměřenou distribuční marži. Výsledné limity jsou vyhlašovány v Cenovém věstníku.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Kontrolu dodržování provádí <strong>Česká obchodní inspekce (ČOI)</strong>. Pokuta za porušení může dosáhnout
            až 1 milionu Kč. Spotřebitelé mohou přestupky nahlásit na portálu ČOI.
          </p>
          <a href="https://mf.gov.cz/cs/kontrola-a-regulace/cenova-regulace-a-kontrola/maximalni-pripustne-ceny-benzinu-a-nafty"
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 hover:underline font-medium">
            Zdroj: Ministerstvo financí ČR – Maximální přípustné ceny →
          </a>
        </section>

        {/* Historické stropy */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Historie stropů cen v ČR</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg">Období</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Natural 95 max.</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300 rounded-tr-lg">Nafta max.</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}`}>
                    <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">{h.period}</td>
                    <td className="p-3 text-right text-blue-700 dark:text-blue-300 font-bold">{h.n95} Kč</td>
                    <td className="p-3 text-right text-blue-700 dark:text-blue-300 font-bold">{h.nafta} Kč</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Hodnoty jsou orientační. Aktuální stropy vždy ověřujte na stránkách MF ČR.</p>
        </section>

        {/* FAQ */}
        <section className="space-y-3 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Časté dotazy o maximálních cenách paliv</h2>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white flex justify-between items-center">
                {q}<span className="text-green-600 ml-3 text-xs flex-shrink-0">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/nejlevnejsi-benzin/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější benzín v ČR dnes</Link>
          <Link href="/nejlevnejsi-nafta/" className="text-green-700 dark:text-green-400 hover:underline">→ Nejlevnější nafta v ČR dnes</Link>
          <Link href="/vyvoj-ceny/" className="text-green-700 dark:text-green-400 hover:underline">→ Vývoj cen paliv – grafy</Link>
        </div>
      </div>
    </>
  );
}
