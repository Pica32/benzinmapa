import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'O projektu BenzinMapa.cz – jak sbíráme ceny pohonných hmot',
  description:
    'Kdo stojí za BenzinMapa.cz, proč jsme web spustili a jak fungujeme. Zdroje dat (mbenzin.cz, OpenStreetMap), frekvence aktualizací a co k datům přidáváme navíc.',
  alternates: { canonical: 'https://benzinmapa.cz/o-nas/' },
  openGraph: {
    title: 'O projektu BenzinMapa.cz',
    description:
      'Nezávislý český projekt mapující ceny benzínu, nafty a LPG na 2 400+ čerpacích stanicích.',
    url: 'https://benzinmapa.cz/o-nas/',
    siteName: 'BenzinMapa.cz',
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-gray dark:prose-invert">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2 not-prose">
        <Link href="/" className="hover:text-green-600">Domů</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white">O projektu</span>
      </nav>

      <h1>O projektu BenzinMapa.cz</h1>

      <p>
        <strong>BenzinMapa.cz</strong> je nezávislý český projekt, který sleduje
        ceny pohonných hmot na více než 2 400 čerpacích stanicích v České
        republice. Cílem je pomoci řidičům najít v okolí <strong>nejlevnější
        benzín, naftu a LPG</strong> a ušetřit pár korun za každý litr.
      </p>

      <h2>Kdo projekt provozuje</h2>
      <p>
        Provozovatelem webu je <strong>Jiří Karafiát</strong> z Pelhřimova
        (<abbr title="Identifikační číslo">IČO</abbr>{' '}
        <a
          href="https://rejstrik-firem.kurzy.cz/88600386/"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          88600386
        </a>
        ). Projekt vznikl jako koníček – frustrace z toho, že na sousedních
        čerpačkách v okolí Vysočiny i Prahy bývají rozdíly v ceně Natural 95
        klidně 3–5 Kč/l, ale nikde nebyla snadná mapa, kde to porovnat. Tak
        jsem si ji udělal sám.
      </p>

      <h2>Jak fungujeme – odkud bereme data</h2>
      <p>
        Ceny pohonných hmot stahujeme automaticky z komunitního zdroje{' '}
        <a href="https://www.mbenzin.cz/" target="_blank" rel="noopener noreferrer nofollow">
          mbenzin.cz
        </a>
        , kde ceny nahlašují sami řidiči. Databázi čerpacích stanic (GPS
        polohu, otevírací dobu, služby) získáváme z otevřeného projektu{' '}
        <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer nofollow">
          OpenStreetMap
        </a>{' '}
        – přesněji z volně dostupných dat o čerpacích stanicích v ČR.
      </p>
      <p>
        Data <strong>aktualizujeme automaticky 3× denně</strong> – přibližně
        v 5:00, 10:00 a 15:00 středoevropského času. Každá zobrazená cena má
        u sebe časovou značku poslední aktualizace, abyste věděli, jak je
        čerstvá.
      </p>

      <h2>Co přidáváme k datům navíc</h2>
      <p>
        Surová data o cenách na čerpačkách jsou veřejná. To, co děláme my:
      </p>
      <ul>
        <li>
          <strong>Spojujeme dva nesouvisející datové zdroje.</strong> Ceny
          z mbenzin.cz párujeme s GPS polohou stanic z OpenStreetMap přes
          algoritmus, který hledá nejbližší stanici v okruhu 400 m nebo se
          shoduje na názvu + městě.
        </li>
        <li>
          <strong>Dopočítáváme odhad pro stanice bez nahlášené ceny.</strong>{' '}
          Pokud stanice nemá komunitně hlášenou cenu, použijeme národní průměr
          a historickou cenovou odchylku dané značky (např. Shell je
          dlouhodobě o 2 Kč nad průměrem, Tank ONO o 1,50 Kč pod průměrem).
        </li>
        <li>
          <strong>Vizualizujeme data na mapě s clusterováním.</strong> Mapa
          zvládne i 2 400 markerů najednou bez zamrznutí a barevně rozlišuje
          stanice podle ceny (zelená = nejlevnějších 20 %, červená = nejdražších
          20 %).
        </li>
        <li>
          <strong>Filtrujeme podle paliva.</strong> Můžete si zobrazit jen
          stanice s LPG, jen ty s nejnižší cenou nafty, nebo jen otevřené 24/7.
        </li>
        <li>
          <strong>Sledujeme vývoj cen.</strong> Na stránce{' '}
          <Link href="/vyvoj-ceny/">vývoj cen</Link> najdete graf cen Natural
          95 a nafty za posledních 90 dní v ČR.
        </li>
        <li>
          <strong>Publikujeme vlastní analýzy.</strong> V sekci{' '}
          <Link href="/aktualne/">Aktuálně</Link> řešíme témata jako emisní
          povolenky ETS2, srovnání věrnostních karet, ekonomiku LPG přestavby
          nebo tankování v Polsku.
        </li>
      </ul>

      <h2>Jaká data nemáme</h2>
      <p>
        Nejsme oficiální zdroj cen. Nemáme přímý feed od provozovatelů sítí
        (Benzina ORLEN, MOL, Shell, OMV). Ceny zobrazujeme jako{' '}
        <strong>orientační</strong> – aktuální cena na stojanu se může lišit
        od ceny v naší databázi. Před tankováním vždy doporučujeme ověřit
        cenu na ceduli na vlastní oči.
      </p>

      <h2>Jak nás financujeme</h2>
      <p>
        Web je zatím provozován bez reklam a bez placeného obsahu. V budoucnu
        plánujeme zobrazovat nenásilnou kontextovou reklamu (Google AdSense)
        a partnerské odkazy na věrnostní programy. Žádná data o uživatelích
        neprodáváme. Sledujeme pouze anonymizovanou návštěvnost přes Google
        Analytics 4 – a to jen s vaším souhlasem (viz{' '}
        <Link href="/zasady-cookies/">zásady cookies</Link>).
      </p>

      <h2>Spolupráce a kontakt</h2>
      <p>
        Nahlásili jste chybu v cenách? Chybí vaše stanice? Máte nápad na
        vylepšení mapy nebo téma k analýze? Napište nám na{' '}
        <a href="mailto:jiri.karafiat@seznam.cz">jiri.karafiat@seznam.cz</a>{' '}
        – děkujeme. Kompletní kontaktní údaje najdete na stránce{' '}
        <Link href="/kontakt/">Kontakt</Link>.
      </p>

      <p className="text-sm text-gray-500 not-prose mt-8">
        Poslední aktualizace stránky: {new Date().toLocaleDateString('cs-CZ')}
      </p>
    </article>
  );
}
