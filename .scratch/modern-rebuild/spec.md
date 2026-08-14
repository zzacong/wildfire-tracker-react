# Modern Rebuild — Wildfire Tracker v1 Spec

Status: resolved

Effort: `.scratch/modern-rebuild/` (wayfinding map: `map.md`; decision tickets: `issues/01–06`; prototypes: `prototypes/visual-design-language/index.html`, `prototypes/detail-panel/index.html`).

## Problem Statement

The current tracker is a small Create-React-App demo (React 17, Google Maps, mock data) that cannot be a public product: it has no real data pipeline, no freshness story, no design system, and no accessibility baseline. People who want to keep an eye on active wildfires need a trustworthy, live map they can scan fast — how many fires, where, how big, how fresh the numbers are — on any device, without a NASA API called from their browser or a flashing-alarm aesthetic. The rebuild replaces it wholesale.

## Solution

A rebuilt public wildfire tracker in **WILDLAND LEDGER** identity: a dark, calm situation-room map (forest/panel/bone/signal-orange) over MapLibre GL + OpenFreeMap, fed by **NASA EONET v3** through a BFF-cached server route so the browser never hits NASA directly. One derived dataset — sliced by filters, search, and an Open/All status toggle — drives the map markers, a numbered ledger rail, a bottom burn-ticker, and a rich popover detail panel, all read from the same source so the map, the list, and the numbers never disagree. A 5m polling cadence keeps data fresh with stale-before-replace UX: first paint from SSR, silent background swaps with an "Updated Xm ago" readout, and non-blocking recovery when a refresh fails. AA contrast, keyboard + screen-reader structure, and reduced-motion support are locked into the design tokens, not bolted on. Built with TanStack Start + TypeScript, Tailwind v4 + shadcn/ui, deployed to Vercel via Nitro.

## User Stories

1. As a visitor, I want to land on a map that already shows active wildfires (painted before my first client round-trip), so that I see the situation immediately instead of a spinner.
2. As a visitor, I want each fire shown as a clearly visible marker over the map, so that I can see where fires are at a glance.
3. As a visitor, I want every fire's size in acres, latest-update time, and status (Open/Closed) shown in a numbered ledger beside the map, so that I can compare fires at a glance without clicking each one.
4. As a visitor, I want a bottom ticker showing live aggregates (count, and active/closed split) for the fires I'm currently viewing, so that the headline numbers stay visible while I scan.
5. As a visitor, I want the map markers, the ledger, and the ticker to always reflect exactly the same set of fires, so that I never see more fires in one place than another.
6. As a visitor, I want to click a marker, a ledger row, or a search result to open the same detail panel about that fire, so that no matter where I select, I get the full picture.
7. As a visitor, I want the detail panel to show only facts the data source actually provides — status, size, last-updated, absolute UTC timestamp, coordinates, EONET ID, and source links out to IRWIN/GDACS — so that I can trust every number and link shown.
8. As a visitor, I want the panel to be upfront about absent fields (containment %, cause, agency, imagery) by pointing me to the source incident page about them, so that I know those facts exist somewhere and am never promised them on the panel.
9. As a visitor, I want the panel to stay open over a shaded map while I tick other fires and swap its content in place, so that I can compare fires without opening and closing tabs.
10. As a visitor, I want to dismiss the panel with Escape, the close button, or clicking the shaded map, so that I stay in control.
11. As a visitor, I want to set how fresh the data feels: recency (Any/24h/7d), size (Any/>100/>1k/>10k acres), and a free-text search over fire name and description, so that I can cut the noise to the fires I care about.
12. As a visitor, I want filters and search to combine (AND) into one visible set, so that applying both narrows the markers, ledger, and ticker identically.
13. As a visitor, I want an explicit "No fires match" state with a one-tap Clear filters reset and an always-visible count of active filters, so that a dead end is obvious and reversible.
14. As a visitor, I want the Open/All toggle to switch the feed between only active wildfires and active-plus-closed, so that I can get a sense of recent burn activity as well as the live picture.
15. As a visitor, I want closed fires to look different from active fires on the map and in the ledger (muted vs. flame, plus a labeled status), so that I can tell them apart without relying on color alone.
16. As a returning visitor, I want to see "Updated Xm ago" and to have the page refresh itself in the background every 5 minutes, pausing when my tab is hidden and refreshing when I return, so that the numbers are current without me doing anything.
17. As a visitor, I want a manual "Refresh now" control, so that I can force fresh data on demand.
18. As a visitor, I want a failed background refresh to keep showing the last good data with a non-blocking banner and a Retry button, so that a blip doesn't wipe the map.
19. As a first-time visitor on a bad connection, I want a full-screen error with retry only when the very first load fails, so that I know the app is broken rather than empty.
20. As a keyboard user, I want to reach every marker, ledger row, filter chip, and panel control with Tab/Enter/Space, with a visible focus ring, so that I can use the whole tracker without a mouse.
21. As a screen-reader user, I want the ledger to be a proper ordered list of buttons with state announced, the ticker to be a polite live region that only announces changed aggregates, markers to be buttons with "name, size in acres" labels, and the detail panel to be a proper dialog with trapped focus and a returning focus point, so that the map is genuinely usable, not presentational.
22. As a visitor with low vision, I want all text — including the small mono data labels — to meet WCAG 2.1 AA (4.5:1), so that nothing is illegible on the dark surfaces.
23. As a visitor who prefers reduced motion, I want all pulse/glow/fade animation cut to zero when that preference is set, so that nothing animates on my screen.
24. As a visitor on a phone, I want the detail panel to collapse to a bottom sheet, so that the map stays usable on a narrow screen.
25. As a visitor panning/zooming the map, I want the viewport to act as the spatial filter (no box controls needed), so that where I look is what I see.
26. As a security-conscious visitor, I want all requests to the NASA feed to go through the app's server, not my browser, so that the app respects the upstream rate limit and caching at population scale.

