# BenzinMapa.cz — Pravidla pro Claude

## Stack

- `web/` — Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 (App Router)
- `scraper/` — Python scraper (mbenzin.cz → OSM → JSON)
- `.github/workflows/` — GitHub Actions (ceny 3×/den, články 2×/den)

---

## Knihovny — co používat

### UI Komponenty
- **Primární**: `shadcn/ui` (Radix + Tailwind) — instaluj přes `npx shadcn@latest add <component>`
- Vlastní komponenty pište s Tailwind CSS v4 syntaxí (`@utility`, ne `tailwind.config.js`)
- Ikony: `lucide-react` (již nainstalovaná)

### Animace
- **Primární**: `motion` (balíček `motion`, dříve framer-motion) — import z `motion/react`

### SEO & Strukturovaná data
- Meta tagy: Next.js vestavěný `generateMetadata()` v každém `page.tsx`
- JSON-LD: `react-schemaorg` (Google) pro type-safe schémata
- OG obrázky: Next.js vestavěný `opengraph-image.tsx` per route
- Vždy přidávat: `title`, `description`, `canonical`, `og:image`, JSON-LD dle typu stránky

### Mapa (Leaflet)
- **Clustering**: `react-leaflet-cluster` (akursat) — `leaflet.markercluster` je již nainstalovaná
- Wrapper: `react-leaflet` v5 (již nainstalovaná)
- Dynamický import povinný: `dynamic(() => import(...), { ssr: false })`

### Performance Monitoring
- **Core Web Vitals**: `web-vitals` (Google) — přidat do `app/layout.tsx`
- **Lighthouse CI**: GitHub Action na každý PR — viz `.github/workflows/`
- **Bundle size**: `@next/bundle-analyzer` — spouštět před přidáním nových závislostí

### Analytics
- **Plausible Analytics** — cookieless, GDPR, self-host nebo cloud

### Testing
- **E2E**: Playwright
- **Linting a11y**: `eslint-plugin-jsx-a11y` — přidat do ESLint config

---

## Next.js 16 — klíčová pravidla

- Vždy číst `node_modules/next/dist/docs/` před psaním kódu
- App Router — žádné Pages Router vzory
- Server Components jsou výchozí — `"use client"` jen kde nutné
- Metadata: `generateMetadata()` async funkce, ne `<Head>`
- Images: `next/image` vždy — nikdy `<img>` tag
- Fonts: `next/font` — nikdy přímé CSS `@import`

## Tailwind CSS v4 — klíčová pravidla

- Konfigurace v CSS souboru (`@theme`, `@utility`), ne `tailwind.config.js`
- Typography plugin: `@plugin "@tailwindcss/typography"` v CSS
- Dark mode: `@variant dark`

---

## Výkon — checklist před každým PR

- [ ] `next build` projde bez chyb
- [ ] Žádný nový `<img>` tag (vždy `next/image`)
- [ ] Nové Server Components — jen `"use client"` kde nezbytné
- [ ] Nové závislosti prověřeny: aktivně udržované? Licence OK?
- [ ] JSON-LD přítomné na nových stránkách

---

## SEO — šablona pro každou novou stránku

```tsx
// page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "...",
    description: "...",
    alternates: { canonical: "https://benzinmapa.cz/..." },
    openGraph: {
      title: "...",
      description: "...",
      url: "https://benzinmapa.cz/...",
      siteName: "BenzinMapa.cz",
      locale: "cs_CZ",
      type: "website",
    },
  };
}
```

---

## Scraper — pravidla

- Scraper scrapuje `mbenzin.cz` — párování přes GPS (<400 m) nebo name+city
- Fallback pro nespárované stanice: průměr + brand-offset
- `build_osm_data.py` → `web/public/data/*.json`
- Hesla a API klíče NIKDY do gitu (`.gitignore` → `heslo.md`, `.env`)
