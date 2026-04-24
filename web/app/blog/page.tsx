import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog – tipy na úsporu paliva a analýzy cen',
  description: 'Články o cenách pohonných hmot v ČR, tipy jak ušetřit za benzín a naftu, analýzy trhu a novinky ze světa paliv.',
  alternates: { canonical: 'https://benzinmapa.cz/blog' },
};

const POSTS = [
  {
    slug: 'proc-ceny-benzinu-rostou-2026',
    title: 'Proč ceny benzínu rostou? Analýza trhu – duben 2026',
    excerpt: 'Ceny pohonných hmot v ČR v posledních měsících opět stoupají. Vysvětlujeme hlavní faktory – cena ropy Brent, kurz dolaru, spotřební daň a marže čerpacích stanic.',
    date: '2026-04-20',
    readTime: '5 min',
    tag: 'Analýza',
  },
  {
    slug: 'co-ovlivnuje-ceny-pohonnych-hmot',
    title: 'Co ovlivňuje ceny pohonných hmot v ČR? Kompletní průvodce',
    excerpt: 'Od ceny ropy přes rafinérie, daně, distribuci až po marže čerpacích stanic – rozebíráme každý krok, který rozhoduje o tom, co zaplatíte na pumpě.',
    date: '2026-04-22',
    readTime: '8 min',
    tag: 'Průvodce',
  },
  {
    slug: 'rozdil-natural-95-vs-98',
    title: 'Natural 95 vs. Natural 98: Jaký je skutečný rozdíl?',
    excerpt: 'Stojí za příplatek 3–4 Kč/l Natural 98? Vysvětlujeme oktanové číslo, vliv na motor, výkon a kdy se tankování prémia skutečně vyplatí.',
    date: '2026-04-18',
    readTime: '5 min',
    tag: 'Průvodce',
  },
  {
    slug: 'jak-usetrit-za-palivo-10-tipu',
    title: 'Jak ušetřit za palivo: 10 tipů pro řidiče',
    excerpt: 'Přinášíme praktické tipy, jak snížit náklady na pohonné hmoty. Od výběru správné čerpací stanice přes jízdní styl až po věrnostní programy.',
    date: '2026-04-15',
    readTime: '7 min',
    tag: 'Tipy',
  },
  {
    slug: 'srovnani-cen-lpg-vs-nafta-2026',
    title: 'Srovnání cen LPG vs. nafta v roce 2026',
    excerpt: 'LPG je historicky levnější než nafta, ale vyplatí se přestavba auta? Počítáme reálnou ekonomiku při průměrném ročním nájezdu 20 000 km.',
    date: '2026-04-10',
    readTime: '6 min',
    tag: 'Srovnání',
  },
  {
    slug: 'dalnicni-vs-mestska-cerpacka',
    title: 'Dálniční vs. městská čerpačka: Kde je benzín opravdu levnější?',
    excerpt: 'Dálniční pumpy jsou proslulé vyššími cenami. Kolik ale skutečně přeplatíte? A kdy se vyplatí odbočit do města? Reálná data z celé ČR.',
    date: '2026-04-08',
    readTime: '4 min',
    tag: 'Analýza',
  },
  {
    slug: 'nejlevnejsi-cerpaci-stanice-cr-2026',
    title: 'Nejlevnější čerpací stanice v ČR 2026 – velký přehled',
    excerpt: 'Které značky čerpacích stanic mají dlouhodobě nejnižší ceny? Srovnáváme Eurobit, Robin Oil, Terno a další nezávislé provozovatele s velkými sítěmi.',
    date: '2026-04-05',
    readTime: '8 min',
    tag: 'Přehled',
  },
  {
    slug: 'benzin-vs-diesel-co-je-ekonomictejsi',
    title: 'Benzín vs. nafta: Co je v roce 2026 ekonomičtější?',
    excerpt: 'Při výběru nového auta se mnozí ptají – koupit benzín nebo diesel? Odpovídáme s ohledem na aktuální ceny paliv, spotřebu a dojezd.',
    date: '2026-03-28',
    readTime: '5 min',
    tag: 'Porovnání',
  },
];

const TAG_COLORS: Record<string, string> = {
  'Analýza': 'bg-blue-100 text-blue-700',
  'Tipy': 'bg-green-100 text-green-700',
  'Srovnání': 'bg-purple-100 text-purple-700',
  'Přehled': 'bg-orange-100 text-orange-700',
  'Porovnání': 'bg-red-100 text-red-700',
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-green-600">Domů</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white">Blog</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-green-600" size={28} />
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Blog</h1>
          <p className="text-gray-500 text-sm">Analýzy cen, tipy na úsporu a novinky z trhu pohonných hmot</p>
        </div>
      </div>

      <div className="space-y-6">
        {POSTS.map(post => (
          <article key={post.slug} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-green-400 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[post.tag] ?? 'bg-gray-100 text-gray-600'}`}>
                {post.tag}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                {new Date(post.date).toLocaleDateString('cs-CZ')} · {post.readTime} čtení
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              Číst celý článek →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