## Implementation Decisions

Decisions reference the wayfinding tickets that locked them (`issues/01–06`). This spec is the single source of truth for the build; where it adds detail beyond a ticket it does so to pin previously-open seams (flag: **new**).

### Stack & project architecture (locked in charting)

- TanStack Start + TypeScript; MapLibre GL JS with the **OpenFreeMap** basemap; Tailwind v4 + shadcn/ui; deployed to Vercel via **Nitro**; managed with **pnpm** (ADR 0002). One app, no micro-architecture. The old CRA app (`src/`, react-scripts, google-map-react) is replaced, not migrated.
- **Dark-primary, not themeable** (ticket 03/06): no light mode v1.

### Domain vocabulary

- **Wildfire** — an `EONET` event carrying `category=wildfires`.
- **Open-wildfires set** — the derived set of fires currently shown (after status, filters, search). The **derived dataset** is the single source of truth for markers, ledger, ticker, and detail — they are projections of it, never their own sources.
- **Ledger** — the numbered rail of fires. **Ticker** — the bottom aggregate strip. **Detail panel** — the popover card; **bottom sheet** — its <820px form.

### Data contract (ticket 01, **normalized Fire model — new**)

`GET /events?category=wildfires&status=open|all` (plus `days` — see toggle below) returns the EONET v3 envelope. Per-wildfire fields: `id` (string, detail-URL suffix), `title`, `description` (**nullable** → UI fallback "No description provided"), `link`, `closed` (null while open / ISO once closed), `sources` (`[{id: "IRWIN"|"GDACS", url}]` → the incident pages where containment/cause/agency/imagery live), `geometry` (array; each `{ magnitudeValue|null, magnitudeUnit:"acres", date, type:"Point"|"Polygon", coordinates:[lng,lat] }`).

Normalization (**new**, defensive, keeps detail-panel promises grounded):
- Pick the **newest `geometry` entry** (max `date`) as the fire's position and magnitude; zero geometry ⇒ drop the event (feed anomaly).
- `type: "Polygon"` ⇒ derive a marker point from the polygon (envelope center). Markers are points regardless.
- Magnitude = `magnitudeValue` in `magnitudeUnit` ("Not reported" when null).
- Nothing is refetched per fire: the list payload carries every field the panel shows (ticket 01/02). Detail endpoint `GET /events/{id}` is not used in v1.

