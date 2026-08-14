# 15 — Open/All status toggle

**What to build:** The segmented Open/All toggle made real (spec decision closing the `issues/` fog: ship the working toggle). Open (default) fetches `status=open`; All fetches `status=all` bounded by `days=30`, with a status-keyed cache. Closed fires get the closed treatment across every surface they touch: muted flame markers, a Closed chip in the ledger and panel, a split active/closed aggregate in the ticker, and the on-map key extended.

**Blocked by:** 09 — Live map tracer bullet, 11 — Filters & search on the derived set, 12 — Ledger rail, 13 — Burn ticker, 14 — Rich fire detail panel.

**Status:** resolved

- [x] Segmented Open/All control. Open (default) = `status=open`; All = `status=all` bounded `days=30`; the query/cache slot is keyed by status so toggling swaps cleanly.
- [x] Closed fires on the map: muted flame (no glow) markers, uniform flame shape + halo retained (no size encoding).
- [x] On-map key extended: "orange flame = active wildfire; muted flame = closed fire; size and status in the ledger/ticker".
- [x] Closed chip in the ledger and the panel status reads Closed (from `closed`).
- [x] Ticker splits active/closed aggregates under All; single count under Open.
- [x] Recency / magnitude / search filters apply identically under both statuses.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

The working Open/All toggle is shipped. `AppShell` now holds `status` state (default `'open'`) and threads it through `wildfiresQueryOptions(status)` (the query/cache slot was already keyed by status), `bustCacheAndRefresh` (invalidates `wildfiresQueryKey(status)` — the **active** status's key), the ledger/masthead, and the ticker. `status=all` upstream already sends `days=30` (ticket 08), so toggling swaps cache slots cleanly and stays bounded.

- **Segmented control**: lives in `Masthead` (`src/components/shell/Masthead.tsx`), the WILDLAND LEDGER segmented treatment — hairline-bordered pill, active segment `bg-accent text-accent-ink`, inactive `text-muted`. Native `<input type="radio">` per segment (visually hidden via `sr-only`) inside a wrapping `<label>`, `name="wildfire-status"` groups them; `checked` drives the segment styling; a `has-[:focus-visible]:` ring on the label keeps the global bone focus ring visible around the segment (spec story 20). State is lifted to `AppShell` and passed down.
- **Closed treatment on the map**: `buildFireMarkerButton` adds `fire-marker--closed` when `fire.closed !== null`; `src/styles.css` gives it a muted (`--color-muted`) flame glyph with `filter: none` (no glow), retaining the uniform flame shape + dark halo — no size encoding.
- **On-map key** extended verbatim: "orange flame = active wildfire; muted flame = closed fire; size and status in the ledger/ticker" (`MapSurface`).
- **Ledger**: `LedgerRail` renders a muted `Closed` chip (from `fire.closed`) instead of the accent `Open` chip on closed rows.
- **Panel**: already read `Closed` from `fire.closed` since ticket 14 — verified by the existing `FireDetailPanel` test; no change needed.
- **Ticker**: `BurnTicker` derives the active/closed split from `fires` alone (`closed !== null`) — a single "Active fires" cell under Open, plus a "Closed fires" cell whenever closed fires are present (All). The `aria-live` announcement stays gated to poll-driven aggregate changes; `AppShell` renders `<BurnTicker key={status}>` so a status toggle remounts the live-region gate and never announces the swap.
- **Filters**: `visibleFires` already derives from whichever status's data is live, so recency/magnitude/search apply identically under both statuses (test added under All).

**Files changed**: `AppShell.tsx`, `Masthead.tsx` (+`Masthead.test.tsx`), `LedgerRail.tsx`, `BurnTicker.tsx`, `map/fireMarker.ts`, `map/MapSurface.tsx`, `styles.css`, and extended tests in `AppShell.test.tsx`, `LedgerRail.test.tsx`, `BurnTicker.test.tsx`, `fireMarker.test.ts`, `MapSurface.test.tsx`.

**Tests**: 114 total across 17 files (was 100/16). +14: Masthead 3 (new file), fireMarker 1 (closed class), MapSurface 1 (closed marker class + key text), BurnTicker 3 (single count under Open, split under All, split announcement), LedgerRail 1 (Closed chip), AppShell 5 (toggle fetches `?status=all`, cache-slot swap without refetch, ticker split at the shell seam, Refresh now invalidates the active key only, filters under All).

**Verification**: `pnpm check` (oxlint --deny-warnings, tsc --noEmit, oxfmt --check, vitest) and `pnpm build` both green.
