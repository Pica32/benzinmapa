import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingDown, TrendingUp, BarChart2, ExternalLink, AlertTriangle, Shield, Bitcoin } from 'lucide-react';
import { FaqJsonLd } from '@/components/JsonLd';
import { getStats } from '@/lib/data';
import PriceCharts from './PriceCharts';
import ShareButtons from '@/components/ShareButtons';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Vývoj cen pohonných hmot v ČR – grafy, historie a inflace',
  description: 'Reálná data vývoje cen benzínu a nafty v ČR za 90 dní. Jak inflace a zdražování paliv ničí úspory a jak se bránit. Grafy, analýzy, investiční tipy.',
  alternates: { canonical: 'https://benzinmapa.cz/vyvoj-ceny/' },
  keywords: ['vývoj cen benzínu', 'nafta cena historie', 'inflace pohonné hmoty', 'bitcoin inflace', 'jak chránit úspory'],
};

const FAQS = [
  { q: 'Proč ceny pohonných hmot neustále rostou?', a: 'Ceny benzínu a nafty závisí na ceně ropy Brent, kurzu CZK/USD, spotřební dani v ČR (přes 14 Kč/l) a maržích čerpacích stanic. Inflace dále snižuje kupní sílu koruny, čímž zdražuje každé tankování.' },
  { q: 'Co je inflace a jak ovlivňuje cenu benzínu?', a: 'Inflace je znehodnocování peněz – za stejnou částku koupíte méně. Česká koruna od roku 2020 ztratila přes 30 % kupní síly. Benzín, který stál v roce 2020 kolem 28 Kč/l, dnes stojí přes 40 Kč/l.' },
  { q: 'Jak ochránit úspory před zdražováním pohonných hmot?', a: 'Bitcoin má pevně omezené množství 21 milionů mincí – nemůže být "dotisknut" jako koruny. Historicky roste rychleji než inflace a chrání hodnotu úspor. Nedoporučujeme vkládat více než si můžete dovolit ztratit.' },
  { q: 'Kdy bude benzín levnější?', a: 'Závisí na ceně ropy Brent, rozhodnutích OPECu a kurzu CZK/USD. Sledujte naše grafy pro aktuální trend.' },
];

const TRADING_AFFILIATES = [
  {
    name: 'eToro',
    url: 'https://www.etoro.com/?ref=46049942',
    desc: 'Obchodujte ropu Brent/WTI, energetická ETF i akcie ropných gigantů. CopyTrading – kopírujte nejlepší obchodníky.',
    badge: 'CFD & Akcie',
    color: 'bg-green-600',
    cta: 'Začít obchodovat',
    risk: '68 % retailových investorů přichází o peníze při obchodování CFD.',
  },
  {
    name: 'Trading 212',
    url: 'https://www.trading212.com/invite/11Q8q6QkEB',
    desc: 'Ropa Brent a WTI bez provizí. CFD na energetická ETF, akcie Shell, BP, ExxonMobil.',
    badge: 'Bez provizí',
    color: 'bg-blue-600',
    cta: 'Otevřít účet zdarma',
    risk: '76 % retailových investorů přichází o peníze při obchodování CFD.',
  },
  {
    name: 'Plus500',
    url: 'https://www.plus500.com/cs-cz/refer-friend?rut=h8PD43j-9dcCVPPfHr_f2xy7mVCNZCpG69JVIttXoOLpkL7UqXE4oxcngHSelG4lG9-xijAgMdVaY3GJVVMzU-8VL3LtavUuvl7_TosydLE1',
    desc: 'Specializovaná CFD platforma. Ropa Brent, WTI, Natural Gas, benzín RBOB. Přes 2 000 instrumentů.',
    badge: 'Regulovaný broker',
    color: 'bg-indigo-600',
    cta: 'Demo účet zdarma',
    risk: '80 % retailových investorů přichází o peníze při obchodování CFD.',
  },
  {
    name: 'Degiro',
    url: 'https://www.degiro.cz/?id=52F0C5F2',
    desc: 'Nakupujte akcie ropných firem a energetická ETF (XLE, VDE). Nízké poplatky, regulovaný broker.',
    badge: 'Akcie & ETF',
    color: 'bg-teal-600',
    cta: 'Registrace zdarma',
    risk: 'Investice do akcií jsou spojeny s rizikem ztráty vloženého kapitálu.',
  },
];