### Fetching & freshness (ticket 02, key extended by status — **new**)

- **BFF-cached route**: a TanStack Start server route wraps EONET behind a Nitro stale-while-revalidate cache (5m TTL). The browser never calls EONET directly. The route accepts `?status=open|all`; the cache is keyed by status. Upstream honors EONET's `no-cache` and 60/min-per-IP caps — one upstream fetch serves all visitors in a TTL window.
- **SSR first paint**: the server loader hydrates the first dataset so markers render before a client round-trip.
- **Client poll**: one TanStack Query per status (`['eonet','wildfires',status]`), `refetchInterval` 5m; polling **paused when the tab is hidden**, and a **refresh fires on re-focus**. Manual **Refresh now** busts the client cache. Toggling Open→All swaps the query key (separate cache slot, same SWR semantics).
- **Stale-before-replace UX**: skeleton + "Loading fires…" on first load until first paint of markers; background refresh keeps last-known-good markers, showing "Updated Xm ago", and swaps silently; refresh failure keeps the stale-but-known-good set with a **non-blocking banner** ("Couldn't refresh — showing data from Xm ago") + **Retry**; only a failed **first** load gets a full-screen error + retry.

### Status toggle — Open/All (**new**; exported the `issues/` fog → decision)

- The header ships the segmented **Open/All** toggle (ticket 03 aesthetic) as a **working control**. **Open** (default) fetches `status=open` — exactly the open-by-construction product of tickets 02/04. **All** fetches `status=all` bounded by `days=30` so the set stays "tens-to-hundreds of events" and the map stays readable; unbounded/date-range archive browsing remains the later history roadmap (ticket map: "History / archived fires").
- Under **All**, closed fires carry `closed` timestamps; they are shown with a **muted flame** (no glow) marker, a **Closed** status chip in the ledger and panel, and a split **active/closed** aggregate in the ticker. The map key text is extended: "orange flame = active wildfire; muted flame = closed fire; size and status in the ledger". The uniform flame **shape** + **halo** from ticket 06 is retained (closed status is color + text, never size) so the non-color affordance survives.
- Recency/magnitude/search (below) apply identically to whichever status is live.

### Derived dataset — filters on search (ticket 04), single source (tickets 02/05)

- **One derived set drives everything**: markers (as GeoJSON), ledger, ticker aggregates, and detail selection are all projections of the loaded array — filters and search slice the array client-side (no refetch). A refresh atomically swaps the array so markers/filters/detail never diverge.
- **Filter bar — flat one row**, no nested drawers: *recency* (Any / 24h / 7d, sliced on latest-update `geometry.date`) + *magnitude* (Any / >100 / >1k / >10k acres, sliced on `magnitudeValue`; **null-magnitude fires pass only under Any**) + *search* (case-insensitive substring over `title` + `description`; EONET has no structured location).
- **Filters ∧ search AND** into one visible set. **Empty state**: "No fires match" + one-tap **Clear filters**; active-filter count always visible. No status option inside the bar (status is the header toggle), no spatial control (the viewport is the spatial filter).
- **Ledger** (ticket 03/06): 372px rail, entries in a 34px number column; rows are **buttons** in a semantic `<ol>`, accessible name = fire name + size, `aria-pressed` reflects selection; selection tint `rgba(242,103,43,.08)` + 2px orange left rail; hover `rgba(242,236,226,.04)`.
- **Ticker** (ticket 03/06): bottom strip of aggregates for the visible set (count; active/closed split under All). `aria-live="polite"` — announces **changed aggregates only** on a 5m poll.

### Detail panel (ticket 05, 06 dialog semantics)

