# IconVault

**English | [فارسی](README_FA.md)**

A small, offline icon browser. Search → browse → preview → customize → copy/download SVGs from **Lucide**, **Tabler** and **Phosphor**. React + TypeScript + Vite + Tailwind CSS v4. No backend, no API, no CDN — everything is bundled locally.

## Features

- **Search** across 8,723 icons by name and tags — in English or Persian (ranked: exact → prefix → includes → tag/keyword)
- **Browse by collection** — sidebar + filter chips with live counts
- **Preview panel** — glass side panel with live customization: size 16–128px, preset + custom color, stroke width 0.5–3 (Lucide/Tabler only; hidden for Phosphor, which is fill-based)
- **Copy SVG** (with "Copied" feedback, plus quick-copy from cards) and **Download SVG** — exports are self-contained with your chosen size/color/stroke
- **Favorites** — persisted in `localStorage`
- **Dark / light theme** + **English / فارسی** with full RTL — both persisted and applied before first paint
- **Accessible** — WCAG-checked token pairs, visible focus rings, dialog semantics with focus trap, `prefers-reduced-motion` respected

## Design: "LED Lab"

Near-black chassis, a sparing lime accent, and light used as a *state*:

- Glow is tokenized (`shadow-glow-sm/md/lg`, `drop-shadow-glow*`) with a strict budget: brand, active nav item, focused search, primary button, panel hero — nothing else glows
- Icons **power on** at hover (80% → 100% brightness plus a glyph-shaped bloom)
- **JetBrains Mono** is the data face (icon names, counts, values); Inter is the UI voice; Vazirmatn for Persian
- One glass surface: the preview panel (`backdrop-blur` + machined edge-light)
- Dark-only dot-grid canvas behind the icon grid; the light theme is warm paper with a deeper lime
- Direction-aware RTL: the panel and drawer flip sides; logical CSS properties everywhere

## Setup

Requires Node ≥ 22.12.

```bash
npm install
npm run icons:build   # copies SVGs + metadata from node_modules into public/icons (once)
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run icons:build [-- --force]` | Regenerate `public/icons/` from the bundled packages (skipped automatically if already built) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |

`public/icons/` is generated and gitignored — run `icons:build` after a fresh clone or after updating the icon packages.

## Project structure

```
scripts/build-icons.mjs      icon pipeline: node_modules → public/icons (+ metadata.json)
public/icons/                generated SVGs + metadata (gitignored)
src/
  components/                Header, Sidebar, SearchBar, IconGrid, IconCard, IconPreview
  hooks/                     useIcons, useTheme, useLanguage, useFavorites
  utils/                     search (ranked filtering), svg (load/build/copy/download)
  data/                      icons (cached loaders), collections (descriptors)
  locales/                   en, fa
```

## Collections & licenses

| Collection | Icons | License | Style |
| --- | --- | --- | --- |
| [Lucide](https://lucide.dev) | 2,081 | ISC | stroke |
| [Tabler](https://tabler.io/icons) | 5,130 | MIT | stroke |
| [Phosphor](https://phosphoricons.com) | 1,512 | MIT | fill |

The pipeline strips license comments from the SVG files; the licenses require attribution, which this section provides.

## Notes

- **Fully offline** — fonts (Inter, JetBrains Mono, Vazirmatn) and all SVGs are bundled; the app makes no external requests.
- **Bilingual search** — Persian keywords are generated at build time from a curated English→Persian dictionary (`scripts/fa-dictionary.json`, ~540 common words; ~88% of icons covered). To extend it, add entries and run `npm run icons:build -- --force`.
- Metadata loads first (~2 MB total, including Persian keywords); SVG text is fetched per icon on demand and cached.
- The grid renders in 150-card chunks via `IntersectionObserver` — smooth with 8,723 icons, no virtualization.
- Persistence keys: `iv:theme`, `iv:lang`, `iv:favorites`.
