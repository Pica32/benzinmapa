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