- **Popover**: a 340px floating card docked top-right (`right:18px; top:18px`), 14px radius, hairline border, subdued shadow, drag-grip + close in the header, over a map shaded `rgba(17,22,15,.28)`. Opens from **any** selection path (marker / ledger / search result) via **one selection state**; ticking another fire swaps content in place; Escape / ✕ / shade-click dismiss; map never scrolls while open.
- **Grounded fields only**: status (Open/Closed), size-in-acres hero ("Not reported" when null), last-updated (relative), absolute UTC timestamp, coordinates, EONET ID, **source buttons** out to IRWIN/GDACS, and the dashed **absent-fields note** ("Containment %, cause, and agency live on the source incident page — not in the EONET feed. Imagery is linked from there too.").
- **Mobile**: below 820px the panel is a **bottom sheet** (full-width, rounded top, 62vh cap), header flattens to centered title + close.
- **Dialog semantics** (ticket 06): `role="dialog"` + `aria-modal`, labelled by fire name, **focus trapped** while open, **Escape** closes, focus returns to the opening marker.

### Map (tickets 03/06, closed-fire treatment **new**)

- MapLibre GL + OpenFreeMap; the viewport is the spatial filter (no bbox control). Markers derive as GeoJSON from the derived dataset.
- **Uniform flame glyph** + dark **halo** disc (contrast ≥3:1 over any tile); no size-by-magnitude encoding, no number badges (ticket 06). Closed fires: same flame shape, muted color, no glow (this spec).
- Markers are `tabindex="0"` **buttons**, `aria-label="<name>, <size> acres"`, Enter/Space opens the panel, `aria-pressed` reflects selection; basemap canvas `aria-hidden`.
- Small on-map **key** text ("orange flame = active wildfire; muted flame = closed fire; size and status in the ledger/ticker").

### Design tokens (tickets 03/06 — locked)

- **Palette**: forest `#11160f` (bg), panel `#1a2118`, border `rgba(242,236,226,.12)` (hairlines; decorative, no 3:1) / `.22`, bone `#f1ece2`, muted `#a7b09d`, **faint `#828c70`** (bumped from `#70795f` for AA — 4.66 on panel / 5.18 on forest), signal orange `#f2672b` (single accent). `#13160f` on accent for toggled/active chips (`#f2672b` bg).
- **Type**: Space Grotesk 400/500/700 for display + UI (display weight 700, `-0.02em` tracking); JetBrains Mono 10–13px for all data values. Three-tier bone→muted→faint hierarchy; AA 4.5:1 at all sizes.
- **Radii**: sharp rows/ticker (0–8px), 14px cards; **elevation**: flat + hairline borders, no drop shadows except the fire glow.
- **Focus ring**: one token — 2px bone outline + 2px offset, `:focus-visible` only.
- **Reduced motion**: `prefers-reduced-motion: reduce` cuts all animation to `0ms` — LIVE dot solid, marker ring static, no fades.
- **Component aesthetic**: bordered flat panels, numbered ledger rows with inline mono metadata, segmented Open/All toggle, bottom ticker, overlay detail card. Encoded tokens include `--c-faint`, `--focus-ring`, `--marker-halo`, `--motion-reduce`.

### Header (ticket 03, toggle decision this spec)

Bold Space Grotesk masthead + segmented **Open/All** toggle + LIVE pulse on the ledger head + "Updated Xm ago" + Refresh now + active-filter count.

## Testing Decisions

- **Principle**: test external, user-visible behavior only — the normalized payload the route returns, and the derived set the UI renders — never implementation internals. Assert through user-visible contracts (contract shape, freshness semantics, filters ∧ search outcome, a11y attributes, dialog behavior).
- **Seam A — the BFF route** (the data boundary; highest seam short of E2E): invoke the TanStack Start server route in-process with the upstream `fetch` stubbed (EONET never contacted). Assert:
  - Normalized contract per status: `open` vs `all` hit the correct upstream params; newest-geometry selection; nullable `description` fallback; null magnitude preserved; polygon envelope derivation; malformed/zero-geometry events dropped.
  - Freshness: second request within the 5m TTL returns cached data without a new upstream call; after TTL the route revalidates; upstream error on first load surfaces as a first-load error, on refresh as stale+retry semantics (checked at the route/query boundary, per ticket 02).
  - Status cache isolation: an `open` request never serves an `all` payload or vice-versa.
  - Run in **Vitest**; stub `fetch` with an in-process mock (e.g. undici `MockAgent`).
