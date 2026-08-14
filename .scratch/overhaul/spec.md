# Spec: Wildfire Tracker Overhaul

Status: agreed (grilled 2026-08-14)

Rebuild the stale CRA/React-17 wildfire tracker as a modern TanStack Start app. Ships focused on wildfires, architected around a generic hazard-event concept so other hazard kinds can be enabled later. Portfolio-grade look and feel, dark "mission control" visual direction.

## Decisions

### Scope & domain
- Product stays a **Wildfire Tracker** (name kept), but the domain is modeled around **Hazard Event** with a **Kind** (wildfire today, others later). See `CONTEXT.md` for the glossary.
- The kind-filter **seam exists in the UI but only *Wildfire* is populated** in v1.
- Data rule: hard **cap at 1,000 hazard events** in the data layer — if the source returns more, older/lowest-magnitude events are dropped before reaching the client.

### Stack
- **TanStack Start** (React, TypeScript, SSR) scaffolded via `npx @tanstack/cli@latest create` (Start → React → Tailwind add-on).
- **Tailwind CSS v4** + **shadcn/ui** (init via `pnpm dlx shadcn@latest init`).
- Package manager: **pnpm**. Lint: **oxlint**, format: **oxfmt**.
- Tests: **Vitest** (unit) + **Playwright** (e2e).

### Map
- **MapLibre GL JS** with **OpenFreeMap** tiles, **dark** basemap style. No API key, no billing. (ADR-0001)
- Clustered markers at low zoom, individual markers on zoom; **heatmap as a toggleable layer**.
- Full-bleed single-screen map-centric layout; slide-over detail panel; floating filter/legend bar.

### Data
- **Server-side** EONET fetch in a TanStack Start server function + route loader. Browser never calls EONET. (ADR-0003)
- TTL cache (~15 min), module-level map + `Cache-Control` headers; **stale-while-revalidate**.
- On fetch failure: serve **last-known data** with a **"stale data" banner** — never a dead page.
- EONET v3 endpoint `/api/v3/events`, send `Accept: application/json` (default is XML).
- **Status**: open by default; toggle to include **recently closed (last 30 days)**.
- Normalize **Area to acres** (EONET reports acres via IRWIN, hectares via GDACS). Date range filter via `start`/`end`.

### UI/UX
- Dark "mission control" theme: dark basemap, fire-orange/red accents, glassy panels.
- Event list panel: sortable, default **newest first**; click to fly the map.
- Rich detail panel: area (acres), status, start/close dates, description, **source links** back to the reporting agency.
- **Responsive-first**: detail panel becomes a bottom sheet on mobile.

### QA
- Vitest: data transform/filter/normalization logic.
- Playwright: map loads → marker click → detail panel; heatmap toggle; status filter; responsive layout.

### Hand-off
- Tickets live in `.scratch/overhaul/issues/`. In-place replacement of `src/` (old code preserved in git history).

## ADRs
- `docs/adr/0001-maplibre-over-google-maps.md`
- `docs/adr/0002-hazard-event-first-domain.md`
- `docs/adr/0003-server-side-eonet-with-cache.md`

### Hosting
- **Vercel** (chosen deliberately despite TanStack Start not listing Vercel as an official partner — deploys via the under-development Nitro plugin; one-click deploy, free tier).