const CRYPTO_AFFILIATES = [
  { name: 'Kraken', url: 'https://invite.kraken.com/JDNW/aywgmsis', desc: 'Největší regulovaná burza, nízké poplatky, CZK páry. Ideální pro první nákup BTC.', badge: '🔒 Regulovaný' },
  { name: 'Binance', url: 'https://accounts.binance.com/register?ref=346436875', desc: 'Největší světová burza. Nejširší výběr kryptoměn, nízké poplatky 0.1 %.', badge: '🌍 Největší' },
  { name: 'Anycoin CZ', url: 'https://www.anycoin.cz/register?ref=d82dk0', desc: 'Česká směnárna – nákup Bitcoinu za CZK bez složité registrace. Rychlé vypořádání.', badge: '🇨🇿 Česká' },
  { name: 'Revolut', url: 'https://revolut.com/referral/?referral-code=kari420!JAN1-26-AR-H1&geo-redirect', desc: 'Krypto i akcie v jedné appce. Frakcionální Bitcoin od 1 USD, automatické DCA.', badge: '📱 Appka' },
  { name: 'Trezor Safe 7', url: 'https://trezor.io/trezor-safe-7?transaction_id=102398254191a620fee5eea74faa2d&offer_id=352&affiliate_id=36693', desc: 'Česká hardwarová peněženka pro bezpečné uložení BTC. Open-source, prověřená.', badge: '🛡 HW Wallet' },
  { name: 'Ledger Nano S+', url: 'https://shop.ledger.com/pages/ledger-nano-s-plus/?r=3771127e7ec5', desc: 'Nejprodávanější HW wallet na světě. Bezpečné uložení BTC a tisíců dalších kryptoměn.', badge: '🛡 HW Wallet' },
];