- **Seam B — derived dataset + components** (all user-visible slicing sits here, so this is where most behavior is pinned): stock map → stub MapLibre behind the marker layer (canvas can't be asserted cheaply); render ledger / filter bar / ticker / panel / header against a seeded dataset. Assert:
  - Filters ∧ search AND into one set: markers-derived data == ledger rows == ticker aggregates == panel target; recency + magnitude slicing incl. null-magnitude pass-under-Any; empty state + one-tap clear; active-filter count.
  - Open/All: toggle swaps the query (status fetch), closed fires render muted and labelled, ticker split active/closed.
  - Detail panel: opens from marker / ledger / search; one selection state; dialog `role` + `aria-modal`, focus trap, Escape closes, focus returns to opener; bottom-sheet switch under 820px (viewport-mocked).
  - A11y: ledger `<ol>` of buttons with `aria-pressed` + accessible names; markers as buttons with size labels; ticker `aria-live="polite"` announcing only changed aggregates; focus ring and reduced-motion tokens apply (emulate `prefers-reduced-motion`).
  - UI contract keeps these in one test seam: the derived-set selector is exercised **through** the components that render it, not as free-standing units.
- **Quality gate (ADR 0001)**: the rebuild lints with **oxlint** and formats with **oxfmt** — Rust-native, no ESLint/Prettier in the stack. `oxlint --deny-warnings` enforces the `correctness` category plus the `react` and `jsx-a11y` plugins; `oxfmt --check` enforces formatting (printWidth 80, Tailwind class + import sorting on). Both must pass clean per-PR with the build.
- **Prior art**: thin — the repo's only precedent is the CRA harness (`@testing-library/react` in `package.json`); the rebuild introduces Vitest + React Testing Library + user-event. Tests live beside the modules they cover and ship with the feature (CI wiring is out of scope — see below).

## Out of Scope

- **Alerts & subscriptions** (later roadmap) — needs identity/auth and a notification channel decision.
- **Layered data sources** (later roadmap) — FIRMS hotspots, CAL FIRE overlays and their composition with EONET.
- **History / archived-fires browser** (later roadmap) — unbounded date-range browsing over `status=all`. The **All** toggle's bounded `days=30` closed view is the v1 frontier; the archive browser is not.
- **Community / user-submitted reports** (not selected in charting; never graduates).
- **Non-wildfire disaster categories** (EONET other categories; only via a new effort).
- **Map-clustering / layer toggles / polygon-as-shape rendering** (datasets are tens-to-hundreds of events; points suffice).
- **Deployment specifics** — Nitro preset/env/keys are settled at build time (`Vercel deployment specifics` fog).
- **Theming / light mode** (dark-primary locked).
- **CI wiring** — the quality bar (oxlint + oxfmt per ADR 0001, typing, the two test seams) is enforced per-PR at build time; wiring CI itself is a later decision.

## Further Notes

- **Fog cleared by this spec**: the Open/All toggle conflict (map "Not yet specified") is resolved — ship the working toggle (this spec's Status toggle decision). Update `map.md`'s Decisions-so-far with a gist of this decision. "Map interactions depth" is bounded (no clustering/layers); "Testing / quality bar" is scoped to the two seams above; deployment specifics stay at build.
- **Domain doc gap**: no `CONTEXT.md`/glossary yet. This spec's Domain vocabulary block is the seed; run `/domain-modeling` to promote it into `CONTEXT.md` if the terms stick.
- **Prototype assets** are reference, not code: `prototypes/visual-design-language/index.html` (directions a/b/c) and `prototypes/detail-panel/index.html` (placements a/b/c) encode the chosen WILDLAND LEDGER direction and popover placement; the spec is the authority where they drift (e.g. Open/All now works; faint bumped to `#828c70`).
- **Contract reality check** (ticket 01): `description` nullable, magnitudes sometimes null, geometry point-or-polygon — every panel promise and every filter branch above respects these; do not add fields the feed cannot supply.