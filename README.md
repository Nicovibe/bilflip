# bilvipp

AI-drevet bruktbilanalyse for nordiske bilflippere. Skanner finn.no, finner biler under markedssnitt, leverer ferdig flipping-kalkyle.

Production: deploys to Vercel automatically on push to `master`. Domain: `bilvipp.no`.

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Plain CSS** (no Tailwind) — design tokens lifted from a "trader terminal" handoff
- **Static car data** loaded from `data/biler.json` (published hourly by the [bilflip-scraper](https://github.com/Nicovibe/bilflip-scraper) repo)
- **Mock auth** via `localStorage`. Real auth (Vipps Login / Auth.js) is the next step.

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/` | open | Landing — hero, live feed, top movers, CTA |
| `/markedet` | open | Full data table of all cars, filter + sort |
| `/abonnement` | open | Pricing |
| `/om` | open | About bilvipp + Oslo HQ |
| `/kontakt` | open | Contact form (mailto: hei@bilvipp.no) |
| `/login` | open | Mock login + Vipps button (no-op) + demo button |
| `/dashboard` | gated | Hot / review / dealer-pick feeds |
| `/bil/[id]` | gated | Per-car detail with kalkyle, sparkline, AI breakdown |
| `/varsler` | open | Coming soon |
| `/watchlist` | open | Coming soon |

`[id]` = finn-kode (e.g. `/bil/452553081`).

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

`predev` and `prebuild` copy `data/*.json` into `public/data/` so the scraper can keep
publishing to `data/` at the repo root unchanged.

## Data flow

1. The scraper (separate repo) writes `data/biler.json`, `data/feeds.json`, `data/modeller.json` to this repo via git push.
2. Vercel auto-deploys.
3. Build step copies `data/` → `public/data/` (gitignored).
4. Server components read directly from `data/` via `fs.readFile`.

`lib/mapping.ts` adapts the raw scraper shape to the component-friendly `Car` type — change names there if the scraper schema evolves.

## Placeholders / TODO

The following features have UI hooks but are not wired up. Search the codebase for `TODO(`:

- **`TODO(images)`** — `<CarThumbPlaceholder />` is rendered everywhere a car thumbnail goes. Replace with `<img src={car.img}/>` once the scraper supplies an image URL field.
- **`TODO(specs)`** — `drivetrain`, `battery`, `rangeKm` are kept as `null` in `mapCar()` and the corresponding rows are hidden on the detail page until the scraper supplies them.
- **`TODO(map)`** — `<DetailMap />` and `<BigMap />` use a stylised SVG placeholder. Swap to Mapbox / MapLibre when lat/lng land in the data.
- **`TODO(api)`** — Contact form opens `mailto:`. Replace with a real POST endpoint (Vercel Function) when ready.
- Auth-related TODOs in `lib/auth.ts` — switch from localStorage mock to Auth.js + Vipps Login.
- Watchlist / Varsler / Telegram bot — placeholder pages exist at `/watchlist`, `/varsler`.

## Deployment

```bash
vercel deploy            # → preview URL
vercel deploy --prod     # → bilvipp.no (after preview verification)
```

## Reverting to the legacy site

A snapshot of the previous single-file vanilla site (~/projects/bilflip pre-redesign)
is preserved at the git tag `v1-pre-redesign` and the branch
`backup/pre-redesign-2026-04-26`.

To roll the production site back:

```bash
git checkout master
git reset --hard v1-pre-redesign
git push --force-with-lease origin master
# Vercel auto-deploys the legacy index.html within ~2 minutes
```

## Repo layout

```
~/projects/bilflip/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # html + body + fonts + globals
│   ├── globals.css           # all design tokens + components
│   ├── login/                # /login (no shell)
│   ├── (site)/               # everything else (shared TopBar/Sidebar/Footer)
│   │   ├── layout.tsx        # shell wrapper
│   │   ├── page.tsx          # / landing
│   │   ├── markedet/
│   │   ├── abonnement/
│   │   ├── om/
│   │   ├── kontakt/
│   │   ├── varsler/          # coming soon
│   │   ├── watchlist/        # coming soon
│   │   └── (gated)/          # AuthGate wrapper
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       └── bil/[id]/
├── components/               # All UI components
├── lib/                      # data.ts, mapping.ts, format.ts, auth.ts
├── scripts/copy-data.mjs     # prebuild data copy
├── data/                     # scraper output (committed; updated hourly)
├── public/                   # static assets (placeholders, fonts, etc.)
└── next.config.mjs
```
