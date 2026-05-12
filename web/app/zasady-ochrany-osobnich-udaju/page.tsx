import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů – BenzinMapa.cz',
  description:
    'Jaké osobní údaje BenzinMapa.cz zpracovává, právní tituly, předávané údaje (Google Analytics, hosting) a vaše práva podle GDPR.',
  alternates: {
    canonical: 'https://benzinmapa.cz/zasady-ochrany-osobnich-udaju/',
  },
  openGraph: {
    title: 'Zásady ochrany osobních údajů – BenzinMapa.cz',
    description:
      'Informace o zpracování osobních údajů podle nařízení GDPR.',
    url: 'https://benzinmapa.cz/zasady-ochrany-osobnich-udaju/',
    siteName: 'BenzinMapa.cz',
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-gray dark:prose-invert">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2 not-prose">
        <Link href="/" className="hover:text-green-600">Domů</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white">
          Zásady ochrany osobních údajů
        </span>
      </nav>

      <h1>Zásady ochrany osobních údajů</h1>

      <p>
        Tyto zásady popisují, jaké osobní údaje shromažďuje a zpracovává
        web <strong>BenzinMapa.cz</strong> (dále jen „web"), na jakém právním
        základě, komu je předáváme a jaká máte ve vztahu ke zpracování práva.
        Zpracování probíhá v souladu s nařízením Evropského parlamentu
        a Rady (EU) 2016/679 (<strong>GDPR</strong>) a zákonem č.&nbsp;110/2019&nbsp;Sb.,
        o&nbsp;zpracování osobních údajů.
      </p>

      <h2>1. Správce osobních údajů</h2>
      <p>
        Správcem osobních údajů je provozovatel webu:
      </p>
      <ul>
        <li><strong>Jiří Karafiát</strong></li>
        <li>IČO: <strong>88600386</strong></li>
        <li>Sídlo: Pelhřimov, Česká republika</li>
        <li>
          E-mail:{' '}
          <a href="mailto:jiri.karafiat@seznam.cz">jiri.karafiat@seznam.cz</a>
        </li>
      </ul>
      <p>
        Pověřence pro ochranu osobních údajů (DPO) správce nejmenoval,
        nemá k tomu zákonnou povinnost.
      </p>

      <h2>2. Jaké údaje zpracováváme</h2>

      <h3>2.1 Údaje shromažďované automaticky</h3>
      <p>
        Při návštěvě webu jsou automaticky zpracovávány následující údaje:
      </p>
      <ul>
        <li>
          <strong>IP adresa</strong> (v anonymizované podobě – poslední oktet
          je nulován ještě před uložením v Google Analytics)
        </li>
        <li>
          <strong>Typ a verze prohlížeče, operační systém, rozlišení obrazovky</strong>
        </li>
        <li>
          <strong>Přibližná geolokace</strong> (město / region) odvozená z IP
        </li>
        <li>
          <strong>Odkaz, ze kterého jste přišli</strong> (referer)
        </li>
        <li>
          <strong>Stránky, které jste navštívili</strong>, čas a délka návštěvy
        </li>
      </ul>
      <p>
        Tyto údaje jsou zpracovávány v anonymizované podobě a slouží výhradně
        ke statistickým účelům (měření návštěvnosti, optimalizace obsahu).
        Nelze z nich identifikovat konkrétní osobu.
      </p>

      <h3>2.2 Údaje, které sami zadáte</h3>
      <p>
        Pokud na konkrétní čerpací stanici{' '}
        <strong>nahlásíte aktuální cenu paliva</strong>, ukládáme:
      </p>
      <ul>
        <li>nahlášené hodnoty cen (Natural 95, nafta, LPG)</li>
        <li>časové razítko</li>
        <li>technický identifikátor relace prohlížeče (anti-spam)</li>
      </ul>
      <p>
        Tyto údaje neumožňují identifikovat konkrétní osobu. E-mail ani jméno
        při nahlašování ceny nepožadujeme.
      </p>
      <p>
        Pokud nás kontaktujete <strong>e-mailem</strong>, zpracováváme údaje,
        které jste sami uvedli (typicky e-mailovou adresu, jméno, obsah
        zprávy). Tyto údaje ukládáme jen po dobu nezbytně nutnou k zodpovězení
        dotazu, max. 12 měsíců.
      </p>

      <h2>3. Účely a právní základ zpracování</h2>

      <table>
        <thead>
          <tr>
            <th>Účel zpracování</th>
            <th>Právní základ (GDPR)</th>
            <th>Doba uchovávání</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Provoz webu, zobrazení obsahu</td>
            <td>Oprávněný zájem (čl. 6 odst. 1 písm. f)</td>
            <td>Po dobu návštěvy</td>
          </tr>
          <tr>
            <td>Měření návštěvnosti (Google Analytics)</td>
            <td>Souhlas (čl. 6 odst. 1 písm. a)</td>
            <td>Max. 14 měsíců</td>
          </tr>
          <tr>
            <td>Nahlašování cen komunitou</td>
            <td>Oprávněný zájem (čl. 6 odst. 1 písm. f)</td>
            <td>Trvale (jen agregovaná data)</td>
          </tr>
          <tr>
            <td>Komunikace přes e-mail</td>
            <td>Oprávněný zájem (čl. 6 odst. 1 písm. f)</td>
            <td>Max. 12 měsíců po vyřízení</td>
          </tr>
          <tr>
            <td>Zobrazování reklam (Google AdSense – budoucí)</td>
            <td>Souhlas (čl. 6 odst. 1 písm. a)</td>
            <td>Dle nastavení Google</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Komu údaje předáváme</h2>
      <p>
        Pro provoz webu spolupracujeme s následujícími poskytovateli, kteří
        zpracovávají osobní údaje jako naši zpracovatelé:
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> – hosting webu (USA, certifikace EU–US
          Data Privacy Framework). <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer nofollow">Privacy policy</a>
        </li>
        <li>
          <strong>Google Ireland Limited</strong> – Google Analytics 4, Google
          Tag Manager. Údaje jsou anonymizovány. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer nofollow">Privacy policy</a>
        </li>
        <li>
          <strong>Google LLC</strong> – v budoucnu Google AdSense pro
          zobrazování reklam (jen s vaším souhlasem).
        </li>
        <li>
          <strong>WEDOS Internet, a.s.</strong> (případně jiný registrátor) –
          správa domény a DNS.
        </li>
      </ul>
      <p>
        Údaje nepředáváme do třetích zemí mimo EU/EHP bez odpovídajících
        záruk (standardní smluvní doložky, certifikace DPF).
      </p>

      <h2>5. Cookies</h2>
      <p>
        Detailní informace o souborech cookies a nástrojích, které je
        používají, najdete na samostatné stránce{' '}
        <Link href="/zasady-cookies/">Zásady cookies</Link>. Před udělením
        souhlasu jsou všechny analytické a marketingové cookies blokovány
        v režimu <strong>Google Consent Mode v2</strong>.
      </p>

      <h2>6. Vaše práva</h2>
      <p>Jako subjekt údajů máte podle GDPR následující práva:</p>
      <ul>
        <li>
          <strong>Právo na přístup</strong> – víte, jaké údaje o vás
          zpracováváme.
        </li>
        <li>
          <strong>Právo na opravu</strong> – pokud jsou údaje nepřesné.
        </li>
        <li>
          <strong>Právo na výmaz</strong> („být zapomenut") – jakmile pominou
          důvody pro zpracování.
        </li>
        <li>
          <strong>Právo na omezení zpracování</strong>.
        </li>
        <li>
          <strong>Právo na přenositelnost údajů</strong>.
        </li>
        <li>
          <strong>Právo vznést námitku</strong> proti zpracování na základě
          oprávněného zájmu.
        </li>
        <li>
          <strong>Právo odvolat souhlas</strong> – kdykoliv smazáním cookies
          v prohlížeči nebo úpravou nastavení.
        </li>
        <li>
          <strong>Právo podat stížnost</strong> u dozorového úřadu – v ČR
          Úřad pro ochranu osobních údajů,{' '}
          <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer nofollow">
            uoou.cz
          </a>
          .
        </li>
      </ul>
      <p>
        Pro uplatnění práv nás kontaktujte na{' '}
        <a href="mailto:jiri.karafiat@seznam.cz">jiri.karafiat@seznam.cz</a>.
        Žádost vyřídíme nejpozději do 30 dnů.
      </p>

      <h2>7. Bezpečnost a zabezpečení dat</h2>
      <p>
        Web je provozován výhradně přes šifrované spojení (HTTPS, TLS 1.3).
        Údaje jsou hostovány v zabezpečených datových centrech v EU. Přístup
        k administraci je chráněn dvoufaktorovým ověřením.
      </p>

      <h2>8. Změny těchto zásad</h2>
      <p>
        Tyto zásady můžeme v budoucnu aktualizovat (např. při přidání nového
        zpracovatele nebo služby). O podstatných změnách budeme informovat
        viditelně na webu. Aktuální verzi vždy najdete na této stránce.
      </p>

      <p className="text-sm text-gray-500 not-prose mt-8">
        Účinnost: {new Date().toLocaleDateString('cs-CZ')}
      </p>
    </article>
  );
}
