# Modern Rebuild — Wayfinding Map

## Destination

A complete, decision-locked blueprint for the rebuilt wildfire tracker, written as `spec.md` in this effort's folder. The spec pins down: stack and project architecture, the EONET v3 wildfire data contract, data fetching and freshness, map UX and interactions, the redesigned visual design language, the v1 feature set (live wildfires map, rich detail panel, filters & search), and the later-features roadmap. When the map is done, implementing the rebuild is ticket-sized task work — nothing left to decide.

## Notes

- Domain: NASA EONET v3 wildfires feed, rendered as a public wildfire-tracking map.
- Stack (locked in charting): TanStack Start + TypeScript; MapLibre GL JS + OpenFreeMap basemap; Tailwind v4 + shadcn/ui; deployed to Vercel via Nitro.
- Audience (locked): public product — correctness and production hygiene matter.
- Data scope (locked): wildfires only (EONET `category=wildfires`), no other disaster categories in v1.
- Resolve tickets with `/grilling` + `/domain-modeling` (HITL) and `/research` (AFK) per type.
- For anything visual, consult `/design-taste-frontend` and `/impeccable`.
- Each ticket is one decision; record the answer on the ticket, gist it here.

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Research: EONET v3 wildfire data contract](issues/01-research-eonet-v3-data-contract.md) — live-verified contract: string `wildfires` category, `{id,title,description(nullable),link,closed,categories,sources,geometry}` with magnitude in acres; no key, CORS `*`, 60/min. Detail panel shows size/date/source-links; containment/cause/agency/imagery are ABSENT → link out to IRWIN/GDACS. `status=all`+`days`/`start`/`end` verified for the archive roadmap.
- [Grilling: Data freshness & fetching architecture](issues/02-grilling-data-freshness-architecture.md) — BFF-cached fetch: browser never hits EONET direct; TanStack Start server route + Nitro SWR cache (5m TTL) revalidates upstream, SSR paints first dataset, client TanStack Query polls through the route 5m (paused when tab hidden, refresh on focus). One query holds the open-wildfires array; markers/filters/detail all derive from it (no per-event fetch). UX is stale-before-replace: skeleton on first load, silent background swap with "Updated Xm ago", stale data + non-blocking banner + Retry on refresh failure, full-screen error only when first load itself fails.
- [Prototype: Visual design language](issues/03-prototype-visual-design-language.md) — **WILDLAND LEDGER** direction chosen live (variant C + A's glowing flame markers): forest `#11160f`/panel `#1a2118`/bone `#f1ece2`/signal-orange accent `#f2672b`; Space Grotesk display + JetBrains Mono data; sharp radii (0–8px, 14px cards), hairline borders, numbered ledger rail, bottom burn-ticker, overlay detail card. Dark-primary, not themeable. Prototype: `prototypes/visual-design-language/index.html` (all three directions switchable).
- [Grilling: Filters & search scope](issues/04-grilling-filter-and-search-scope.md) — v1 filter bar = recency (Any/24h/7d on geometry.date) + magnitude thresholds (Any/>100/>1k/>10k acres, nulls only under Any); no status filter (feed is open by construction, closed = archive roadmap) and no spatial filter (map viewport is the spatial filter; pan/zoom = extent). One search box matches title + description (client-side substring; EONET has no structured location). Filters ∧ search AND into one visible set driving markers, list, and counts identically. Empty state = "No fires match" + one-tap Clear filters; active-filter count always shown. Flat one-row bar, no nested drawers.

## Not yet specified

- **Alerts & subscriptions** (later roadmap) — needs identity/auth of some kind; which notification channel?
- **Layered data sources** (later roadmap) — FIRMS hotspots, CAL FIRE overlays: how do they compose with EONET?
- **History / archived fires** (later roadmap) — date-range browsing over `status=all` data.
- **Testing / quality bar and CI** for a public product.
- **Vercel deployment specifics** — Nitro preset, env vars, any keys.
- **Map interactions depth** — clustering, polygons vs points, layer toggles.

## Out of scope

- **Community / user-submitted reports** (not selected in charting; never graduates).
- **Non-wildfire disaster categories in v1** (EONET other categories; redrawn only via a new effort).
