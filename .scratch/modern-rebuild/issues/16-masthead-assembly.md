# 16 — Masthead assembly

**What to build:** The final coherent header — assemble the pieces owned by earlier slices into one WILDLAND LEDGER masthead: brand display, LIVE pulse, the Open/All toggle, the "Updated Xm ago" readout, manual "Refresh now", and the active-filter count — and smoke-test the whole v1 flow (header + filter bar + ledger + ticker + panel + map) as one shell.

**Blocked by:** 10 — Data freshness & resilience, 11 — Filters & search on the derived set, 15 — Open/All status toggle.

**Status:** resolved

- [x] Masthead renders: Space Grotesk bold brand display, LIVE pulse, Open/All segmented toggle, "Updated Xm ago", Refresh now, active-filter count — one consistent header row.
- [x] Reduced motion: LIVE dot solid, no pulse animation.
- [x] Header controls work with the filter bar, ledger, ticker, detail panel, and map together — the full v1 flow is demoable end-to-end as one product shell.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

The masthead is assembled into one coherent WILDLAND LEDGER header. The active-filter count moved out of the `FilterBar` and into the masthead's meta row (so the single visible "N active" readout lives on the header, per the spec's Header decision), where it always renders (`0 active` included) with the same `aria-label="Active filter count"` accessibility convention the FilterBar used.

**Files changed**: `Masthead.tsx` (new `activeFilterCount` prop + count readout), `FilterBar.tsx` (count removed; Clear filters button retained, still driven by `activeFilterCount`), `LedgerRail.tsx` (threads the count to the Masthead), `AppShell.tsx` (passes `activeFilterCount(filters)` from the shell's filter state), and tests.

**Reduced motion**: the LIVE dot uses Tailwind's `animate-pulse` (a CSS animation-duration technique), which the global `@media (prefers-reduced-motion: reduce)` rule in `styles.css` already cuts to `0ms` — no explicit handling added, per the ticket's guidance. The Masthead test emulates `prefers-reduced-motion` and asserts both that the dot is CSS-animated and that the global rule zeroes animation-duration/iteration-count/transition-duration.

**Full v1 flow smoke test** (`AppShell.test.tsx`): one shell render against seeded status-keyed query data (MapLibre stubbed) drives the whole product end-to-end — toggle Open→All (ticker splits Active/Closed, readout shows the All slot's "Updated 5m ago") → apply a magnitude filter (derived set narrows, count reads "1 active", closed fire leaves map and ledger) → select a fire from the ledger (detail dialog opens, labelled by the fire) → Escape closes → Refresh now surfaces fresh data and the readout advances to "Updated just now".

**Tests**: 119 total across 17 files (was 114/16). +5: Masthead 4 (assembled render of all six elements, count always visible, count tracks props, reduced-motion LIVE dot), AppShell 1 (full v1 flow). FilterBar tests were re-balanced: the two count assertions moved to the Masthead, replaced with "leaves the count to the masthead" + "Clear filters only while a filter is active".

**Verification**: `pnpm check` (oxlint --deny-warnings, tsc --noEmit, oxfmt --check, vitest) and `pnpm build` both green.
