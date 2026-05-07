import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zásady používání cookies',
  description:
    'Informace o cookies, které BenzinMapa.cz používá: technicky nutné cookies a analytické cookies (Google Analytics). Možnosti správy souhlasu.',
  alternates: { canonical: 'https://benzinmapa.cz/zasady-cookies/' },
  openGraph: {
    title: 'Zásady používání cookies – BenzinMapa.cz',
    description:
      'Informace o cookies, které používáme, a jak spravovat svůj souhlas.',
    url: 'https://benzinmapa.cz/zasady-cookies/',
    siteName: 'BenzinMapa.cz',
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-gray dark:prose-invert">
      <h1>Zásady používání cookies</h1>
      <p>
        Tato stránka popisuje, jaké soubory cookies a podobné technologie web
        <strong> BenzinMapa.cz</strong> používá, k čemu slouží a jak nad nimi
        máte kontrolu. Zpracování probíhá v souladu s nařízením GDPR
        (2016/679) a zákonem č.&nbsp;127/2005&nbsp;Sb. o&nbsp;elektronických
        komunikacích.
      </p>

      <h2>Co jsou cookies</h2>
      <p>
        Cookies jsou malé textové soubory ukládané ve vašem prohlížeči. Slouží
        k&nbsp;tomu, aby si web pamatoval vaše nastavení (např. souhlas
        s&nbsp;cookies) a&nbsp;abychom mohli anonymně měřit, jak je web
        využíván.
      </p>

      <h2>Jaké cookies používáme</h2>

      <h3>1. Technicky nutné cookies</h3>
      <p>
        Tyto cookies jsou nezbytné pro fungování webu — ukládají např. váš
        souhlas s&nbsp;cookies (klíč <code>bm_cookie_consent_v1</code>
        v&nbsp;localStorage). Bez nich nelze web správně zobrazit, proto se
        ukládají vždy.
      </p>

      <h3>2. Analytické cookies (Google Analytics 4)</h3>
      <p>
        S&nbsp;vaším souhlasem ukládáme cookies služby
        <strong> Google Analytics 4</strong> (měřicí ID <code>G-NE6QMNHHJ9</code>).
        Slouží k&nbsp;anonymnímu měření návštěvnosti — kolik lidí web navštěvuje,
        které stránky čtou, odkud přicházejí. IP adresa je anonymizována. Data
        zpracovává společnost <em>Google Ireland Limited</em>.
      </p>
      <p>
        Doba uchovávání: max. 14&nbsp;měsíců. Před udělením souhlasu jsou tyto
        cookies blokovány v&nbsp;režimu <em>Google Consent Mode v2</em>{' '}
        (<code>analytics_storage = denied</code>).
      </p>

      <h3>3. Marketingové cookies</h3>
      <p>
        Marketingové cookies (reklamní cílení) <strong>nepoužíváme</strong>.
        Pokud byste je v&nbsp;budoucnu vyplnili, vyžadovali bychom samostatný
        souhlas.
      </p>

      <h2>Jak spravovat souhlas</h2>
      <ul>
        <li>
          Kliknutím na <strong>Přijmout vše</strong> v&nbsp;cookie liště povolíte
          analytické cookies.
        </li>
        <li>
          Kliknutím na <strong>Jen nutné</strong> povolíte pouze technicky nutné
          cookies.
        </li>
        <li>
          Souhlas můžete kdykoliv odvolat smazáním cookies a&nbsp;localStorage
          ve vašem prohlížeči.
        </li>
      </ul>

      <h2>Vaše práva</h2>
      <p>
        Máte právo na přístup k&nbsp;osobním údajům, jejich opravu, výmaz,
        omezení zpracování a&nbsp;přenositelnost. Stížnost můžete podat
        u&nbsp;Úřadu pro ochranu osobních údajů (<a
          href="https://www.uoou.cz"
          target="_blank"
          rel="noopener noreferrer"
        >
          uoou.cz
        </a>
        ).
      </p>

      <h2>Kontakt</h2>
      <p>
        Provozovatel: BenzinMapa.cz, kontakt:{' '}
        <a href="mailto:info@benzinmapa.cz">info@benzinmapa.cz</a>.
      </p>

      <p className="text-sm text-gray-500">
        Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
      </p>
    </article>
  );
}