export default async function VyvojCenyPage() {
  const stats = getStats();
  const today = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <FaqJsonLd faqs={FAQS} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">Vývoj cen paliv</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <BarChart2 className="text-green-600" size={30} />
            Vývoj cen pohonných hmot v ČR – {today}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reálná data vývoje cen Natural 95, nafty a LPG z&nbsp;
            <a href="https://www.mbenzin.cz" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">mbenzin.cz</a>.
            {stats && ` Dnes: Natural 95 průměr ${stats.averages.natural_95.toFixed(2).replace('.', ',')} Kč/l, nafta ${stats.averages.nafta.toFixed(2).replace('.', ',')} Kč/l.`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Poslední 2 týdny = reálná data. Starší = realistický odhad na základě historického trendu.</p>
        </div>

        <PriceCharts />

        <div className="my-6">
          <ShareButtons url="https://benzinmapa.cz/vyvoj-ceny/" title="Vývoj cen benzínu a nafty v ČR – reálná data a grafy" />
        </div>

        {/* ── CFD TRADING SEKCE ─────────────────────────────────── */}
        <section className="my-10">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={22} />
              <h2 className="text-white text-xl font-bold">Obchodujte pohyb cen ropy a paliv</h2>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Ceny benzínu a nafty kopírují cenu ropy Brent. Na pohybech ropy lze spekulovat
              prostřednictvím CFD kontraktů nebo ETF na regulovaných platformách.
            </p>
            <div className="flex items-start gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3">
              <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-xs">CFD jsou komplexní nástroje s vysokým rizikem ztráty. Většina retailových investorů prodělává. Toto není investiční poradenství.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {TRADING_AFFILIATES.map(aff => (
              <div key={aff.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
                <span className={`self-start text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${aff.color}`}>{aff.badge}</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{aff.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-4">{aff.desc}</p>
                <a href={aff.url} target="_blank" rel="noopener noreferrer sponsored"
                   className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity ${aff.color}`}>
                  {aff.cta} <ExternalLink size={13} />
                </a>
                <p className="text-[10px] text-gray-400 text-center mt-2 leading-tight">{aff.risk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ČLÁNEK: INFLACE + BTC ──────────────────────────────── */}
        <article className="my-12 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-orange-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="text-orange-500" size={28} />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Inflace žere vaše úspory. Bitcoin je odpověď.
            </h2>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Benzín, který v roce 2020 stál <strong>kolem 28 Kč za litr</strong>, dnes stojí přes <strong>40 Kč</strong>.
            Není to tím, že by ropa zdražela o 43 % – je to tím, že česká koruna ztrácí kupní sílu.
            Říkáme tomu inflace a každý rok potichu okrádá každého, kdo drží úspory v hotovosti.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-5">Co přesně je inflace?</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Inflace vzniká, když centrální banka tiskne více peněz, než odpovídá růstu ekonomiky.
            Více peněz honí stejné množství zboží – ceny rostou. Česká národní banka od roku 2020
            rozšířila peněžní zásobu výrazným způsobem. Výsledek vidíte na čerpačce každý týden.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-5">Proč Bitcoin chrání před inflací?</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Bitcoin má pevně zakódovaný <strong>limit 21 milionů mincí</strong>. Žádná centrální banka,
            žádná vláda, žádná korporace jej nemůže "dotisknout". Každé 4 roky se navíc snižuje
            rychlost vydávání nových BTC o polovinu (halving) – naposledy v dubnu 2024.
            To je přesný opak toho, co dělají koruny, dolary nebo eura.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Není to bez rizika – Bitcoin je volatilní aktivum a krátkodobě může výrazně klesat.
            Ale dlouhodobě (5+ let) historicky překonával inflaci o desítky procent ročně.
            Řidič, který v roce 2020 místo plné nádrže koupil za 5 000 Kč Bitcoin, by dnes
            měl přibližně <strong>50–80 000 Kč</strong>. Stejných 5 000 Kč v hotovosti koupí dnes
            méně benzínu než tehdy.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-5">Jak začít?</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mb-4 text-sm">
            <li>Začněte malou částkou – klidně 500 Kč měsíčně (DCA strategie)</li>
            <li>Použijte regulovanou českou směnárnu nebo světovou burzu (viz níže)</li>
            <li>Nechte Bitcoin v hardwarové peněžence – ne na burze</li>
            <li>Vzdělávejte se: komunita a vzdělávací obsah na <a href="https://bitcoinchurch.cz" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-semibold">BitcoinChurch.cz</a></li>
          </ul>

          <div className="bg-orange-100 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
            <strong>Disclaimer:</strong> Tento článek je pouze vzdělávací. Není to investiční poradenství.
            Kryptoměny jsou vysoce riziková aktiva. Investujte pouze to, co si můžete dovolit ztratit.
          </div>
        </article>

        {/* ── BITCOIN / CRYPTO AFFILIATES ───────────────────────── */}
        <section className="my-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Bitcoin className="text-orange-500" size={22} />
            Kde koupit Bitcoin a jak ho zabezpečit
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
            Vyberte regulovanou platformu, nakupte BTC a přesuňte ho do hardwarové peněženky.
            Více informací a vzdělávací obsah najdete na{' '}
            <a href="https://bitcoinchurch.cz" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-semibold">
              BitcoinChurch.cz →
            </a>
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CRYPTO_AFFILIATES.map(c => (
              <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer sponsored"
                 className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{c.badge}</span>
                  <ExternalLink size={13} className="text-gray-400 group-hover:text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-700 dark:group-hover:text-orange-400">{c.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.desc}</p>
              </a>
            ))}
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-gray-700 p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">BitcoinChurch.cz – komunita a vzdělávání</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nezávislý zpravodajský portál o Bitcoinu pro české čtenáře. Aktuality, analýzy,
                vzdělávací obsah a komunita lidí, kteří se chrání před inflací.
              </p>
            </div>
            <a href="https://bitcoinchurch.cz" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0">
              Navštívit BitcoinChurch.cz <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="my-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Časté dotazy</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white">{q}</summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 font-medium">
          ← Zpět na mapu
        </Link>
      </div>
    </>
  );
}
