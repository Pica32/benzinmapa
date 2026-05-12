import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChevronLeft } from 'lucide-react';
import { FaqJsonLd, ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

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
  'adblue-co-je-cena-kde-koupit-2026': {
    title: 'AdBlue: Co to je, kolik stojí a kde doplnit v ČR 2026',
    excerpt: 'AdBlue potřebuje každý diesel Euro 5 a novější. Cena na stojanech se liší až 5×. Tank ONO má nejlevnější, Shell nejdražší. Kompletní průvodce pro řidiče.',
    date: '2026-04-29',
    readTime: '6 min',
    tag: 'Průvodce',
    content: `
## Co je AdBlue a proč ho dieselové auto potřebuje

AdBlue je vodný roztok močoviny (32,5 % čistá močovina + 67,5 % demineralizovaná voda). Používá se v systému SCR (Selective Catalytic Reduction), který redukuje emise oxidů dusíku (NOx) z dieselových motorů.

Každý diesel s normou **Euro 5 a Euro 6** má systém SCR a potřebuje AdBlue. To zahrnuje téměř všechna naftová osobní auta prodaná v ČR po roce 2010.

### Jak SCR systém funguje

AdBlue se vstřikuje do výfukových plynů před katalyzátorem SCR. Při teplotě výfukových plynů se přemění na amoniak, který chemicky reaguje s NOx a rozloží ho na neškodný dusík (N₂) a vodu (H₂O).

Bez AdBlue by emise NOx z moderních dieselů přesáhly zákonné limity — auto by bylo de facto provozováno nelegálně.

### Co se stane, když AdBlue dojde?

Moderní auta zobrazí varování přibližně 2 500–5 000 km před prázdnou nádrží. Pokud AdBlue skutečně dojde:

- Motor přejde do nouzového režimu (omezení výkonu)
- Při zastavení a opětovném nastartování auto nemusí najet
- U některých značek (VW, BMW, Mercedes) po prázdné nádrži auto nenastartuje vůbec

**Nikdy nepřehlížejte varování na palubní desce.**

## Kolik AdBlue auto spotřebuje?

Průměrná spotřeba AdBlue je **1–1,5 litru na každých 1 000 km**. Při ročním nájezdu 15 000 km potřebujete přibližně 15–22 litrů ročně.

Nádrž na AdBlue má typicky objem 10–25 litrů. Malá auta (Škoda Fabia) mají menší nádrž a doplňují AdBlue častěji, velká SUV a dodávky mají větší zásobník.

## Ceny AdBlue v ČR — kde je nejlevnější?

Ceny se výrazně liší podle místa koupě:

| Způsob nákupu | Cena za litr |
|---|---|
| Tank ONO — stojan | 6,90–8,90 Kč |
| EuroOil / nezávislé sítě | 9–14 Kč |
| MOL — stojan | 12–18 Kč |
| Benzina ORLEN — stojan | 14–20 Kč |
| Shell — stojan | 18–28 Kč |
| OMV — stojan | 20–30 Kč |
| Kanystr 5 l (autoservis, e-shop) | 30–60 Kč celkem (6–12 Kč/l) |
| Kanystr 10 l (Kaufland, Lidl) | 60–90 Kč celkem (6–9 Kč/l) |

Nejlevnější variantou jsou kanystr z hypermarketu nebo stojan v síti Tank ONO. Shell a OMV účtují na stojanech 3–4× více.

### Proč je tak velký rozdíl?

AdBlue je komodita — výroba je levná a standardizovaná (norma ISO 22241). Velký cenový rozdíl na stojanech je čistě marže čerpacích stanic. Prémiové sítě (Shell, OMV) účtují vysokou marži, protože mnozí řidiči netuší, že mohou doplnit jinde levněji.

## Kde koupit AdBlue v ČR — praktický přehled

**Na stojanech** (přímé čerpání do nádrže auta):
- Tank ONO — nejlevnější v ČR, dostupné na většině stanic
- EuroOil, Eurobit — dobré ceny
- MOL, Benzina — průměrné ceny
- Shell, OMV — drahé, ale dostupné všude

**V kanystru** (vhodné pro zásobu):
- Kaufland, Lidl — pravidelně v akcích za ~7–9 Kč/l
- e-shopy (Mall, Alza, Amazon) — kanystry 5–20 l za dobré ceny
- Autoservisy — obvykle dražší než hypermarket

**Aplikace BenzinMapa.cz** — filtr „AdBlue" zobrazí stanice s AdBlue u vás v okolí.

## Jak správně doplnit AdBlue

1. Plnicí hrdlo AdBlue je **oddělené od palivového** — bývá menší, označené modrou barvou a nápisem „AdBlue" nebo „Urea"
2. AdBlue **nesmí přijít do kontaktu s naftou** — způsobí poškození SCR systému (oprava 20 000–80 000 Kč)
3. Nepřeplňujte nádrž — nechte alespoň 2 cm volno pro roztažnost kapaliny
4. AdBlue **mrzne při −11 °C** — moderní auta mají vyhřívání nádrže, ale skladujte kanystr v teple
5. AdBlue má **omezenou trvanlivost** — max. 18 měsíců v neotevřeném balení, 6 měsíců po otevření

## Může AdBlue poškodit auto?

AdBlue samotné auto nepoškodí, pokud se dostane do správné nádrže. Problémy nastanou, když:

- **AdBlue v naftové nádrži** — ihned přestat používat, volat odtahovou službu, čerpání nastartovaného auta spaluje AdBlue v motoru a může způsobit těžké poškození
- **Levné nebo falzifikované AdBlue** — kupujte pouze certifikované s označením ISO 22241, nekvalitní AdBlue poškodí SCR katalyzátor
    `,
    faqs: [
      { q: 'Co je AdBlue a proč ho diesel potřebuje?', a: 'AdBlue je vodný roztok močoviny vstřikovaný do výfukových plynů. Systém SCR ho přemění na amoniak, který neutralizuje škodlivé oxidy dusíku (NOx). Potřebuje ho každý diesel s normou Euro 5 a Euro 6, tedy téměř všechna naftová auta po roce 2010.' },
      { q: 'Kde je AdBlue nejlevnější v ČR?', a: 'Nejlevnější AdBlue na stojanech má Tank ONO (6,90–8,90 Kč/l). Shell a OMV jsou nejdražší (18–30 Kč/l). Kanystr v Kauflandu nebo Lidlu vyjde na 6–9 Kč/litr. Na BenzinMapa.cz najdete stanice s AdBlue filtrovaně podle polohy.' },
      { q: 'Co se stane, když AdBlue v autě dojde?', a: 'Auto nejprve přejde do nouzového režimu s omezením výkonu. Pokud AdBlue skutečně dojde a vy zastavíte, mnoho moderních aut (VW, BMW, Mercedes) poté vůbec nenastartuje. Nikdy nepřehlížejte varování na palubní desce.' },
      { q: 'Kolik AdBlue auto ročně spotřebuje?', a: 'Průměrně 1–1,5 litr na 1 000 km. Při ročním nájezdu 15 000 km potřebujete 15–22 litrů. Nádrž má objem 10–25 litrů — doplňujete přibližně jednou až dvakrát ročně.' },
      { q: 'Lze doplnit AdBlue sám nebo musím do servisu?', a: 'Doplnění je jednoduché jako tankování nafty. Plnicí hrdlo AdBlue je oddělené, označené modrou barvou. Kanystr nalijete sami. Pozor — nikdy nesmíchejte AdBlue s naftou, jinak hrozí oprava za desítky tisíc korun.' },
    ],
  },

  'ceny-benzinu-v-evrope-2026-srovnani': {
    title: 'Ceny benzínu v Evropě 2026: Srovnání zemí EU – kde je nejlevnější?',
    excerpt: 'ČR patří mezi 5 nejlevnějších zemí EU pro tankování. Bulharsko a Polsko jsou levnější, západ Evropy výrazně dražší. Kompletní srovnání cen benzínu a nafty v Evropě.',
    date: '2026-05-01',
    readTime: '5 min',
    tag: 'Srovnání',
    content: `
## Kde je benzín v Evropě nejlevnější v roce 2026?

Ceny pohonných hmot se v Evropě výrazně liší — rozdíl mezi nejlevnější a nejdražší zemí EU je u benzínu přes 25 Kč/litr. Klíčovým faktorem nejsou ceny ropy (ty jsou všude stejné), ale **výše spotřebních daní** v každé zemi.

### Nejlevnější benzín v EU 2026

Nejnižší ceny benzínu Natural 95 jsou tradičně v jihovýchodní a střední Evropě:

| Země | Benzín Natural 95 | Nafta |
|---|---|---|
| Bulharsko | ~29–31 Kč/l | ~28–30 Kč/l |
| Polsko | ~33–36 Kč/l | ~32–35 Kč/l |
| Maďarsko | ~34–37 Kč/l | ~33–36 Kč/l |
| Rumunsko | ~34–38 Kč/l | ~33–36 Kč/l |
| **Česká republika** | **~39–43 Kč/l** | **~38–44 Kč/l** |
| Slovensko | ~40–44 Kč/l | ~39–43 Kč/l |

ČR je v první pětici nejlevnějších zemí EU. Oproti průměru celé EU je litr benzínu v Česku levnější o přibližně 6–7 Kč.

### Nejdražší benzín v EU 2026

Západ a sever Evropy mají výrazně vyšší ceny — primárně kvůli vysokým spotřebním daním:

| Země | Benzín Natural 95 |
|---|---|
| Norsko | ~55–65 Kč/l |
| Holandsko | ~52–58 Kč/l |
| Finsko | ~50–55 Kč/l |
| Švédsko | ~48–54 Kč/l |
| Dánsko | ~48–53 Kč/l |
| Německo | ~44–50 Kč/l |
| Rakousko | ~43–48 Kč/l |

Německo je pro mnoho Čechů nejbližší „drahá" země — benzín je tam o 3–7 Kč/l dražší než v ČR.

## Proč jsou ceny v EU tak rozdílné?

### 1. Spotřební daň — hlavní faktor

Spotřební daň na benzín se v EU pohybuje od 25 do 80 Kč/litr. Holandsko a skandinávské státy mají spotřební daně nejvyšší na světě — tvoří 50–60 % ceny paliva na pumpě. V ČR je spotřební daň u benzínu 12,84 Kč/l, u nafty 9,95 Kč/l — patříme k zemím s nižší daní.

### 2. DPH

DPH se v EU pohybuje od 17 % (Lucembursko) do 27 % (Maďarsko). ČR má 21 % — průměr EU.

### 3. Životní úroveň a mzdy

Ceny v Norsku jsou high — ale Norové mají také trojnásobné průměrné mzdy. Z pohledu „kolik litrů koupím za hodinu průměrné mzdy" jsou Norové a Finové na tom lépe než většina střední Evropy.

### 4. Vzdálenost od ropných terminálů

Periferní regiony EU (ostrovy, vzdálené oblasti) mají vyšší distribuční náklady.

## Je výhodné tankovat v zahraničí při cestování?

Závisí na trase:

**Polsko** je pro Čechy z pohraničních regionů zajímavé — benzín je o 3–7 Kč/l levnější. Více v článku Tankovat v Polsku nebo na Slovensku?.

**Německo a Rakousko** — výrazně dražší než v ČR. Při jízdě do Německa se vyplatí odjet s plnou nádrží z domova.

**Slovensko** — srovnatelné ceny jako ČR, mírně dražší.

**Chorvatsko, Slovinsko** — dražší než ČR o 3–5 Kč/l, zvláště u dálničních čerpacích stanic.

## Jak ČR obstojí na světové úrovni?

Ve světovém srovnání patří české ceny paliv ke středu tabulky:

- **Nejlevnější benzín na světě:** Venezuela (cena regulována státem, ~0,01 USD/l), Írán, Libye
- **Nejdražší benzín na světě:** Hong Kong, Norsko, Islandsko
- **USA:** ~30–35 Kč/l (nízké daně, vlastní těžba ropy)
- **ČR:** Přibližně na úrovni USA v přepočtu, ale s výrazně nižšími mzdami

## Kdy se budou ceny v EU sbližovat?

ETS2 emisní povolenky (plánované od 2028) budou platit jednotně v celé EU — ale každá země si daň ponechá ve státním rozpočtu. To neznamená, že se ceny srovnají. Skandinávie bude pravděpodobně dál výrazně dražší.

Sledujte aktuální srovnání cen na BenzinMapa.cz — zobrazujeme průměrné ceny v ČR aktualizované 3× denně.
    `,
    faqs: [
      { q: 'Kde je benzín v Evropě nejlevnější?', a: 'Nejlevnější benzín v EU mají Bulharsko (~30 Kč/l) a Polsko (~34 Kč/l). ČR patří do top 5 nejlevnějších zemí EU — benzín je zde o 6–7 Kč levnější než je průměr EU.' },
      { q: 'Proč je benzín v Německu dražší než v ČR?', a: 'Německo má výrazně vyšší spotřební daně na pohonné hmoty. Spotřební daň u benzínu v Německu je přibližně 25–30 Kč/l, v ČR jen 12,84 Kč/l. Výsledkem je cena o 3–7 Kč/l vyšší.' },
      { q: 'Vyplatí se tankovat v Polsku?', a: 'Pro řidiče z pohraničních regionů (Ostrava, Opava, Liberec) ano — benzín v Polsku je o 3–7 Kč/l levnější. Pro řidiče z Prahy je odbočka do Polska prodělečná — benzín na cestu stojí víc než ušetříte. Detailní výpočet najdete v článku o tankování v Polsku.' },
      { q: 'Proč je benzín v ČR levnější než v Holandsku?', a: 'Primárně kvůli daním. Holandsko má jedny z nejvyšších spotřebních daní na pohonné hmoty v Evropě — přes 50 Kč/l, zatímco ČR má 12,84 Kč/l. Holanďané to částečně kompenzují vysokými mzdami.' },
      { q: 'Je ČR opravdu mezi nejlevnějšími zeměmi EU?', a: 'Ano. ČR pravidelně patří do první pětice nejlevnějších zemí EU pro pohonné hmoty. Levnější jsou Bulharsko, Polsko, Maďarsko a Rumunsko. Německo je přibližně o 10–20 % dražší, Holandsko o 30–40 %.' },
    ],
  },

  'premium-benzin-shell-vpower-stoji-za-to': {
    title: 'Shell V-Power a prémium benzíny: Stojí za příplatek 3–4 Kč/l?',
    excerpt: 'Shell V-Power, OMV MaxxMotion, Benzina Verva — prémiová paliva stojí o 3–4 Kč/l více. Čisticí aditiva fungují, ale pro většinu aut nejde o nutnost. Zjistěte, kdy se prémium vyplatí.',
    date: '2026-05-06',
    readTime: '6 min',
    tag: 'Test',
    content: `
## Co jsou prémiová paliva a čím se liší od standardního benzínu?

Na českých čerpačkách najdete vedle standardního Natural 95 také prémiové varianty:

- **Shell V-Power** (Natural 98+, oktanové číslo ≥ 98 RON)
- **OMV MaxxMotion 100** (100 RON)
- **Benzina Verva 100** (100 RON)
- **MOL EVO 100** (100 RON)

Prémiová paliva se od standardního Natural 95 liší ve dvou věcech:

**1. Vyšší oktanové číslo** — odolnější vůči předčasnému vznícení (klepání motoru), umožňuje lepší nastavení zapalování u vhodných motorů.

**2. Přísada čisticích aditiv** — Shell V-Power obsahuje vlastní patentovou formuli čisticích látek, které aktivně čistí vstřikovací trysky a ventily od karbonových usazenin.

## Jak fungují čisticí aditiva a fungují opravdu?

Moderní benzínové motory s přímým vstřikem (GDI, FSI, TFSI) trpí usazováním karbonu na vstřikovacích tryskách a sacích ventilech. Standard EN 228 pro benzín vyžaduje minimální obsah aditiv — ale prémiová paliva jejich obsah výrazně překračují.

Testování Shell prokázalo, že V-Power při pravidelném tankování:
- Obnoví průtok tryskou z průměrných 85 % zpět na 100 % za 5 000 km
- Snižuje spotřebu o průměrně 1,5 % u znečištěných vstřikovačů
- Prodlužuje interval čistění vstřikovačů v servisu

Nezávislé testy (SvetMotoru.cz, Auto.cz) výsledky Shell potvrzují — efekt existuje, ale projeví se výrazněji u starších nebo zanedbaných motorů.

## Kdy se prémium benzín vyplatí — a kdy ne?

### Vyplatí se pro:
- **Výkonné motory s přímým vstřikem** (BMW TwinPower Turbo, Mercedes AMG, Porsche, Audi RS) — tyto motory jsou optimalizovány pro vysoké RON a benefitují z lepšího nastavení zapalování
- **Auta doporučující tankovat 98+ RON** (viz servisní knížka) — pokud výrobce 98 RON doporučuje, Natural 95 způsobuje drobné ztráty výkonu
- **Zanedbaná auta nebo auta s viditelnou spotřebou** — čisticí efekt je znatelný na autě, které nikdy prémium nejezdilo

### Nevyplatí se pro:
- **Běžné motory optimalizované pro 95 RON** (Škoda 1.0 TSI, Volkswagen 1.5 TSI, Toyota benzín atd.) — žádný prokazatelný benefit na výkon, minimální čisticí efekt
- **Dieselové motory** — oktanové číslo pro naftu neexistuje (diesel má cetanové číslo), prémiová nafta má jiné výhody (mazivost, aditiva)
- **Krátkodobé citycar použití** — při jízdě výhradně ve městě se aditiva nestačí projevit

## Jaký je reálný rozdíl v ceně a výkonu?

### Cena:
Shell V-Power je o **3–4 Kč/l dražší** než Standard Natural 95. Při 50litrové nádrži tankujete o 150–200 Kč více.

### Výkon:
U motorů optimalizovaných pro 98+ RON může být nárůst výkonu **3–5 %** díky optimálnímu nastavení zapalování a zabraňování klepání. Pro motor na 95 RON je rozdíl minimální.

### Spotřeba:
Natural 98 má **nepatrně vyšší energetický obsah** (asi 0,5 %) než Natural 95. Na praktickou spotřebu to nemá měřitelný vliv.

## Konkurence Shell V-Power v ČR

| Palivo | Oktany | Cena vs. 95 | Dostupnost |
|---|---|---|---|
| Shell V-Power | ≥ 98 RON | +3–4 Kč/l | Shell síť |
| OMV MaxxMotion 100 | 100 RON | +4–5 Kč/l | OMV síť |
| Benzina Verva 100 | 100 RON | +3–4 Kč/l | Benzina síť |
| MOL EVO 100 | 100 RON | +3–4 Kč/l | MOL síť |

Všechna prémiová paliva obsahují čisticí aditiva — liší se formulí a dostupností.

## Verdikt: Stojí prémium benzín za to?

**Pro moderní výkonné motory s přímým vstřikem (TSI, TDI, i turba) a doporučením výrobce 98+ RON: ano.** Aditiva snižují frekvenci servisního čistění vstřikovačů, a to může vyvážit příplatek za palivo.

**Pro běžné motory na 95 RON: ne, není to nutné.** Servisní interval čistění motoru lze udržet pravidelnou údržbou a olejem správné viskozity.

Kompromis: **tankujte prémium každý čtvrtý tankování.** Získáte čisticí efekt za výrazně nižší celkové náklady než při 100% tankování V-Power.
    `,
    faqs: [
      { q: 'Co je Shell V-Power a liší se od Normal Natural 95?', a: 'Shell V-Power má vyšší oktanové číslo (≥ 98 RON vs. 95 RON) a vyšší koncentraci čisticích aditiv. Aditiva aktivně čistí vstřikovací trysky a ventily od karbonových usazenin, které snižují výkon a zvyšují spotřebu.' },
      { q: 'Stojí Shell V-Power za příplatek 3–4 Kč/l?', a: 'Pro výkonné motory s přímým vstřikem (TSI, TDI, BMW TwinPower) a doporučením výrobce 98+ RON: ano. Pro běžné motory optimalizované na 95 RON: efekt je minimální a příplatek se nevyplatí. Sledujte, co doporučuje servisní knížka.' },
      { q: 'Může prémiový benzín poškodit motor na 95 RON?', a: 'Ne, vyšší oktanové číslo motoru neubližuje. V nejhorším případě žádný přínos (u motorů na 95 RON motor nemůže využít vyšší oktany). Škodu by způsobilo naopak tankování nízkokvalitatního benzínu do motoru doporučujícího 98+.' },
      { q: 'Jaký je rozdíl mezi Natural 98 a Natural 100?', a: 'Natural 100 (OMV MaxxMotion 100, Benzina Verva 100) má vyšší oktanové číslo (100 RON vs. 98 RON). Pro běžná sériová auta je rozdíl zanedbatelný. Benefit pocítí pouze závodní nebo extrémně výkonné motory.' },
      { q: 'Jak často tankovat V-Power pro čisticí efekt?', a: 'Shell doporučuje tankovat V-Power pravidelně. Kompromis pro řidiče kteří chtějí čisticí efekt za nižší náklady: každý 3.–4. tankování prémium. Aditiva začnou čistit ihned, efekt se kumuluje.' },
    ],
  },

  'jak-spravne-tankovat-chyby-ridicu': {
    title: 'Jak správně tankovat auto: 7 chyb, které řidiči dělají a nevědí o tom',
    excerpt: 'Přetankování poškodí EVAP systém, záměna paliva zničí motor za stovky tisíc. 7 nejčastějších chyb při tankování a jak je nedělat – praktický průvodce pro každého řidiče.',
    date: '2026-05-10',
    readTime: '5 min',
    tag: 'Tipy',
    content: `
## Tankování vypadá jednoduše. Přesto řidiči dělají chyby, které stojí tisíce

Tankování patří k nejrutinnějším úkonům každého řidiče. A právě proto vznikají nebezpečné zvyky, které mohou způsobit škody od stovek do stovek tisíc korun. Přinášíme 7 nejčastějších chyb — a jak je nedělat.

### Chyba 1: Tankování po první cvaknutí píšťaly (přetankování)

**Co řidiči dělají:** Po cvaknutí píšťaly natankují „ještě trochu víc" aby zaokrouhlili cenu nebo využili celou nádrž.

**Proč je to špatně:** Moderní auta mají systém EVAP (Evaporative Emission Control), který zachytává výpary benzínu z nádrže pomocí filtru s aktivním uhlím. Pokud do plné nádrže přidáte víc paliva, kapalný benzín se dostane do tohoto filtru — a poškodí ho.

**Oprava filtru EVAP:** 3 000–15 000 Kč.

**Pravidlo:** Cvaknutí = stop. Nikdy netankujte dál.

### Chyba 2: Záměna nafty a benzínu

**Co řidiči dělají:** Uniknou na autopilotu a natočí špatné palivo. Ročně se to v ČR stane desítkám tisíc řidičů.

**Proč je to špatně:**
- **Benzín do dieselu** — benzín nemazí palivové čerpadlo a vstřikovače jako nafta. Při nastartování a jízdě dochází k rychlému opotřebení a destrukci čerpadla a vstřikovačů. Oprava motoru: 50 000–300 000 Kč.
- **Nafta do benzínu** — méně destruktivní, ale motor nebude správně pracovat. Auta zpravidla se záměnou nastartují a jedou pár km, pak přestanou.

**Pravidlo:** Nafta má menší průměr hrdla pistole, benzínové pistole větší — proto se nafta do benzínové nádrže snadno nedostane. Ale moderní diesely mají rozměrově kompatibilní hrdlo — benzín do diesel nádrže natočit lze.

**Co dělat při záměně:** NENASTARTOVAT. Okamžitě zavolat odtahovou službu. Čím dříve, tím levnější oprava.

### Chyba 3: Jízda s prázdnou nebo skoro prázdnou nádrží

**Co řidiči dělají:** Záměrně jezdí „na rezervě" — šetří čas nebo oddalují tankování.

**Proč je to špatně:** Palivové čerpadlo se chladí a maže palivem. V prázdné nádrži čerpadlo chladí vzduch — hřeje se a opotřebovává. Navíc drobné sedimenty a nečistoty, které se usazují na dně nádrže, se při malém množství paliva nasávají přímo do čerpadla.

**Výměna palivového čerpadla:** 7 000–25 000 Kč.

**Pravidlo:** Tankujte při čtvrtině nádrže nebo dříve.

### Chyba 4: Tankování se zapnutým motorem

**Co řidiči dělají:** Nechávají motor běžet kvůli klimatizaci nebo rychlejšímu odjezdu.

**Proč je to špatně:** Benzínové výpary jsou lehčí než vzduch a hromadí se kolem vozidla. Při jiskře (motor, elektrostatický výboj) hrozí vzplanutí. Navíc je tankování se zapnutým motorem na většině čerpacích stanic zakázáno a hrozí pokuta.

**Pravidlo:** Motor vždy vypnout před tankováním.

### Chyba 5: Neuzemění před tankováním

**Co řidiči dělají:** Rovnou sahají po pistoli bez dotyku kovového předmětu.

**Proč je to špatně:** Sedadlo nebo čalounění auta může generovat elektrostatický náboj. Při kontaktu s pistolí na benzínu může dojít ke statické jiskře v prostředí výparů — teoretická možnost vznícení.

**Pravidlo:** Před sáhnutím na pistoli se dotkněte kovového rámu dveří nebo karoserie.

### Chyba 6: Tankování LPG bez povolení systému (pro LPG auta)

**Co řidiči dělají:** U aut s LPG přestavbou tankují LPG bez aktivace správného módu v autě, nebo tankují příliš rychle.

**Proč je to špatně:** LPG je pod tlakem — při rychlém plnění může tlak v nádrži překročit bezpečnostní limit. Moderní LPG ventily mají pojistku, ale starší přestavby ne vždy.

**Pravidlo:** Tankovejte LPG pomalu, sledujte indikátor tlaku.

### Chyba 7: Ignorování blikajícího indikátoru „palivo"

**Co řidiči dělají:** Spoléhají na to, že „ještě dojede" a odkládají tankování.

**Proč je to špatně:** Blikající indikátor paliva neznamená „máte pár litrů". U moderních aut s elektronickými palivovými systémy může auto přejít do nouzového režimu při nízkém tlaku paliva — zvláště u dieselů s common rail.

Navíc jízdě s prázdnou nádrží urychlujete opotřebení palivového čerpadla (viz Chyba 3).

**Pravidlo:** Blikající indikátor = tankovat do 50 km.

## Bonus: Jak ušetřit při každém tankování

Výběr správné čerpačky ušetří více než jakákoliv jiná strategie:
- Supermarketové čerpačky (Kaufland, Lidl) a nezávislé sítě (Eurobit, Robin Oil) bývají o 1,5–3 Kč/l levnější než Shell nebo OMV
- Na BenzinMapa.cz najdete nejlevnější čerpačky v okolí aktualizované každých 6 hodin
- Rozdíl při 50litrové nádrži: 75–150 Kč za tankování
    `,
    faqs: [
      { q: 'Proč nesmím tankovat za první cvaknutí pistole?', a: 'Cvaknutí signalizuje plnou nádrž. Tankování navíc způsobí přetečení do filtru EVAP (systém zachycující výpary), který je určen jen pro páry, ne kapalné palivo. Oprava poškozeného EVAP filtru stojí 3 000–15 000 Kč.' },
      { q: 'Co udělat, když omylem natočím benzín do dieselu?', a: 'Ihned přestat tankovat a NENASTARTOVAT. Zavolat odtahovou službu. Čím dříve je záměna řešena, tím nižší škoda. Nastartování a jízda s benzínem v dieselové nádrži způsobí destrukci čerpadla a vstřikovačů za 50 000–300 000 Kč.' },
      { q: 'Je nebezpečné tankovat se zapnutým motorem?', a: 'Ano. Benzínové výpary se hromadí kolem auta. Zapnutý motor nebo elektrostatická jiskra je potenciálním zdrojem vznícení. Navíc je tankování se zapnutým motorem na čerpacích stanicích zakázáno — hrozí pokuta.' },
      { q: 'Jak nízko mohu nechat klesnout hladinu paliva?', a: 'Ideálně netankujte pod čtvrtinu nádrže. Palivové čerpadlo se chladí palivem — při nízké hladině hřeje a opotřebovává se. Navíc sedimenty ze dna nádrže se při malém množství paliva nasávají do čerpadla. Výměna čerpadla: 7 000–25 000 Kč.' },
      { q: 'Musím se uzemňovat před tankováním?', a: 'Je to dobrý zvyk, zvláště v suchu nebo zimě kdy elektrostatika bývá silnější. Dotkněte se kovového rámu dveří nebo karoserie před sáhnutím na pistoli. Eliminuje riziko statické jiskry v prostředí benzínových výparů.' },
    ],
  },

  'trumpova-celni-valka-a-ceny-benzinu-cr-2026': {
    title: 'Trumpova celní válka a ceny benzínu v ČR: Co čekat do konce roku?',
    excerpt: 'Americká cla způsobila propad ropy na šestileté minimum. Co to reálně znamená pro ceny na českých pumpách a proč efekt nepřichází tak rychle, jak byste čekali.',
    date: '2026-04-29',
    readTime: '7 min',
    tag: 'Analýza',
    content: `
## Ropa se propadla. Proč to na pumpě ještě moc necítíme?

Na začátku dubna 2026 klesla ropa Brent pod 60 USD za barel — nejníže od roku 2021. Příčina je dobře známá: Trumpova administrativa oznámila plošná cla na dovoz z desítek zemí, trhy se zalekly recese, a poptávka po ropě v cenových modelech šla dolů rychleji než liftí v mrakodrapu.

Jenže řidič, který přijel zatankovat v druhém týdnu dubna, žádnou velkou slevu nezažil. Benzín byl sice o něco levnější než na začátku roku, ale ne o tolik, jak by se při pohledu na grafy ropy čekalo. Proč?

### Zpoždění mezi ropou a pumpou je systémové

Cesta ropy od barelu k litrové pístnici je dlouhá. Rafinérie nakupují ropu v kontraktech s výhledem týdnů až měsíců — jejich zásoby jsou nakoupeny za starší, vyšší ceny. Distributor pak prodává rafinovaný benzín velkoobchodně s vlastní marží a logistikou. Celý řetězec funguje jako setrvačník: zdražení dolehne na pumpu za zhruba 2–4 týdny, zlevnění o něco déle, protože nikdo nechce mít ztrátu na už nakoupených zásobách.

V praxi to znamená, že pokud ropa zlevní dramaticky v první polovině dubna, plný dopad uvidíte na pumpách nejdříve koncem dubna nebo v květnu.

### Co přesně Trumpova cla způsobila?

Mechanismus je nepřímý. USA přímo neovlivňují českou čerpačku — ty jsou zásobovány z evropských rafinérií, především z Polska, Německa, Slovenska a z domácí rafinérie Litvínov (Orlen). Ale světový trh s ropou je propojený nádoba: pokud investoři čekají globální zpomalení ekonomiky kvůli obchodní válce, prodávají ropné futures a cena klesá globálně — včetně ropy Brent, podle které se cenotvorba v Evropě řídí.

Přidejte k tomu OPEC+, který v dubnu překvapivě zvýšil těžbu místo snížení — zřejmě jako reakce na americký tlak na Saúdskou Arábii — a máte recept na propad ceny suroviny.

### Kurz koruny: skrytý faktor

Je tu ale háček, na který se zapomíná. Ropa se obchoduje v amerických dolarech. Pokud česká koruna oslabí vůči dolaru, zdražení importu může efekt zlevnění ropy kompletně vynulovat.

V období celní nejistoty investoři přesouvají kapitál do bezpečných měn — dolar, frank — a z měn menších zemí včetně koruny. V prvních dvou týdnech dubna oslabila koruna o zhruba 2–3 %. Při ceně ropy 60 USD/barel a 2% oslabení koruny jde efekt zlevnění přibližně o třetinu dolů.

Čistý výsledek: ropa je v dolarech historicky levná, ale v korunách o tolik levná není.

### Maximální přípustné ceny — pojistka státu

Jeden detail, který mnoho řidičů nezná: Ministerstvo financí ČR má ze zákona pravomoc stanovit maximální přípustné maloobchodní ceny pohonných hmot. Aktuálně platí:

- **Natural 95:** max. 42,79 Kč/l s DPH
- **Nafta:** max. 44,15 Kč/l s DPH

Tyto limity platí pro všechny čerpací stanice v ČR bez výjimky. V praxi jsou aktuální průměrné ceny pod těmito stropy — ale v případě krize nebo spekulativního zdražování má stát nástroj, jak trh zkrotit.

### Scénáře do konce roku 2026

**Optimistický:** Celní válka se uklidní dohodou, ropa stabilizuje kolem 65–70 USD/barel, koruna zpevní. Benzín v ČR by mohl klesnout na 38–39 Kč/l.

**Základní:** Cla zůstanou v platnosti, ropa osciluje 58–65 USD. Benzín se pohybuje kolem 39–41 Kč/l — mírné zlevnění oproti únoru, ale bez dramatického pohybu.

**Pesimistický:** Eskalace obchodního konfliktu, globální zpomalení, ale zároveň oslabení koruny a případný výpadek dodávek. Benzín může paradoxně zdražit i při levné ropě.

### Co to znamená pro vás prakticky?

Celní válka a propad ropy jsou příležitost, ne jistota. Pár tipů:

Sledujte vývoj kurzu CZK/USD — pokud koruna zpevňuje, dopad levné ropy se plněji přenese na pumpu. Pokud oslabuje, vyčkejte.

Zbytečně neplňte nádrž na zásobu — při klesajících cenách to nedává smysl. Tankujte průběžně a využívejte BenzinMapa.cz pro výběr nejlevnější stanice v okolí.

Velké sítě jako Shell nebo OMV reagují na zlevnění ropy pomaleji než nezávislé stanice — důvod je prostý, mají vyšší pevné náklady a marži. Pokud chcete těžit ze zlevnění rychleji, hledejte nezávislé provozovatele nebo supermarketové pumpy.

### Závěr

Trumpova cla způsobila reálný propad cen ropy. Na českou pumpu to dorazí — s odstupem týdnů a s korekcí o kurz koruny. Dramatické zlevnění o 5–6 Kč/l nečekejte. Reálné zlevnění o 1–2 Kč/l oproti vrcholu z první čtvrtiny roku je ale pravděpodobné, pokud obchodní napětí neeskaluje dál.
    `,
    faqs: [
      { q: 'Proč ropa klesá, ale na pumpě to moc necítím?', a: 'Rafinérie a distributoři mají zásoby nakoupeny za starší ceny. Propad ceny ropy se do maloobchodní ceny promítá se zpožděním 2–4 týdnů. Navíc oslabení koruny vůči dolaru část efektu smaže.' },
      { q: 'Mají Trumpova cla přímý vliv na ČR?', a: 'Nepřímý. ČR tankuje z evropských rafinérií, ne přímo z USA. Ale světová cena ropy Brent klesá kvůli obavám z globální recese — a ta ovlivňuje velkoobchodní ceny i v Evropě.' },
      { q: 'Co jsou maximální přípustné ceny pohonných hmot?', a: 'Stát má zákonnou pravomoc stanovit cenový strop pro maloobchodní prodej paliv. Aktuálně: Natural 95 max. 42,79 Kč/l, nafta max. 44,15 Kč/l. Čerpačka, která by prodávala draho, porušuje zákon.' },
      { q: 'Kdy bude benzín nejlevnější?', a: 'Historicky bývá nejlevnější na přelomu října a listopadu — nízká sezónní poptávka, přechod na zimní specifikaci. Pokud celní napětí ustoupí, může letos toto okno být výraznější než obvykle.' },
    ],
  },

  'tankovat-v-polsku-nebo-slovensku-2026': {
    title: 'Tankovat v Polsku nebo na Slovensku? Počítáme, kdy se to vyplatí',
    excerpt: 'Benzín za hranicí bývá levnější o 3–6 Kč. Ale vyplatí se zajet? Počítáme reálnou úsporu i se spotřebou na odbočku.',
    date: '2026-04-24',
    readTime: '6 min',
    tag: 'Analýza',
    content: `
## Přeshraniční tankování – fenomén, který roste

V pohraničních oblastech je to běžná praxe: Češi z Ostravy tankují na Slovensku nebo v Polsku, řidiči z Liberce jezdí do Německa. Ale co ti, kdo k hranici nemají cestu zadarmo?

### Aktuální srovnání cen (duben 2026)

| Země | Natural 95 | Nafta |
|------|-----------|-------|
| ČR | ~40,50 Kč/l | ~42,20 Kč/l |
| Polsko | ~36,80 Kč/l | ~38,40 Kč/l |
| Slovensko | ~37,90 Kč/l | ~39,60 Kč/l |
| Německo | ~41,20 Kč/l | ~43,80 Kč/l |

(Přepočteno přibližným kurzem PLN/EUR k 4. 2026, pro orientaci)

### Kdy se přejezd vyplatí?

Polsko je nejzajímavější destinace: benzín je zhruba o 3,70 Kč/l levnější. Při plné 60litrové nádrži ušetříte přibližně **220 Kč**.

Ale musíte ještě připočíst cestu: každých 10 km navíc vás při spotřebě 7 l/100 km a ceně 40 Kč/l stojí **28 Kč tam a zpátky**.

**Zlomový bod pro Polsko: 8 km od hranice** — pokud bydlíte nebo jedete do 8 km od polské pumpy, vyplatí se zajet.

### Situace v pohraničních regionech

**Ostrava a okolí:** Polská Jastřębí hora nebo Cieszyn jsou dosažitelné za 20–30 minut. Místní řidiči polský benzín tankují pravidelně.

**Liberec:** Zittau (Německo) je blízko, ale německý benzín je dražší. Hrádek nad Nisou a okolí – polské pumpy v Bogatynii jsou zajímavější.

**Plzeň a západ:** Německo je blíž, ale ceny jsou tam vyšší než v ČR.

### Platba kartou v zahraničí

Většina zahraničních pumep přijímá české platební karty bez problémů. Pozor na:
- **Kreditní karty** s poplatkem za zahraniční transakce (0,5–1,5 %)
- **Blokaci na kartě** – zahraniční pumpy někdy blokují 50–100 EUR při platbě předem
- **Kurz v den tankování** – cena se může lišit od předpokládané o 2–5 %

### Závěr

Pro pendlery a lidi v pohraničí: rozhodně ano. Pro cestu z Prahy speciálně na Polsko: ne, nevrátí se to. Pokud ale jedete k hranici za jiným účelem, je odbočka k polské pumpě téměř vždy výhodná.
    `,
    faqs: [
      { q: 'Musím při tankování v zahraničí hlásit něco na celnici?', a: 'Ne. V rámci EU (Polsko, Slovensko, Německo, Rakousko) jsou přeshraniční pohyby bez celního hlášení. Palivo v nádrži auta nepodléhá žádné kontrole.' },
      { q: 'Je polský benzín stejně kvalitní jako český?', a: 'Ano. Polsko i ČR jsou v EU a musí splňovat stejnou normu EN 228 pro benzín a EN 590 pro naftu. Kvalita je právně povinně srovnatelná.' },
      { q: 'Kde najdu aktuální ceny v zahraničí?', a: 'Pro Polsko: e-petrol.pl nebo fuelo.eu. Pro Slovensko: najlacnejsi.sk nebo benzinmapa.sk. Kurzy pak najdete na Google nebo XE.com.' },
    ],
  },

  'proc-je-nafta-drazsi-nez-benzin-2026': {
    title: 'Proč je nafta dražší než benzín? Odpověď pro rok 2026',
    excerpt: 'Ještě před pár lety byla nafta vždy levnější. Dnes to neplatí. Vysvětlujeme, proč se poměr obrátil.',
    date: '2026-04-23',
    readTime: '5 min',
    tag: 'Vysvětlení',
    content: `
## Historicky bylo pravidlo jasné: nafta je levnější

Do roku 2021 platila jedna z nejznámějších pouček pro českou dopravu: nafta stojí méně než benzín, kup diesel. Motoristé s velkým nájezdem si pořizovali naftová auta a počítali na papíře, za jak dlouho se jim vrátí příplatek za diesel agregát.

Pak přišel zlom.

### Proč se poměr obrátil?

#### 1. Energetická krize 2022 a strukturální změna poptávky

Po ruské invazi na Ukrajinu začaly evropské státy přecházet z ruského plynu na jiná paliva. Nahradily ho mimo jiné topným olejem, který se vyrábí ze stejné ropné frakce jako nafta. Rafinérie nestihly přizpůsobit kapacity — poptávka po naftové frakci explodovala, zatímco benzínu byl dočasně přebytek.

#### 2. Vyšší spotřební daň na naftu

V ČR platí od roku 2024 vyšší spotřební daň na naftu jako součást ekologické daňové reformy (snaha odrazit od dieselů kvůli emisím pevných částic). Zatímco u benzínu daň zůstala stejná, u nafty vzrostla o přibližně 1,50 Kč/l.

#### 3. Zpřísněná regulace emisí dieselových vozidel

Zaváděné emisní normy Euro 7 a diskuze o zákazu spalovacích motorů snižují poptávku po nových dieselových autech. Rafinérie to ale nereflektují okamžitě — navíc globální lodní a nákladní doprava jede na naftu a její poptávka zůstává vysoká.

### Co to znamená pro řidiče?

Pro majitele dieselového auta: kalkulace se změnila. Rozdíl v ceně paliva se zmenšil nebo zmizel, výhoda dieselu spočívá teď hlavně v nižší spotřebě (l/100 km), ne ceně za litr.

Benzín dnes vychází jako ekonomičtější volba pro řidiče s menším nájezdem.

### Vývoj v číslech

| Rok | Natural 95 | Nafta | Rozdíl |
|-----|-----------|-------|--------|
| 2019 | 32,10 Kč | 29,80 Kč | nafta -2,30 Kč |
| 2021 | 35,40 Kč | 33,10 Kč | nafta -2,30 Kč |
| 2023 | 38,20 Kč | 39,80 Kč | nafta +1,60 Kč |
| 2026 | 40,50 Kč | 42,20 Kč | nafta +1,70 Kč |

Zdroj: průměrné ceny ČSÚ a BenzinMapa.cz
    `,
    faqs: [
      { q: 'Vrátí se nafta zpět pod cenu benzínu?', a: 'Těžko říct. Strukturální faktory (vyšší daň, ekologické normy) ukazují spíše na trvalý posun. Krátkodobé výkyvy jsou možné při výrazných změnách ceny ropy.' },
      { q: 'Má smysl koupit dnes naftové auto?', a: 'Záleží na nájezdu. Diesel spotřebuje stále méně litrů na 100 km, takže při nájezdu nad 25 000 km/rok může být celkově stále výhodnější, i když cena za litr je vyšší.' },
    ],
  },

  'vernostni-karty-cerpackich-stanic-srovnani': {
    title: 'Věrnostní karty čerpacích stanic: Benzina, MOL, Shell — která se skutečně vyplatí?',
    excerpt: 'Testujeme bonusové programy tří největších sítí. Kolik musíte natankovat, abyste se dostali k reálné slevě?',
    date: '2026-04-21',
    readTime: '7 min',
    tag: 'Test',
    content: `
## Věrnostní program nebo marketingový trik?

Každá velká čerpací stanice má věrnostní kartu. Benzina nabídne Kartu Výhod, MOL zve do MOL Clubu, Shell láká ClubSmart kartou. Všechny slibují úspory, bonusy, slevy. Ale kolik to reálně dělá?

Prošli jsme podmínky, spočítali, co dostanete za rok průměrného tankování a výsledky překvapí.

### Karta Benzina ORLEN (Benzina Karta)

**Jak funguje:** Za každý litr dostanete body. 1 litr = 1 bod. 1 000 bodů = sleva 20 Kč na příští tankování.

**Reálná sleva:** 2 % z ceny paliva.

**Podmínky:** Karta zdarma, registrace online. Platnost bodů 12 měsíců.

**Při nájezdu 20 000 km (spotřeba 7 l/100 km = 1 400 l/rok):**
- Načerpáte 1 400 bodů = 28 Kč slevy. Ročně.

*Hmm. 28 Kč za rok při útrátě přes 56 000 Kč za palivo. To je 0,05 %.*

### MOL Club

**Jak funguje:** Cashback systém. Za každých 100 Kč utracených na MOL tankujete bod. Za 500 bodů dostanete voucher 50 Kč.

**Reálná sleva:** Přibližně 0,9 % z celkové útraty.

**Příplatek MOL vs. průměr ČR:** MOL je typicky o 0,10–0,30 Kč/l nad průměrem ČR.

**Reálná matematika:** Ušetříte 0,9 % na bonusech, ale zaplatíte ~0,5 % více za samotné palivo oproti průměru. Čistá výhoda: asi 0,4 %.

### Shell ClubSmart

**Jak funguje:** Body za tankování + nákupy na stanici. Možnost čerpat slevy na benzín nebo přeměnit na Nectar body.

**Reálná sleva na palivu:** Přibližně 1,5–2 % při aktivním využívání.

**Shell vs. průměr ČR:** Shell je jednou z nejdražších sítí, typicky +1,20 až +2 Kč/l nad průměrem.

**Matematika:** I kdybychom brali 2% výhodu, Shell je stále o 2–3 % dražší než průměrná stanice.

### Srovnání: věrnostní karta vs. správný výběr stanice

| Přístup | Roční úspora (1 400 l) |
|---------|------------------------|
| Benzina Karta věrnostní body | 28 Kč |
| MOL Club (čistá výhoda) | 240 Kč |
| Shell ClubSmart | 280 Kč |
| Tankování v průměrné ČR stanici místo Shell | 1 680 Kč |
| Tankování v nejlevnějších stanicích (-3 Kč/l) | 4 200 Kč |

**Výsledek je jednoznačný:** Věrnostní karta vám ušetří stovky korun. Chytrý výběr stanice ušetří tisíce.

### Kdy věrnostní kartu brát?

Má smysl ji mít, ale ne kvůli úspoře na palivu. Výhoda je v dalších slevách: mycí linka, obchod na stanici, partnerské slevy na hotely nebo parkoviště. Pokud tyto služby využíváte, karta má smysl.

Jako hlavní strategie úspory za palivo ji ale nepovažujte.
    `,
    faqs: [
      { q: 'Dá se kombinovat věrnostní karta s akcí na palivo?', a: 'Záleží na konkrétní kartě a akci. Benzina ORLEN akce na palivo s Kartou Výhod obvykle kombinovat nelze – platí vždy jen jedna sleva. MOL Club kombinaci v některých případech umožňuje.' },
      { q: 'Jsou věrnostní karty zdarma?', a: 'Ano, všechny tři zmíněné karty jsou zdarma. Stačí online registrace nebo vyplnění formuláře na stanici.' },
      { q: 'Jaká je nejjednodušší strategie, jak ušetřit za benzín?', a: 'Používejte BenzinMapa.cz k nalezení nejlevnější stanice ve svém okolí nebo na plánované trase. Rozdíl mezi nejlevnější a nejdražší stanicí ve stejném městě bývá 2–5 Kč/l, což věrnostní karty nepřekonají.' },
    ],
  },

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

Nejjednodušší způsob je sledovat BenzinMapa.cz, kde 3× denně aktualizujeme ceny z více než 2 400 čerpacích stanic v celé ČR.
    `,
    faqs: [
      { q: 'Proč benzín zdražuje každé léto?', a: 'Letní sezóna znamená vyšší poptávku po pohonných hmotách – turistická sezona zvyšuje spotřebu. Zároveň přechod na letní benzínovou specifikaci zvyšuje výrobní náklady.' },
      { q: 'Kdy bude benzín opět levnější?', a: 'Ceny pohonných hmot závisí na globálních faktorech. Sledujte trendy na naší stránce – zobrazujeme 7denní trend vývoje cen.' },
    ],
  },

  'co-ovlivnuje-ceny-pohonnych-hmot': {
    title: 'Co ovlivňuje ceny pohonných hmot v ČR? Kompletní průvodce',
    excerpt: 'Od ceny ropy přes rafinérie, daně, distribuci až po marže čerpacích stanic.',
    date: '2026-04-22',
    readTime: '8 min',
    tag: 'Průvodce',
    content: `
## Cesta ropy od vrtu k pumpě

Cena benzínu nebo nafty, kterou zaplatíte na čerpací stanici, vzniká jako součet mnoha faktorů. Pojďme je rozebrat krok za krokem.

### 1. Světová cena ropy (40–50 % konečné ceny)

Základem je ropa – konkrétně ropa Brent, která je referenční cenou pro Evropu. Každé zdražení ropy o 10 USD/barel se přibližně za 2–4 týdny promítne do ceny benzínu zdražením o 1,5–2,5 Kč/l.

### 2. Spotřební daň – největší fixní složka

Spotřební daň v ČR je pevně daná zákonem:
- **Natural 95 a 98:** 12 843 Kč za 1 000 litrů = **12,84 Kč za litr**
- **Nafta:** 10 950 Kč za 1 000 litrů = **10,95 Kč za litr**

### 3. DPH (21 %)

DPH se počítá z celé ceny včetně spotřební daně.

### 4. Marže čerpací stanice (5–15 %)

Marže se výrazně liší podle sítě:
- Velké sítě (Shell, OMV): **3–6 Kč/l**
- Středně velké (Benzina, MOL): **2–4 Kč/l**
- Nezávislé a supermarketové: **1–2,5 Kč/l**

### 5. Kurz CZK/USD

Protože ropa se obchoduje v dolarech, oslabení koruny zdražuje dovoz. Pokud koruna oslabí o 1 Kč/USD, cena benzínu roste přibližně o 0,5 Kč/l.
    `,
    faqs: [
      { q: 'Proč zdražil benzín přes noc?', a: 'Ceny pohonných hmot mohou reagovat rychle na pohyb ropy na světových trzích, výkyvy kurzu dolaru nebo regionální výpadky dodávek.' },
      { q: 'Kdy se zdražení ropy projeví na pumpě?', a: 'Zpravidla za 2–4 týdny. Rafinérie a distributoři mají zásoby nakoupené za starší ceny.' },
      { q: 'Může stát ovlivnit ceny pohonných hmot?', a: 'Stát může dočasně snížit spotřební daň nebo DPH. V ČR k tomu zatím nedošlo, ale v době energetické krize 2022 to udělalo Německo či Francie.' },
    ],
  },

  'rozdil-natural-95-vs-98': {
    title: 'Natural 95 vs. Natural 98: Jaký je skutečný rozdíl?',
    excerpt: 'Stojí za příplatek 3–4 Kč/l Natural 98?',
    date: '2026-04-18',
    readTime: '5 min',
    tag: 'Průvodce',
    content: `
## Co je oktanové číslo?

Oktanové číslo vyjadřuje odolnost paliva proti samovznícení. Natural 95 má minimální oktanové číslo 95 RON, Natural 98 má 98 RON.

### Kdy se Natural 98 vyplatí?

Motory s doporučením 98 RON od výrobců jako BMW, Mercedes, Porsche, Audi: pokud tankujete 95, řídící jednotka zpozdí zapalování — méně výkonu, vyšší spotřeba.

### Ekonomická kalkulace

| Parametr | Natural 95 | Natural 98 |
|---|---|---|
| Cena (duben 2026) | ~40,50 Kč/l | ~43,50 Kč/l |
| Příplatek | – | +3 Kč/l |
| Roční náklady navíc (20 000 km, 7 l/100km) | – | +4 200 Kč |

### Závěr

- **Máte turbo motor od prémiové značky?** Tankujte 98, jak doporučuje výrobce.
- **Máte běžný atmosférický motor?** Natural 95 stačí.
- **Nevíte?** Podívejte se do technického průkazu.
    `,
    faqs: [
      { q: 'Zničím motor tankem Natural 95 místo 98?', a: 'Ne. Moderní motory mají řídící jednotku, která automaticky upraví zapalování. Výsledkem je nižší výkon a vyšší spotřeba, nikoli okamžité poškození.' },
      { q: 'Mohu mixovat Natural 95 a 98?', a: 'Ano, bez problémů. Výsledné oktanové číslo bude přibližně průměr obou paliv.' },
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
Věrnostní karty dávají malé slevy na palivo, ale hlavní výhody jsou v dalších službách — mycí linka, obchod.

### 5. Tankujte ráno nebo večer
Palivo je hustší při nižší teplotě – dostanete mírně více energie za stejnou cenu.

### 6. Správný tlak v pneumatikách
Podhuštěné pneumatiky zvyšují spotřebu až o 3 %.

### 7. Srovnejte supermarketové čerpačky
Hypermarkety (Kaufland, Lidl) mívají ceny pod průměrem trhu.

### 8. Využijte nezávislé provozovatele
Eurobit, Robin Oil a podobné regionální sítě jsou obvykle levnější než velké značky.

### 9. Plánujte trasy chytře
Kratší trasa = méně paliva. Google Maps nebo Waze pomáhají optimalizovat cestu.

### 10. Klimatizace s rozumem
AC zvyšuje spotřebu o 0,5–1,5 l/100 km. Větrejte okny při pomalé jízdě ve městě.
    `,
    faqs: [
      { q: 'Kolik lze ušetřit výběrem levnější čerpačky?', a: 'Při nádrži 50 litrů a rozdílu 3 Kč/l ušetříte 150 Kč. Za rok při tankování 2× měsíčně to dělá 3 600 Kč.' },
      { q: 'Vyplatí se jezdit přes město pro levnější benzín?', a: 'Pouze pokud úspora překryje náklady na delší cestu. Hledejte levnější čerpačku na trase, ne mimo ni.' },
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
- **Nafta:** ~42,20 Kč/l
- **LPG:** ~19,50 Kč/l
- Rozdíl: nafta je cca 116 % dražší

### Spotřeba a dojezd

LPG auto spotřebuje přibližně o 20–25 % více paliva než benzínový ekvivalent.

| Parametr | Nafta (1.6 TDI) | LPG (1.4 TSI + LPG) |
|----------|-----------------|----------------------|
| Spotřeba | 5,5 l/100 km | 9,5 l/100 km |
| Cena/100 km | 23,2 Kč | 18,5 Kč |
| Roční náklady (20 000 km) | 4 640 Kč | 3 700 Kč |

### Závěr
LPG je ekonomicky výhodné při vysokém ročním nájezdu. Přestavba stojí 30 000–50 000 Kč a návratnost je přibližně 3–5 let při nájezdu 20 000 km/rok.
    `,
    faqs: [
      { q: 'Je LPG vhodné pro dálkové cestování?', a: 'Síť LPG stanic v ČR je hustá, ale na dálnicích je menší výběr. Doporučujeme plánovat zastávky předem.' },
      { q: 'Mohu jet do garáže s LPG autem?', a: 'Do podzemních garáží je vjezd s LPG autem zakázán nebo omezený. Zkontrolujte pravidla konkrétní garáže.' },
    ],
  },

  'nejlevnejsi-cerpaci-stanice-cr-2026': {
    title: 'Nejlevnější čerpací stanice v ČR 2026 – velký přehled',
    excerpt: 'Které značky čerpacích stanic mají dlouhodobě nejnižší ceny?',
    date: '2026-04-05',
    readTime: '8 min',
    tag: 'Přehled',
    content: `
## Které sítě čerpacích stanic jsou nejlevnější?

### 1. Nezávislí provozovatelé (nejlevnější)
**Eurobit, Robin Oil, Terno, Tank-ONO** – regionální sítě bez nákladů na branding. Ceny bývají o 1–4 Kč/l nižší.

### 2. Supermarketové čerpačky
**Kaufland, Lidl, Albert** – retailové řetězce dotují ceny paliv, aby přilákaly zákazníky do obchodů.

### 3. MOL
Česká republika je domovský trh MOL – investují do cen.

### 4. Benzina ORLEN
Po převzetí polskou ORLEN skupinou ceny stabilizovány. Věrnostní program s bonusy.

### 5. Shell a OMV (nejdražší)
Prémiové značky s prémiovou cenou.

### Doporučení
Pro každodenní tankování: nezávislí provozovatelé nebo supermarkety.
Pro dálkové cestování: MOL nebo Benzina ORLEN (hustá síť u dálnic).
    `,
    faqs: [
      { q: 'Je levnější benzín stejně kvalitní?', a: 'Ano. Všechna paliva prodávaná v ČR musí splňovat normu EN 228 (benzín) nebo EN 590 (nafta). Kvalita je povinně stejná bez ohledu na cenu.' },
      { q: 'Proč jsou Shell a OMV dražší?', a: 'Prémiové značky platí za globální marketing, prémiové pozice u dálnic a rozšířené služby na stanicích.' },
    ],
  },

  'dalnicni-vs-mestska-cerpacka': {
    title: 'Dálniční vs. městská čerpačka: Kde je benzín opravdu levnější?',
    excerpt: 'Dálniční pumpy jsou proslulé vyššími cenami. Kolik ale skutečně přeplatíte?',
    date: '2026-04-08',
    readTime: '4 min',
    tag: 'Analýza',
    content: `
## Mýtus vs. realita: dálniční přirážka

| Typ stanice | Průměr Natural 95 | Přirážka |
|---|---|---|
| Nejlevnější v ČR (nezávislé) | -1,50 Kč pod průměrem | – |
| Průměr ČR | 0 Kč | – |
| Shell/OMV u dálnice | +1,50–2,50 Kč nad průměrem | +1,50–2,50 Kč |

Pro 60l nádrž to znamená přeplatek **90–150 Kč** oproti průměrné stanici ve městě.

## Kdy tankovat u dálnice

### Rozumná volba:
- Máte méně než čtvrtinu nádrže
- Jedete na dlouhé trase s časovým tlakem
- Noc nebo neznámá oblast

### Kdy odbočit do města:
- Znáte trasu a máte čas
- Velká nádrž (SUV, dodávka) – úspora 200–400 Kč

## Tip

Na BenzinMapa.cz vidíte ceny všech stanic podél trasy. Naplánujte si zastávku předem.
    `,
    faqs: [
      { q: 'Jsou dálniční čerpačky povinny mít vyšší ceny?', a: 'Ne, ceny nejsou regulovány. Vyšší ceny jsou výsledkem vyššího nájemného za prémiovou polohu.' },
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
- Natural 95: ~40,50 Kč/l
- Nafta: ~42,20 Kč/l
- Rozdíl: nafta je dražší o ~1,70 Kč/l

### Kdy se diesel vyplatí?
Diesel se tradičně vyplatí při:
- Ročním nájezdu nad 25 000 km
- Převaze dálničních tras
- Potřebě vyššího výkonu (tažení přívěsů)

### Kalkulace (20 000 km/rok)
| | Benzín 1.5 TSI | Nafta 2.0 TDI |
|---|---|---|
| Spotřeba | 6,5 l/100 km | 5,0 l/100 km |
| Cena/litr | 40,50 Kč | 42,20 Kč |
| Roční náklady | 5 265 Kč | 4 220 Kč |
| Úspora s naftou | | 1 045 Kč/rok |

Při rozdílu v pořizovací ceně 40 000 Kč vychází návratnost dieselu přibližně 38 let. Benzín je v dnešní době zpravidla ekonomičtějším výběrem pro běžné řidiče.
    `,
    faqs: [
      { q: 'Je nafta nebo benzín lepší pro životní prostředí?', a: 'Nafta emituje více NO2 a pevných částic, benzín více CO2. Z ekologického pohledu záleží na konkrétním motoru a normě Euro.' },
      { q: 'Bude diesel zakázán?', a: 'EU plánuje zákaz prodeje nových spalovacích motorů od roku 2035. Do té doby jsou naftová auta plně legální.' },
    ],
  },

  'kdy-je-benzin-nejlevnejsi-rano-vecer': {
    title: 'Kdy tankovat: Ráno nebo večer? Kdy je benzín v ČR nejlevnější',
    excerpt: 'Tankujete ve špatný čas? Průzkumy ukázají, že volba času tankování může ovlivnit cenu až o 2–3 Kč/litr. Prozradíme, kdy tankovat a proč na tom záleží.',
    date: '2026-04-03',
    readTime: '5 min',
    tag: 'Tipy',
    content: `
## Záleží vůbec na čase tankování?

Krátká odpověď: ano, záleží. Ale ne tak, jak si možná myslíte.

V Česku nejde o to, zda jdete tankovat ve 3 ráno nebo v 10 večer. Jde o to, **kdy čerpací stanice aktualizují ceny** a jak reagují na pohyb velkoobchodních cen pohonných hmot na pražské komoditní burze.

### Velkoobchodní ceny se mění přes noc

Čerpací stanice dostávají nové ceníky od distributorů typicky v nočních hodinách, zpravidla kolem půlnoci. Pokud velkoobchodní cena přes noc klesla, řetězce jako MOL, OMV nebo Shell aktualizují cenovníky ráno po otevření. Pokud cena vzrostla, čerpací stanice je v pořádku zadržet zdražení o den nebo dva.

Výsledek: **Při klesajícím trendu cen ropy bývá palivo ráno levnější** než večer předchozího dne. Při rostoucím trendu se stanice spěchají zdražit ihned ráno.

### Pravidlo středy a čtvrtka

V anglosaských zemích (USA, Velká Británie) analytici opakovaně potvrzují, že ceny benzínu jsou nejnižší v úterý a středu, a nejvyšší v pátek a o víkendu. V ČR existuje podobný efekt:

- **Pondělí–středa**: velkoobchodní zásoby se doplňují po víkendu, ceny jsou spíše stabilní nebo klesající
- **Čtvrtek–sobota**: před víkendem poptávka stoupá (dovolené, výlety), ceny mají tendenci mírně vzrůst
- **Neděle**: nejnižší obrat, ale stanice s nízkým provozem méně upravují ceny

Rozdíl mezi nejlevnějším a nejdražším dnem v týdnu je v ČR typicky **0,20–0,80 Kč/litr** — ne dramatický, ale při 50litrové nádrži to dělá 10–40 Kč.

### Ráno vs. večer — v čem je rozdíl

Existuje fyzikální argument pro tankování ráno:

Palivo je kapalina a kapaliny se rozpínají s teplotou. Ráno je palivo v podzemních nádobách chladnější a hustší — dostanete **fyzicky více energie** za stejný objem než v poledním vedru. Rozdíl je asi **0,5–1 %** hustoty, což odpovídá zhruba 0,20 Kč/litr „skrytou úsporou".

V praxi je tento efekt malý a podzemní zásobníky mají stabilnější teplotu než povrch. Při teplém létě a horkém asfaltu ale může jít v polední hodiny o trochu více.

### Co skutečně šetří — výběr čerpačky

Pravdou je, že **výběr správné čerpačky ušetří 50× víc než výběr správné hodiny**. Rozdíl mezi nejlevnější a nejdražší stanicí ve stejném městě je 3–6 Kč/litr. Výběr dne týdne nebo denní hodiny vám ušetří nejvýše 0,80 Kč/litr.

Konkrétně:
- Supermarketové čerpačky (Kaufland, Lidl) a nezávislé sítě (Eurobit, Robin Oil) bývají o 1,5–3 Kč/litr levnější než Shell nebo OMV ve stejném okamžiku
- Na BenzinMapa.cz najdete nejlevnější čerpačky ve vašem okolí aktualizované každých 6 hodin

### Praktická doporučení

**Tankujte dopoledne v první polovině týdne.** Ráno při klesajícím trendu je cena nejčerstvěji aktualizovaná. Pondělí–středa má statisticky nižší ceny než pátek a sobota.

**Při silném zdražování ropy naopak tankujte brzy.** Pokud cena ropy prudce roste (Brexit, válka, embargo), čerpací stanice zdraží jakmile mohou. Tankování před „vlnou" zdražení vám může ušetřit 1–2 Kč/litr.

**Nenechte nádrž klesnout pod čtvrtinu.** Řidiči s prázdnou nádrží tankují u nejbližší stanice bez ohledu na cenu — přesně na to big-box sítě u dálnic sázejí. Udržujte nádrž nad třetinou.

**Sledujte vývoj cen.** Na stránce vývoj cen pohonných hmot uvidíte, zda je aktuální trend klesající nebo rostoucí — to je nejlepší signál pro načasování tankování.

### Závěr

Nejlevnější palivo ráno vs. večer — rozdíl je reálný, ale malý (do 1 Kč/litr). Výběr stanice a dne v týdnu vás ušetří víc. Největší úspora je vždy správná čerpačka ve správné lokalitě, ne správná hodina.
    `,
    faqs: [
      { q: 'Je benzín ráno skutečně levnější než večer?', a: 'Fyzikálně ano — palivo je ráno chladnější a hustší, dostanete nepatrně více energie. Rozdíl je asi 0,2 Kč/litr. Cenovník čerpačky bývá ráno čerstvě aktualizovaný — při klesajícím trendu ropy může být levnější než večer předchozího dne.' },
      { q: 'Kdy v týdnu je benzín nejlevnější?', a: 'Statisticky v pondělí až středu. Před víkendem (čtvrtek–sobota) poptávka stoupá a ceny mírně rostou. Rozdíl je v ČR typicky 0,20–0,80 Kč/litr mezi nejlevnějším a nejdražším dnem.' },
      { q: 'Vyplatí se tankovat přes noc nebo brzy ráno?', a: 'Při klesajících cenách ropy ano — čerpačky přijímají nové ceníky přes noc, ráno tak mohou mít aktualizovanou (nižší) cenu. Při rostoucích cenách ropy naopak tankujte co nejdřív.' },
      { q: 'Jak moc ušetřím výběrem správné denní hodiny?', a: 'Typicky 0,2–0,8 Kč/litr. Výběrem správné čerpačky ale ušetříte 2–5 Kč/litr — tedy 5–10× víc. Zaměřte se primárně na výběr stanice, ne hodiny.' },
    ],
  },

  'emisni-povolenky-ets2-zdrazeni-benzin-nafta': {
    title: 'ETS2 emisní povolenky: O kolik zdraží benzín a nafta v ČR od 2027?',
    excerpt: 'Od roku 2027 (pravděpodobně 2028) vstoupí v platnost ETS2 — nový evropský systém emisních povolenek pro dopravu. Benzín a nafta mohou zdražit o 3–5 Kč/litr. Co to je a jak se připravit.',
    date: '2026-04-12',
    readTime: '7 min',
    tag: 'Analýza',
    content: `
## Co je ETS2 a proč ho řidiči musí znát

Evropská unie připravuje rozšíření systému emisních povolenek (EU ETS) na silniční dopravu a vytápění budov. Nový systém se označuje **ETS2** a původně měl vstoupit v platnost od roku 2027. Po politickém jednání byl odložen na **rok 2028**.

Pro řidiče v ČR to konkrétně znamená: každý litr benzínu nebo nafty bude zatížen cenou za emitované CO₂. Tuto cenu nezaplatíte přímo — zahrne se do ceny paliva na pumpě.

### Jak ETS2 funguje

Systém ETS2 nebude řídit stát, ale trh. Funguje takto:

1. Distributoři pohonných hmot (Čepro, Shell, OMV atd.) budou muset nakupovat **povolenky** za každou tunu CO₂, které jejich paliva při spalování uvolní
2. Celkový počet povolenek je pevně omezený a rok od roku klesá
3. Cena povolenky se určuje na burze — závisí na poptávce a nabídce
4. Distributoři zdražení přenesou na čerpačky → čerpačky na zákazníky

### O kolik zdraží benzín a nafta?

Klíčová proměnná je cena povolenky. Analytici odhadují různé scénáře:

| Cena ETS2 povolenky | Zdražení benzínu | Zdražení nafty |
|---|---|---|
| 30 EUR/t CO₂ | +2,1 Kč/litr | +2,3 Kč/litr |
| 45 EUR/t CO₂ | +3,2 Kč/litr | +3,5 Kč/litr |
| 80 EUR/t CO₂ | +5,7 Kč/litr | +6,2 Kč/litr |

Evropská komise odhaduje, že v prvních letech bude cena kolem 45 EUR/t CO₂. To by znamenalo zdražení o přibližně **3–3,5 Kč/litr**.

Někteří analytici varují, že pokud poptávka po povolenkách překročí očekávání, cena může být výrazně vyšší — podobně jako se ETS1 (pro průmysl) od svého spuštění zdesetinásobil.

### Proč EU ETS2 zavádí

EU potřebuje snížit emise CO₂ z dopravy — sektor v posledních 20 letech emise nesnížil, zatímco průmysl ano. Cenový signal (dražší fosilní palivo) má motivovat přechod na elektromobily, veřejnou dopravu a efektivnější vozy.

Kritici namítají, že zdražení pohonných hmot dopadne nerovnoměrně — lidé mimo města s horší dostupností MHD nemají alternativu a budou platit více bez možnosti změny chování.

### Kdy přesně to začne platit

Původní datum bylo 1. ledna 2027. V listopadu 2025 se EU politicky shodla na odložení o rok — **1. ledna 2028**. Existuje záchranná klauzule: pokud by cena elektřiny nebo paliv v EU prudce vzrostla, vstup ETS2 lze odložit na 2029.

### Sociální klimatický fond — kompenzace pro domácnosti

EU zřídila Sociální klimatický fond (SCF), který má vybraté peníze z ETS2 redistribuovat domácnostem s nízkými příjmy. ČR by z fondu do roku 2032 měla obdržet přibližně **50 miliard korun** na kompenzace.

Jak přesně budou kompenzace v ČR vyplaceny (přímé transfery, snížení daní, investice do tepelných čerpadel), zatím není rozhodnuto.

### Jak se připravit jako řidič

**Kupujte úspornější auto.** Každý litr méně = méně zdražení pocítíte. Auto se spotřebou 5 l/100 km bude po zavedení ETS2 levnější v provozu než auto s 9 l/100 km podstatně více než dnes.

**Zvažte LPG nebo elektromobil.** LPG nebude pod ETS2 přímo (závislost na ceně ropy zůstane), elektromobily jsou mimo systém úplně.

**Sledujte vývoj.** Cena ETS2 povolenky se bude tvořit na burze — bude zveřejňovaná stejně jako dnes cena ropy Brent. Na BenzinMapa.cz sledujeme vývoj cen pohonných hmot, po spuštění ETS2 zobrazíme i vliv na ceny.

### Shrnutí

ETS2 začne platit nejdříve v lednu 2028. Benzín a nafta zdraží odhadem o 3–3,5 Kč/litr při ceně povolenky 45 EUR/t CO₂. Zdražení bude postupné a bude doprovázeno kompenzacemi pro nízkopříjmové domácnosti z EU fondů. Řidiči s efektivnějšími auty nebo alternativními palivy dopad pocítí méně.
    `,
    faqs: [
      { q: 'Co je ETS2 a kdy začne platit?', a: 'ETS2 je nový evropský systém emisních povolenek pro silniční dopravu a vytápění. Původně měl platit od 2027, byl odložen na 1. ledna 2028. Distributoři paliv budou muset nakupovat povolenky za CO₂ a zdražení přenesou na ceny na pumpách.' },
      { q: 'O kolik ETS2 zdraží benzín a naftu v ČR?', a: 'Při očekávané ceně povolenky 45 EUR/tunu CO₂ jde o zdražení přibližně 3,2 Kč/litr u benzínu a 3,5 Kč/litr u nafty. Při vyšší ceně povolenky může zdražení dosáhnout 5–6 Kč/litr.' },
      { q: 'Dostaneme kompenzace za zdražení z ETS2?', a: 'EU zřídila Sociální klimatický fond — ČR z něj do roku 2032 dostane přibližně 50 miliard korun. Jak přesně budou peníze distribuovány domácnostem, bude záviset na rozhodnutí české vlády.' },
      { q: 'Vztahuje se ETS2 i na LPG a elektromobily?', a: 'LPG je pohonná hmota ze zemního plynu a bude pod ETS2 také — zdraží méně než benzín nebo nafta kvůli nižšímu obsahu CO₂. Elektromobily jsou zcela mimo systém — elektřina pro dopravu pod ETS2 nespadá.' },
    ],
  },

  'biopaliva-benzin-nafta-2026-zdrazeni': {
    title: 'Biopaliva v benzínu a naftě: Proč zdražila paliva od ledna 2026?',
    excerpt: 'Od 1. ledna 2026 musí všechny pohonné hmoty v ČR obsahovat minimálně 1,25 % pokročilých biopaliv. Čepro proto zdražil o 30 haléřů. Co jsou pokročilá biopaliva, proč jsou dražší a co čekat dál?',
    date: '2026-04-26',
    readTime: '6 min',
    tag: 'Vysvětlení',
    content: `
## Proč jsou biopaliva v benzínu a naftě od roku 2026?

Od 1. ledna 2026 platí v České republice (a celé EU) nová povinnost: každý litr benzínu nebo nafty musí v energetickém vyjádření obsahovat minimálně **1,25 % pokročilých biopaliv**. Do roku 2030 se tato hodnota postupně zvýší na 5,5 %.

Tato pravidla vycházejí z evropské směrnice RED III (Renewable Energy Directive), která má urychlit přechod na obnovitelné zdroje energie v dopravě.

### Co jsou „pokročilá biopaliva"?

Biopaliva existují ve dvou kategoriích:

**Klasická biopaliva (1. generace):**
- Ethanol z kukuřice nebo obilí → přimíchávaný do benzínu (E10 = 10 % ethanolu)
- FAME z řepky → přimíchávaný do nafty (B7 = 7 % biosložky)
- V ČR se přimíchávají už léta a jsou v ceně paliva zahrnuté

**Pokročilá biopaliva (2. a 3. generace):**
- Vyrábějí se z odpadů a vedlejších produktů — zbytky ze zemědělství, kuchyňský odpadní olej (UCOME), komunální odpady
- NEKONKURUJÍ potravinové produkci (na rozdíl od klasických biopaliv z kukuřice)
- Jsou výrazně dražší ve výrobě, ale z pohledu EU mají lepší emisní bilanci

### O kolik dražší jsou pokročilá biopaliva?

Cena pokročilých biopaliv je typicky **3–8× vyšší** než cena fosilní nafty nebo benzínu. Právě proto zdražení přimíchávání o 1,25 % zvýší cenu paliva na pumpě přibližně o **0,20–0,40 Kč/litr**.

Česká firma Čepro (největší distributor pohonných hmot v ČR) oznámila, že od 1. ledna 2026 zdražila pohonné hmoty o přibližně **0,30 Kč/litr** právě kvůli povinnosti přimíchávat pokročilá biopaliva.

### Harmonogram povinností do roku 2030

| Rok | Podíl pokročilých biopaliv |
|---|---|
| 2026 | 1,25 % |
| 2027 | 2,0 % |
| 2028 | 3,0 % |
| 2029 | 4,0 % |
| 2030 | 5,5 % |

Pokud se cena pokročilých biopaliv nesníží, může celkový dopad na ceny pohonných hmot do roku 2030 dosáhnout **1,5–2 Kč/litr**.

### Kde se pokročilá biopaliva vyrábějí?

Největší producenti v EU jsou Německo, Finsko a Nizozemsko. Suroviny se dovážejí z celého světa — kuchyňský odpadní olej (hlavně z Číny a Indonésie), zemědělské zbytky (sláma, piliny) a technické tuky.

Kritici upozorňují, že dovoz surovin z Asie snižuje reálnou emisní výhodu a že trh s UCOME (použitý kuchyňský olej) je plný podvodů — někteří dodavatelé prodávali nový palmový olej jako „odpadní olej" s fiktivními certifikáty.

### Liší se povinnost pro benzín a naftu?

Ano, mírně. Nafta má vyšší podíl tzv. HVO (hydrogenovaný rostlinný olej — čistší technologie), benzín má vyšší podíl ethanolu. Detailní mix závisí na rafinérii a distributorovi.

### Ovlivní biopaliva výkon nebo spotřebu mého auta?

Při 1,25 % podílu pokročilých biopaliv je efekt na výkon a spotřebu **prakticky nulový**. Bioethanol má nižší energetický obsah než benzín (rozdíl cca 33 %), ale při 1,25 % přimíchání je dopad na spotřebu méně než 0,1 %.

Klasický 10% ethanol (E10) v benzínu způsobuje zvýšení spotřeby přibližně o 1,5–3 %, což je při dnešních cenách asi 0,6–1,2 Kč/litr v nákladech navíc. To ale platí pro stávající povinné přimíchávání, ne pro nové požadavky z roku 2026.

### Co čekat dál?

Požadavky na podíl obnovitelných zdrojů v dopravě se budou podle EU plánů postupně zvyšovat. Kromě pokročilých biopaliv EU tlačí na rozvoj **e-fuels** (syntetická paliva vyrobená z elektřiny a CO₂) a **vodíkových paliv**.

Pro běžné řidiče to znamená: ceny pohonných hmot budou v příštích letech obsahovat větší složku „zelené prémie" bez ohledu na cenu ropy. Sledování vývoje cen na BenzinMapa.cz pomůže orientovat se v tom, jaká část zdražení pochází z trhu s ropou a jaká z regulačních požadavků.
    `,
    faqs: [
      { q: 'Proč zdražila paliva od ledna 2026?', a: 'Od 1. ledna 2026 platí povinnost přimíchávat do každého litru pohonných hmot 1,25 % pokročilých biopaliv. Tato paliva jsou 3–8× dražší než fosilní ropa. Čepro proto zdražil o přibližně 0,30 Kč/litr.' },
      { q: 'Co jsou pokročilá biopaliva a liší se od klasických?', a: 'Pokročilá biopaliva (2. a 3. generace) se vyrábějí z odpadů — kuchyňský olej, zemědělské zbytky, komunální odpady. Nekonkurují potravinové produkci. Klasická biopaliva (ethanol z kukuřice, FAME z řepky) se přimíchávají v ČR už léta v podobě E10 (benzín) a B7 (nafta).' },
      { q: 'Kolik bude přimíchávání biopaliv stát v roce 2030?', a: 'Pokud se cena pokročilých biopaliv nezmění, povinný 5,5% podíl v roce 2030 způsobí zdražení o přibližně 1,5–2 Kč/litr oproti dnešnímu stavu. Ke zdražení z biopaliv se přidá pravděpodobně i zdražení z emisních povolenek ETS2.' },
      { q: 'Ovlivní pokročilá biopaliva motor nebo spotřebu mého auta?', a: 'Při podílu 1,25 % (rok 2026) je dopad na výkon a spotřebu prakticky nulový. Ani při 5,5 % (rok 2030) nebude dopad výrazný — stávající E10 benzín (10 % ethanolu) zvyšuje spotřebu o 1,5–3 % bez problémů pro většinu aut.' },
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
    title: post.title + ' | BenzinMapa.cz',
    description: post.excerpt,
    alternates: { canonical: `https://benzinmapa.cz/aktualne/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  };
}

export default async function AktualnePostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        publishDate={post.date}
        url={`https://benzinmapa.cz/aktualne/${slug}`}
      />
      <BreadcrumbJsonLd items={[
        { name: 'BenzinMapa.cz', item: 'https://benzinmapa.cz/' },
        { name: 'Aktuálně', item: 'https://benzinmapa.cz/aktualne/' },
        { name: post.title },
      ]} />
      <FaqJsonLd faqs={post.faqs} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-green-600">Domů</Link>
          <span>›</span>
          <Link href="/aktualne" className="hover:text-green-600">Aktuálně</Link>
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

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith('#### ')) return <h4 key={i} className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4 mb-1">{line.slice(5)}</h4>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-600 dark:text-gray-400 list-disc">{line.slice(2)}</li>;
            if (line.startsWith('| ')) return <p key={i} className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre">{line}</p>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>;
          })}
        </div>

        {/* Partnerský odkaz – polský sesterský projekt, jen pro článek o Polsku */}
        {slug === 'tankovat-v-polsku-nebo-slovensku-2026' && (
          <aside className="mt-8 rounded-2xl border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">🇵🇱</div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1">
                  Partnerský web
                </p>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Tankujete v Polsku? Vyzkoušejte BenzynaMapa.pl
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sesterský polský projekt sleduje ceny PB95, ON a LPG na více
                  než 4 400 čerpacích stanicích v Polsku. Stejné rozhraní, ceny
                  v zlotých.{' '}
                  <a
                    href="https://benzynamapa.pl/"
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="font-semibold text-green-700 dark:text-green-400 hover:underline"
                  >
                    Otevřít BenzynaMapa.pl →
                  </a>
                </p>
              </div>
            </div>
          </aside>
        )}

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
          <Link href="/aktualne" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium">
            <ChevronLeft size={16} />
            Zpět na Aktuálně
          </Link>
        </div>
      </article>
    </>
  );
}
