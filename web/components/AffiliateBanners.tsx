import { ShieldCheck, Car, Gauge, FileSearch, Wrench, Wallet, BadgeCheck, ArrowRight } from 'lucide-react';

/**
 * Afiliate bannery (ehub.cz) — Cebia a ČSOB Pojišťovna.
 *
 * Pravidla:
 * - Odkazy jsou označené rel="sponsored noopener noreferrer" + target="_blank"
 *   → Google je nepovažuje za redakční odkazy, neovlivní to SEO ("nic neprušit").
 * - Bloček je viditelně označen jako "Reklama" (zákon č. 40/1995 Sb. o regulaci reklamy).
 * - Žádná interaktivita → server component, neblokuje hydrataci ani Core Web Vitals.
 */

type Offer = {
  href: string;
  label: string;          // krátký interní popis (title atribut)
  badge: string;          // řádek nad nadpisem
  title: string;
  subtitle: string;
  bullets: { icon: typeof ShieldCheck; text: string }[];
  cta: string;
  icon: typeof ShieldCheck;
  // Tailwind třídy pro barevné ladění karty
  gradient: string;
  ctaClass: string;
  ringClass: string;
};

const OFFERS: Offer[] = [
  {
    href: 'https://ehub.cz/system/scripts/click.php?a_aid=b7023ca5&a_bid=67e04d9d',
    label: 'Cebia – prověření historie vozidla podle VIN',
    badge: 'Kupujete ojeté auto?',
    title: 'Prověřte historii vozu, než zaplatíte',
    subtitle: 'Zadejte VIN a Cebia odhalí, co prodejce zamlčel. Ušetříte desítky tisíc za skrytou vadu.',
    bullets: [
      { icon: Gauge, text: 'Stočený tachometr' },
      { icon: Wrench, text: 'Nehody a poškození' },
      { icon: FileSearch, text: 'Odcizení, leasing, zástava' },
    ],
    cta: 'Prověřit vozidlo',
    icon: ShieldCheck,
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    ctaClass: 'bg-red-600 hover:bg-red-500 text-white',
    ringClass: 'ring-red-500/40',
  },
  {
    href: 'https://ehub.cz/system/scripts/click.php?a_aid=b7023ca5&a_bid=f5e0f8fb',
    label: 'ČSOB Pojišťovna – povinné ručení a havarijní pojištění online',
    badge: 'Povinné ručení online',
    title: 'Spočítejte si pojištění auta za 2 minuty',
    subtitle: 'Povinné ručení i havarijní pojištění od ČSOB Pojišťovny. Sjednání 100 % online, bez papírování.',
    bullets: [
      { icon: Wallet, text: 'Sleva za bezeškodní průběh' },
      { icon: BadgeCheck, text: 'Asistenční služba v ceně' },
      { icon: ShieldCheck, text: 'Sjednání kompletně online' },
    ],
    cta: 'Spočítat cenu',
    icon: Car,
    gradient: 'from-blue-900 via-blue-800 to-indigo-900',
    ctaClass: 'bg-white hover:bg-blue-50 text-blue-900',
    ringClass: 'ring-blue-400/40',
  },
];

export default function AffiliateBanners({
  cityName,
  className = '',
}: {
  cityName?: string;
  className?: string;
}) {
  return (
    <section
      aria-label="Doporučené nabídky pro řidiče"
      className={className}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {cityName ? `Než vyrazíte z ${cityName} – tipy pro řidiče` : 'Tipy pro řidiče'}
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
          Reklama
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OFFERS.map((o) => {
          const Icon = o.icon;
          return (
            <a
              key={o.href}
              href={o.href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title={o.label}
              className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${o.gradient} p-5 sm:p-6 text-white shadow-lg ring-1 ${o.ringClass} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
            >
              {/* Dekorativní kruh v pozadí */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-125"
              />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon size={26} strokeWidth={2} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    {o.badge}
                  </p>
                  <h3 className="mt-0.5 text-lg font-black leading-tight sm:text-xl">
                    {o.title}
                  </h3>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-white/85">
                {o.subtitle}
              </p>

              <ul className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {o.bullets.map((b) => {
                  const BIcon = b.icon;
                  return (
                    <li key={b.text} className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                      <BIcon size={14} className="flex-shrink-0 text-white/70" />
                      {b.text}
                    </li>
                  );
                })}
              </ul>

              <span
                className={`relative mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-colors ${o.ctaClass}`}
              >
                {o.cta}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
