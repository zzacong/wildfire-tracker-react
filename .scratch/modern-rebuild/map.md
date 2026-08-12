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

## Not yet specified

- **Alerts & subscriptions** (later roadmap) — needs identity/auth of some kind; which notification channel?
- **Layered data sources** (later roadmap) — FIRMS hotspots, CAL FIRE overlays: how do they compose with EONET?
- **History / archived fires** (later roadmap) — date-range browsing over `status=all` data.
- **Testing / quality bar and CI** for a public product.
- **Vercel deployment specifics** — Nitro preset, env vars, any keys.
- **Map interactions depth** — clustering, polygons vs points, layer toggles.
- **Accessibility baseline** for the design system.

## Out of scope

- **Community / user-submitted reports** (not selected in charting; never graduates).
- **Non-wildfire disaster categories in v1** (EONET other categories; redrawn only via a new effort).
