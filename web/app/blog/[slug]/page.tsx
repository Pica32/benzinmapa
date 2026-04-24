import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChevronLeft } from 'lucide-react';
import { FaqJsonLd } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

const POSTS: Record<string, {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  content: string;
  faqs: { q: string; a: string }[];
}> = {
  'proc-ceny-benzinu-rostou-2026': {
    title: 'Proč ceny benzínu rostou? Analýza trhu – duben 2026',
    excerpt: 'Ceny pohonných hmot v ČR v posledních měsících opět stoupají.',
    date: '2026-04-20',
    readTime: '5 min',
    tag: 'Analýza',
    content: `
## Hlavní faktory zdražování benzínu

Ceny pohonných hmot na českých čerpacích stanicích jsou ovlivněny několika klíčovými faktory:

### 1. Cena ropy Brent na světových trzích
Ropa Brent, která je referenční cenou pro evropský trh, má přímý vliv na velkoobchodní ceny pohonných hmot. Každý nárůst ceny o 1 dolar za barel se zpravidla projeví zdražením na pumpě o 0,3–0,5 Kč za litr.

### 2. Kurz CZK/USD
Pohonné hmoty se obchodují v amerických dolarech. Oslabení koruny vůči dolaru automaticky zdražuje dovoz ropy a rafinerské produkty.

### 3. Spotřební daň
ČR patří mezi země s vyšší spotřební daní na pohonné hmoty v EU. Spotřební daň tvoří zhruba 40 % konečné ceny paliva na čerpací stanici.

### 4. Marže čerpacích stanic
Velké sítě (Benzina ORLEN, MOL, Shell) mají standardně vyšší marže než nezávislí provozovatelé.

## Jak se orientovat v cenách?

Nejjednodušší způsob je sledovat BenzinMapa.cz, kde každých 6 hodin aktualizujeme ceny ze stovek čerpacích stanic v celé ČR.
    `,
    faqs: [
      { q: 'Proč benzín zdražuje každé léto?', a: 'Letní sezóna znamená vyšší poptávku po pohonných hmotách – turistická sezona zvyšuje spotřebu. Zároveň přechod na letní benzínovou specifikaci zvyšuje výrobní náklady.' },
      { q: 'Kdy bude benzín opět levnější?', a: 'Ceny pohonných hmot závisí na globálních faktorech. Sledujte trendy na naší stránce – zobrazujeme 7denní trend vývoje cen.' },
    ],
  },
  'jak-usetrit-za-palivo-10-tipu': {
    title: 'Jak ušetřit za palivo: 10 tipů pro řidiče',
    excerpt: 'Praktické tipy jak snížit náklady na pohonné hmoty.',
    date: '2026-04-15',
    readTime: '7 min',
    tag: 'Tipy',
    content: `
## 10 tipů jak ušetřit za benzín a naftu

### 1. Tankujte v nejlevnějších stanicích
Používejte BenzinMapa.cz k nalezení nejlevnější čerpačky ve svém okolí. Rozdíl mezi nejlevnější a nejdražší stanicí ve stejném městě může být i 3–5 Kč/l.

### 2. Plný nádrž je investice
Pokud víte, že ceny porostou, zatankujte plný nádrž při nízkých cenách.

### 3. Jízda předvídavě
Vyhýbejte se prudkému brzdění a zrychlování – spotřeba se může lišit až o 30 %.

### 4. Sledujte věrnostní programy
Benzina ORLEN, MOL a Shell nabízejí věrnostní karty s bonusy.

### 5. Tankujte ráno nebo večer
Palivo je hustší při nižší teplotě – dostanete mírně více energie za stejnou cenu.

### 6. Nepodchlazujte klimatizaci
AC zvyšuje spotřebu o 0,5–1,5 l/100 km – používejte jen když je to nutné.

### 7. Správný tlak v pneumatikách
Podhuštěné pneumatiky zvyšují spotřebu až o 3 %.

### 8. Srovnejte supermarketové čerpačky
Hypermarkety (Kaufland, Lidl) mívají ceny pod průměrem trhu.

### 9. Využijte nezávislé provozovatele
Eurobit, Robin Oil a podobné regionální sítě jsou obvykle levnější než velké značky.

### 10. Plánujte trasy chytře
Aplikace jako Waze nebo Google Maps počítají trasy s ohledem na vzdálenost – kratší trasa = méně paliva.
    `,
    faqs: [
      { q: 'Kolik lze ušetřit výběrem levnější čerpačky?', a: 'Při nádrži 50 litrů a rozdílu 3 Kč/l ušetříte 150 Kč. Za rok při tankování 2× měsíčně to dělá 3 600 Kč.' },
      { q: 'Vyplatí se jezdit přes město pro levnější benzín?', a: 'Pouze pokud úspora překryje náklady na delší cestu. Obecně platí – hledejte levnější čerpačku na trase, ne mimo ni.' },
    ],
  },
  'srovnani-cen-lpg-vs-nafta-2026': {
    title: 'Srovnání cen LPG vs. nafta v roce 2026',
    excerpt: 'LPG je historicky levnější než nafta, ale vyplatí se přestavba?',
    date: '2026-04-10',
    readTime: '6 min',
    tag: 'Srovnání',
    content: `
## LPG vs. nafta: ekonomická kalkulace 2026

### Aktuální ceny (duben 2026)
- **Nafta:** ~34,50 Kč/l
- **LPG:** ~18,60 Kč/l
- Rozdíl: nafta je cca 85 % dražší

### Spotřeba a dojezd
LPG auto spotřebuje přibližně o 20–25 % více paliva než benzínový ekvivalent, protože LPG má nižší energetickou hustotu.

| Parametr | Nafta (1.6 TDI) | LPG (1.4 TSI + LPG) |
|----------|-----------------|----------------------|
| Spotřeba | 5,5 l/100 km | 9,5 l/100 km |
| Cena/100 km | 19,0 Kč | 17,7 Kč |
| Roční náklady (20 000 km) | 3 800 Kč | 3 540 Kč |

### Závěr
LPG je ekonomicky výhodné při vysokém ročním nájezdu. Přestavba stojí 30 000–50 000 Kč a návratnost je 5–8 let.
    `,
    faqs: [
      { q: 'Je LPG vhodné pro dálkové cestování?', a: 'Síť LPG stanic v ČR je hustá, ale na dálnicích je menší výběr. Doporučujeme plánovat zastávky předem.' },
      { q: 'Mohu jet do garáže s LPG autem?', a: 'Do podzemních garáží je vjezd s LPG autem zakázán nebo omezený. Zkontrolujte pravidla konkrétní garáže.' },
    ],
  },
  'nejlevnejsi-cerpaci-stanice-cr-2026': {
    title: 'Nejlevnější čerpací stanice v ČR 2026',
    excerpt: 'Které značky mají dlouhodobě nejnižší ceny?',
    date: '2026-04-05',
    readTime: '8 min',
    tag: 'Přehled',
    content: `
## Které sítě čerpacích stanic jsou nejlevnější?

### 1. Nezávislí provozovatelé (nejlevnější)
**Eurobit, Robin Oil, Terno, Tank-ONO** – regionální sítě bez nákladů na branding velkých nadnárodních společností. Ceny bývají o 1–4 Kč/l nižší.

### 2. Supermarketové čerpačky
**Kaufland, Lidl, Albert** – retailové řetězce dotují ceny paliv, aby přilákaly zákazníky do obchodů. Ceny velmi konkurenční.

### 3. MOL
Česká republika je domovský trh MOL – investují do cen, aby udrželi zákazníky.

### 4. Benzina ORLEN
Po převzetí polskou ORLEN skupinou ceny stabilizovány. Věrnostní program s bonusy.

### 5. Shell a OMV (nejdražší)
Prémiové značky s prémiovou cenou. Bonusem je kvalita paliva a hustá síť servisů.

### Doporučení
Pro každodenní tankování: nezávislí provozovatelé nebo supermarkety.
Pro dálkové cestování: MOL nebo Benzina ORLEN (hustá síť u dálnic).
    `,
    faqs: [
      { q: 'Je levnější benzín stejně kvalitní?', a: 'Ano. Všechna paliva prodávaná v ČR musí splňovat normu EN 228 (benzín) nebo EN 590 (nafta). Kvalita je povinně stejná bez ohledu na cenu.' },
      { q: 'Proč jsou Shell a OMV dražší?', a: 'Prémiové značky platí za globální marketing, prémiové pozice u dálnic a rozšířené služby na stanicích. Rozdíl v ceně paliva samotného je minimální.' },
    ],
  },
  'co-ovlivnuje-ceny-pohonnych-hmot': {
    title: 'Co ovlivňuje ceny pohonných hmot v ČR? Kompletní průvodce',
    excerpt: 'Od ceny ropy přes rafinérie, daně, distribuci až po marže čerpacích stanic – rozebíráme každý krok, který rozhoduje o tom, co zaplatíte na pumpě.',
    date: '2026-04-22',
    readTime: '8 min',
    tag: 'Průvodce',
    content: `
## Cesta ropy od vrtu k pumpě

Cena benzínu nebo nafty, kterou zaplatíte na čerpací stanici, vzniká jako součet mnoha faktorů. Pojďme je rozebrat krok za krokem.

### 1. Světová cena ropy (40–50 % konečné ceny)

Základem je ropa – konkrétně ropa Brent, která je referenční cenou pro Evropu. Její cenu určuje globální nabídka a poptávka, geopolitické napětí, rozhodnutí OPEC+ a spekulace na komoditních burzách.

Každé zdražení ropy o 10 USD/barel se přibližně za 2–4 týdny promítne do ceny benzínu zdražením o 1,5–2,5 Kč/l.

### 2. Rafinérie a zpracování (10–15 %)

Ropa se musí přeměnit na benzín nebo naftu v rafinériích. Náklady na zpracování závisí na technologii rafinérie, ceně energie a požadavcích na kvalitu paliva (letní/zimní specifikace).

### 3. Spotřební daň – největší fixní složka

Spotřební daň v ČR je pevně daná zákonem:
- **Natural 95 a 98:** 12 843 Kč za 1 000 litrů = **12,84 Kč za litr**
- **Nafta:** 10 950 Kč za 1 000 litrů = **10,95 Kč za litr**

To znamená, že bez ohledu na světové ceny ropy platíte za benzín daňový základ ~13 Kč/l.

### 4. DPH (21 %)

DPH se počítá z celé ceny včetně spotřební daně. Pokud celková cena bez DPH je 30 Kč, DPH přidá dalších 6,30 Kč.

### 5. Distribuce a logistika (5–10 %)

Palivo musí přicestovat z rafinérie (ČR závisí na polských a slovenských rafinériích) do distribučních terminálů a dále na čerpací stanice. Náklady na dopravu, skladování a poplatky za terminály se promítnou do velkoobchodní ceny.

### 6. Marže čerpací stanice (5–15 %)

Marže se výrazně liší podle sítě:
- Velké sítě (Shell, OMV): **3–6 Kč/l**
- Středně velké (Benzina, MOL): **2–4 Kč/l**
- Nezávislé a supermarketové: **1–2,5 Kč/l**

### 7. Kurz CZK/USD

Protože ropa se obchoduje v dolarech, oslabení koruny zdražuje dovoz. Pokud koruna oslabí o 1 Kč/USD, cena benzínu roste přibližně o 0,5 Kč/l.

## Proč se ceny liší na různých stanicích?

Stejné palivo (splňující normu EN 228) může stát na sousedních stanicích 3–5 Kč/l jinak. Důvody:
- **Nájemné:** Čerpačka u dálnice platí za prémiovou polohu.
- **Branding:** Velké sítě investují do marketingu.
- **Obrat:** Stanice s vyšším obratem si mohou dovolit nižší marži.
    `,
    faqs: [
      { q: 'Proč zdražil benzín přes noc?', a: 'Ceny pohonných hmot mohou reagovat rychle na pohyb ropy na světových trzích, výkyvy kurzu dolaru nebo regionální výpadky dodávek. Skokové zdražení o více než 1 Kč přes noc je obvykle způsobeno kombinací těchto faktorů.' },
      { q: 'Kdy se zdražení ropy projeví na pumpě?', a: 'Zpravidla za 2–4 týdny. Rafinérie a distributoři mají zásoby nakoupené za starší ceny, takže změna ceny ropy se promítá postupně.' },
      { q: 'Může stát ovlivnit ceny pohonných hmot?', a: 'Stát může dočasně snížit spotřební daň nebo DPH. V ČR k tomu zatím nedošlo, ale v době energetické krize 2022 to udělalo Německo či Francie.' },
    ],
  },

  'rozdil-natural-95-vs-98': {
    title: 'Natural 95 vs. Natural 98: Jaký je skutečný rozdíl?',
    excerpt: 'Stojí za příplatek 3–4 Kč/l Natural 98? Vysvětlujeme oktanové číslo, vliv na motor, výkon a kdy se tankování prémia skutečně vyplatí.',
    date: '2026-04-18',
    readTime: '5 min',
    tag: 'Průvodce',
    content: `
## Co je oktanové číslo?

Oktanové číslo vyjadřuje odolnost paliva proti samovznícení (klepání motoru). Natural 95 má minimální oktanové číslo 95 RON, Natural 98 má 98 RON.

### Proč záleží na klepání motoru?

Moderní motory s přeplňováním (turbo) pracují s vyšším kompresním poměrem, aby dosáhly vyššího výkonu při nižší spotřebě. Pokud se palivo vzněcuje příliš brzy (před zapálením svíčkou), motor "klepe" – to poškozuje ložiska, písty a snižuje životnost.

## Kdy se Natural 98 vyplatí?

### Motory s doporučením 98 RON
Výrobci jako BMW, Mercedes, Porsche, Audi a některé sporty Honda/Toyota doporučují nebo vyžadují 98 RON. Používáte-li 95 v takovém motoru:
- Řídící jednotka zpozdí zapalování → méně výkonu (-5–15 hp)
- Vyšší spotřeba (+0,3–0,8 l/100 km)
- Dlouhodobě větší opotřebení

### Motory navržené pro 95 RON
Běžné motory s nižším kompresním poměrem z 98 nezískají nic. Řídící jednotka jednoduše nenechá motoru "zpívat" výš, protože na to není konstrukčně připraven.

## Ekonomická kalkulace

| Parametr | Natural 95 | Natural 98 |
|---|---|---|
| Cena (duben 2026) | ~40,5 Kč/l | ~43,5 Kč/l |
| Příplatek | – | +3 Kč/l |
| Úspora spotřeby (turbo motor) | – | 0–5 % |
| Výsledek (60 l nádrž) | 2 430 Kč | 2 610 Kč |

Při průměrné spotřebě 7 l/100 km a 20 000 km/rok zaplatíte za Natural 98 o **4 200 Kč více ročně**. Úspora na spotřebě (max. 5 %) tuto částku zpravidla nepokryje.

## Závěr

- **Máte turbo motor od prémiové značky?** Tankujte 98, jak doporučuje výrobce.
- **Máte běžný atmosférický nebo starší motor?** Natural 95 stačí.
- **Nevíte?** Podívejte se do technického průkazu nebo příručky – je tam přímo uvedeno.
    `,
    faqs: [
      { q: 'Zničím motor tankem Natural 95 místo 98?', a: 'Ne. Moderní motory mají řídící jednotku (ECU), která automaticky upraví zapalování a zabrání poškození. Výsledkem je ale nižší výkon a vyšší spotřeba, nikoli okamžité poškození.' },
      { q: 'Je Natural 98 čistší než 95?', a: 'Obě paliva splňují normu EN 228. Někteří výrobci přidávají do prémiových paliv čisticí aditiva, ale tato aditiva lze koupit i samostatně za zlomek ceny rozdílu.' },
      { q: 'Mohu mixovat Natural 95 a 98?', a: 'Ano, bez problémů. Výsledné oktanové číslo bude přibližně průměr obou paliv. Obvykle se to dělá, když dojedete na prázdno k jiné stanici.' },
    ],
  },

  'dalnicni-vs-mestska-cerpacka': {
    title: 'Dálniční vs. městská čerpačka: Kde je benzín opravdu levnější?',
    excerpt: 'Dálniční pumpy jsou proslulé vyššími cenami. Kolik ale skutečně přeplatíte? A kdy se vyplatí odbočit do města? Reálná data z celé ČR.',
    date: '2026-04-08',
    readTime: '4 min',
    tag: 'Analýza',
    content: `
## Mýtus vs. realita: dálniční přirážka

Dálniční čerpačky jsou dražší – to je obecně známý fakt. Ale o kolik?

Na základě dat BenzinMapa.cz z tisíců stanic v ČR platí:

| Typ stanice | Průměr Natural 95 | Přirážka |
|---|---|---|
| Nejlevnější v ČR (nezávislé) | -1,50 Kč pod průměrem | – |
| Průměr ČR | 0 Kč | – |
| Shell/OMV u dálnice | +1,50–2,50 Kč nad průměrem | +1,50–2,50 Kč |

Pro 60l nádrž to znamená přeplatek **90–150 Kč** oproti průměrné stanici ve městě.

## Kdy je dálniční stanice rozumná volba?

### 1. Máte méně než čtvrtinu nádrže
Tankujte dříve, než "musíte" – u prázdné nádrže nemáte výběr.

### 2. Jedete na dlouhé trase s časovým tlakem
Zastávka v obci přidá 10–20 minut. Při hodinové sazbě 400 Kč stojí váš čas víc než ušetřených 100 Kč.

### 3. Noc nebo neznámá oblast
Bezpečnost a jistota otevřené stanice mají svou hodnotu.

## Kdy odbočit do města stojí za to

- Víkend + delší trasa: tankujte ráno před výjezdem
- Znáte trasu: naplánujte si zastávku v levné stanici pomocí BenzinMapa.cz
- Velká nádrž (SUV, dodávka): úspora 200–400 Kč se vyplatí i za 5 minut zastávky

## Tip: Plánujte zastávky na BenzinMapa.cz

Na naší mapě vidíte ceny všech stanic podél vaší trasy. Stačí kliknout na stanici a zobrazit aktuální cenu Natural 95, nafty nebo LPG.
    `,
    faqs: [
      { q: 'Jsou dálniční čerpačky povinny mít vyšší ceny?', a: 'Ne, ceny nejsou regulovány. Vyšší ceny jsou výsledkem vyššího nájemného za prémiovou polohu, nižšího obratu mimo sezónu a monopolního postavení v daném úseku.' },
      { q: 'Která dálnice má nejlevnější čerpačky?', a: 'Podle dat BenzinMapa.cz bývají relativně levnější stanice na D35 a D46. Nejdražší jsou typicky stanice u Prahy (D1, D5, D8) a u hranic.' },
    ],
  },

  'benzin-vs-diesel-co-je-ekonomictejsi': {
    title: 'Benzín vs. nafta: Co je v roce 2026 ekonomičtější?',
    excerpt: 'Benzín nebo diesel – odpovídáme s ohledem na aktuální ceny.',
    date: '2026-03-28',
    readTime: '5 min',
    tag: 'Porovnání',
    content: `
## Benzín nebo nafta v roce 2026?

### Aktuální ceny
- Natural 95: ~35,62 Kč/l
- Nafta: ~34,50 Kč/l
- Rozdíl: nafta je levnější o ~1,10 Kč/l

### Kdy se diesel vyplatí?
Diesel se tradičně vyplatí při:
- Ročním nájezdu nad 20 000 km
- Převaze dálničních tras
- Potřebě vyššího výkonu (tažení přívěsů)

### Kdy zvolit benzín?
- Nájezd do 15 000 km/rok
- Převaha jízdy ve městě
- Nižší pořizovací cena vozu

### Kalkulace (20 000 km/rok)
| | Benzín 1.5 TSI | Nafta 2.0 TDI |
|---|---|---|
| Spotřeba | 6,5 l/100 km | 5,0 l/100 km |
| Roční náklady | 4 631 Kč | 3 450 Kč |
| Úspora s naftou | | 1 181 Kč/rok |

Při rozdílu v pořizovací ceně 30 000 Kč vychází návratnost dieselu přibližně 25 let – benzín je v dnešní době zpravidla ekonomičtějším výběrem.
    `,
    faqs: [
      { q: 'Je nafta nebo benzín lepší pro životní prostředí?', a: 'Nafta emituje více NO2 a pevných částic, benzín více CO2. Z ekologického pohledu záleží na konkrétním motoru a normě Euro.' },
      { q: 'Bude diesel zakázán?', a: 'EU plánuje zákaz prodeje nových spalovacích motorů od roku 2035. Do té doby jsou naftová auta plně legální.' },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: 'Článek nenalezen' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://benzinmapa.cz/blog/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <>
      <FaqJsonLd faqs={post.faqs} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-green-600">Blog</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white">{post.tag}</span>
        </nav>

        <header className="mb-8">
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{post.tag}</span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-3 mb-3 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={14} />
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <span>·</span>
            <span>{post.readTime} čtení</span>
          </div>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-a:text-green-700">
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-600 dark:text-gray-400">{line.slice(2)}</li>;
            if (line.startsWith('| ')) return <p key={i} className="text-sm text-gray-600 dark:text-gray-400 font-mono">{line}</p>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>;
          })}
        </div>

        {/* FAQ */}
        {post.faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nejčastější dotazy</h2>
            <div className="space-y-3">
              {post.faqs.map(({ q, a }) => (
                <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <summary className="font-semibold cursor-pointer list-none text-gray-900 dark:text-white">{q}</summary>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium">
            <ChevronLeft size={16} />
            Zpět na blog
          </Link>
        </div>
      </article>
    </>
  );
}
