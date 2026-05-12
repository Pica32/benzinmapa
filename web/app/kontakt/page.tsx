import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontakt – BenzinMapa.cz',
  description:
    'Kontaktní údaje provozovatele webu BenzinMapa.cz. Jiří Karafiát, Pelhřimov, IČO 88600386. Pro nahlášení chyb v cenách, návrhy a spolupráci.',
  alternates: { canonical: 'https://benzinmapa.cz/kontakt/' },
  openGraph: {
    title: 'Kontakt – BenzinMapa.cz',
    description: 'Kontaktní údaje provozovatele webu BenzinMapa.cz.',
    url: 'https://benzinmapa.cz/kontakt/',
    siteName: 'BenzinMapa.cz',
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-green-600">Domů</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white">Kontakt</span>
      </nav>

      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
        Kontakt
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Nahlášení chyby v ceně, návrh na vylepšení, dotaz ke zpracování dat
        nebo nabídka spolupráce – ozvěte se. Reagujeme obvykle do 2 pracovních
        dnů.
      </p>

      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
          Provozovatel webu
        </h2>

        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">
                Jméno
              </dt>
              <dd className="text-base font-semibold text-gray-900 dark:text-white">
                Jiří Karafiát
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">IČO</dt>
              <dd className="text-base font-mono font-semibold text-gray-900 dark:text-white">
                88600386
              </dd>
              <dd className="text-xs text-gray-500 mt-0.5">
                Fyzická osoba podnikající dle živnostenského zákona, neplátce
                DPH. Evidence v Registru ekonomických subjektů (RES) ČSÚ.
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">
                Sídlo
              </dt>
              <dd className="text-base text-gray-900 dark:text-white">
                Pelhřimov, Česká republika
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">
                E-mail
              </dt>
              <dd className="text-base">
                <a
                  href="mailto:jiri.karafiat@seznam.cz"
                  className="text-green-700 dark:text-green-400 hover:underline font-semibold"
                >
                  jiri.karafiat@seznam.cz
                </a>
              </dd>
              <dd className="text-xs text-gray-500 mt-0.5">
                Primární a jediný oficiální komunikační kanál. Na e-maily
                odpovídáme obvykle do 2 pracovních dnů.
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="mt-8 bg-green-50 dark:bg-gray-800 rounded-2xl border border-green-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Než nám napíšete
        </h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
          <li>
            <strong>Chybná cena na stanici?</strong> Můžete cenu opravit přímo
            na stránce dané čerpačky (tlačítko „Nahlásit aktuální cenu") –
            zobrazí se ostatním uživatelům rychleji než e-mailem.
          </li>
          <li>
            <strong>Stanice na mapě chybí?</strong> Pošlete prosím název,
            adresu a GPS souřadnice. Stanice doplňujeme z OpenStreetMap –
            pokud tam ještě není, doporučujeme ji přidat tam (zobrazí se i u
            nás při příští aktualizaci).
          </li>
          <li>
            <strong>Bezpečnostní problém / phishing?</strong> Označte v
            předmětu e-mailu prefix <code className="bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">[BEZPEČNOST]</code>{' '}
            – upřednostníme.
          </li>
          <li>
            <strong>Žádost o spolupráci nebo reklamní partnerství?</strong>{' '}
            Zájemci o dlouhodobou spolupráci ať uvedou základní představu
            a kontakt na zodpovědnou osobu.
          </li>
        </ul>
      </section>

      <section className="mt-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>
          Pro otázky týkající se zpracování osobních údajů odkazujeme na
          stránku{' '}
          <Link
            href="/zasady-ochrany-osobnich-udaju/"
            className="text-green-700 dark:text-green-400 hover:underline"
          >
            Zásady ochrany osobních údajů
          </Link>
          . Informace o cookies najdete v{' '}
          <Link
            href="/zasady-cookies/"
            className="text-green-700 dark:text-green-400 hover:underline"
          >
            Zásadách cookies
          </Link>
          . Pravidla a omezení používání webu jsou shrnuta v{' '}
          <Link
            href="/podminky-pouzivani/"
            className="text-green-700 dark:text-green-400 hover:underline"
          >
            Podmínkách používání
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
