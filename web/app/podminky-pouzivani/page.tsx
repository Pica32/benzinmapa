import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Podmínky používání – BenzinMapa.cz',
  description:
    'Podmínky používání webu BenzinMapa.cz – disclaimer k orientačnímu charakteru cen, autorská práva, zákazy, odpovědnost provozovatele.',
  alternates: { canonical: 'https://benzinmapa.cz/podminky-pouzivani/' },
  openGraph: {
    title: 'Podmínky používání – BenzinMapa.cz',
    description:
      'Pravidla a omezení používání informačního webu BenzinMapa.cz.',
    url: 'https://benzinmapa.cz/podminky-pouzivani/',
    siteName: 'BenzinMapa.cz',
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-gray dark:prose-invert">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2 not-prose">
        <Link href="/" className="hover:text-green-600">Domů</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white">Podmínky používání</span>
      </nav>

      <h1>Podmínky používání</h1>

      <p>
        Tyto podmínky upravují použití webu <strong>BenzinMapa.cz</strong>{' '}
        (dále jen „web"). Používáním webu vyjadřujete souhlas s těmito
        podmínkami. Provozovatelem webu je Jiří Karafiát, IČO 88600386,
        sídlem Pelhřimov (dále jen „provozovatel"). Kontakt:{' '}
        <a href="mailto:jiri.karafiat@seznam.cz">jiri.karafiat@seznam.cz</a>.
      </p>

      <h2>1. Charakter webu</h2>
      <p>
        BenzinMapa.cz je informační web. Zobrazuje ceny pohonných hmot
        a polohu čerpacích stanic v ČR ke studijním a orientačním účelům.
        Web nenabízí žádné placené služby, ani neuzavírá s návštěvníky žádné
        smluvní vztahy.
      </p>

      <h2>2. Orientační charakter cen – důležité upozornění</h2>
      <p>
        <strong>
          Ceny zobrazované na webu jsou orientační a nemusí odpovídat aktuální
          ceně na konkrétní čerpací stanici.
        </strong>{' '}
        Důvody:
      </p>
      <ul>
        <li>
          Ceny stahujeme z komunitního zdroje{' '}
          <a
            href="https://www.mbenzin.cz/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            mbenzin.cz
          </a>
          , kde je nahlašují řidiči. Mohou tedy být zastaralé nebo chybné.
        </li>
        <li>
          Data jsou aktualizována 3× denně. Mezi aktualizacemi může provozovatel
          stanice cenu změnit.
        </li>
        <li>
          U stanic bez komunitně nahlášené ceny zobrazujeme odhad na základě
          národního průměru a historických odchylek dané sítě.
        </li>
      </ul>
      <p>
        <strong>
          Před tankováním vždy ověřte aktuální cenu na ceduli přímo na
          čerpací stanici.
        </strong>{' '}
        Provozovatel neodpovídá za škodu vzniklou v důsledku rozhodnutí
        založeného na nepřesných cenových údajích.
      </p>

      <h2>3. Zdroje dat a třetí strany</h2>
      <p>Web pracuje s daty z následujících zdrojů:</p>
      <ul>
        <li>
          <strong>mbenzin.cz</strong> – komunitně nahlašované ceny pohonných
          hmot.
        </li>
        <li>
          <strong>OpenStreetMap</strong> (data jsou pod licencí{' '}
          <a
            href="https://opendatacommons.org/licenses/odbl/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            ODbL
          </a>
          ) – polohy čerpacích stanic, otevírací doba, vybavení.
        </li>
        <li>
          <strong>Google Maps, Waze, Apple Maps</strong> – externí navigační
          služby, na které z webu odkazujeme.
        </li>
      </ul>
      <p>
        Za obsah a dostupnost externích služeb provozovatel neodpovídá.
      </p>

      <h2>4. Duševní vlastnictví</h2>
      <p>
        Texty, design, kód, grafika a databáze odvozená agregace na webu jsou
        chráněny autorským zákonem (zák. č. 121/2000 Sb.). Bez souhlasu
        provozovatele není dovoleno:
      </p>
      <ul>
        <li>kopírovat větší celky textů (více než krátký citát se zdrojem),</li>
        <li>
          automatizovaně stahovat data webu (scraping) ve frekvenci, která
          by přetížila server, nebo komerčně využívat agregovaná data,
        </li>
        <li>
          vydávat obsah za vlastní (zákaz tzv.{' '}
          <em>passing off</em>),
        </li>
        <li>
          obcházet technická opatření na ochranu obsahu nebo se vydávat za
          provozovatele.
        </li>
      </ul>
      <p>
        Sdílení odkazů na konkrétní stránky webu (např. na sociálních sítích,
        diskuzních fórech, v článcích) je vítáno a povoleno.
      </p>

      <h2>5. Pravidla nahlašování cen</h2>
      <p>
        Web umožňuje komukoliv nahlásit aktuální cenu na konkrétní stanici.
        Pravidla pro nahlašování:
      </p>
      <ul>
        <li>
          Nahlašujte pouze ceny, které jste reálně viděli na stojanu nebo
          ceduli stanice.
        </li>
        <li>
          Zákaz vědomě nepravdivých údajů (např. uměle nízká cena pro
          zmatení konkurence).
        </li>
        <li>
          Provozovatel si vyhrazuje právo odstranit zjevně nesmyslné hodnoty
          a opakované zneužití omezit technicky (rate limit, blokace IP).
        </li>
      </ul>

      <h2>6. Omezení odpovědnosti</h2>
      <p>
        Web je poskytován „jak je" (<em>as-is</em>). Provozovatel:
      </p>
      <ul>
        <li>
          neručí za absolutní přesnost, úplnost a aktuálnost dat,
        </li>
        <li>
          neručí za nepřetržitou dostupnost webu (možné výpadky kvůli údržbě,
          chybě hostingu, výpadku zdrojových dat),
        </li>
        <li>
          neodpovídá za škodu vzniklou na základě informací zveřejněných na
          webu (např. pokud zákazník pojede na stanici s nesprávně uvedenou
          cenou).
        </li>
      </ul>
      <p>
        V maximálním rozsahu povoleném českým právem je odpovědnost
        provozovatele omezena na náhradu skutečné majetkové škody, max. do
        výše 1 000 Kč.
      </p>

      <h2>7. Reklamní obsah</h2>
      <p>
        V budoucnu může web zobrazovat reklamy (typicky Google AdSense)
        a partnerské odkazy. Reklamní obsah je vždy viditelně oddělen
        od redakčního obsahu. Provozovatel neodpovídá za obsah ani dostupnost
        reklamních partnerů.
      </p>

      <h2>8. Změny podmínek</h2>
      <p>
        Tyto podmínky mohou být v budoucnu aktualizovány. O podstatných
        změnách budeme informovat viditelně na webu nebo v patičce. Pokračováním
        v používání webu po publikaci nové verze podmínek vyjadřujete s novou
        verzí souhlas.
      </p>

      <h2>9. Rozhodné právo</h2>
      <p>
        Vztah mezi provozovatelem a uživatelem webu se řídí právem České
        republiky. Případné spory budou řešeny u věcně a místně příslušného
        soudu v ČR.
      </p>

      <h2>10. Kontakt</h2>
      <p>
        Pro dotazy k těmto podmínkám pište na{' '}
        <a href="mailto:jiri.karafiat@seznam.cz">jiri.karafiat@seznam.cz</a>.
        Více kontaktních údajů na{' '}
        <Link href="/kontakt/">stránce Kontakt</Link>.
      </p>

      <p className="text-sm text-gray-500 not-prose mt-8">
        Účinnost od: {new Date().toLocaleDateString('cs-CZ')}
      </p>
    </article>
  );
}
