# BenzinMapa.cz — Stav projektu (checkpoint)

> Tento soubor se aktualizuje po každé Claude session. Pokud PC padne, tady zjistíš kde jsme skončili.

---

## Poslední session: 2026-04-24

### Co bylo uděláno (chronologicky):

1. **init** (`19295b5`) — Celý projekt od nuly: Next.js web, Python scraper, GitHub Actions
2. **seo** (`afaa395`) — AI crawler povolení v robots.txt + llms.txt
3. **blog** (`2923cc1`) — 3 SEO články s FAQ schema (ceny PHM, Natural 95 vs 98, dálniční vs. městská)
4. **gitattributes** (`3863e86`) — Fix konce řádků Windows/Linux
5. **scraper fix** (`eb3a75c`) — ← **TADY JSME SKONČILI**
   - Ceny zaokrouhleny na 0.10 Kč
   - Opravena URL mbenzin.cz (auto-detekce base URL)
   - UTF-8 fix pro Windows
   - 2 424 stanic: 42 reálné ceny + 2 382 brand-offset

---

## Co NEBYLO uděláno (todo):

- [ ] **Push na GitHub** — repo ještě není na GitHubu! Uživatel musí vytvořit repo a pushovat
- [ ] Nasazení na Wedos (návod v `WEDOS_NAVOD.md`)
- [ ] Vercel deployment (config v `web/vercel.json`)
- [ ] Více reálných cen — jen 42 z 2424 stanic má reálné ceny (zbytek průměr+brand-offset)
- [ ] Uživatelské účty (NextAuth.js) — zatím není implementováno
- [ ] Plánovač trasy (OSRM) — zatím není implementováno
- [ ] Notifikace na ceny — zatím není implementováno

---

## Uncommitted soubory (zatím nepushnuté):

- `Status.md` (tento soubor)
- `WEDOS_NAVOD.md` — návod na nasazení na Wedos
- `seo.md` — SEO strategie
- `web/.gitignore`, `web/CLAUDE.md`, `web/AGENTS.md`, `web/README.md`
- `web/vercel.json` — Vercel konfigurace

---

## Jak spustit projekt lokálně:

```bash
# Web
cd web && npm run dev

# Scraper
cd scraper && python build_osm_data.py
```

## Struktura projektu:

```
benzinmapa.cz/
├── web/          ← Next.js 15 app (TypeScript + Tailwind)
├── scraper/      ← Python scraper (mbenzin.cz → JSON)
├── .github/      ← GitHub Actions (update 3× denně)
├── heslo.md      ← TAJNÉ (v .gitignore, nikdy na GitHub!)
└── Status.md     ← tento soubor
```
