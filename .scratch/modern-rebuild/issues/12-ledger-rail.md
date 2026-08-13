# 12 — Ledger rail

**What to build:** The numbered WILDLAND LEDGER rail of fires (tickets 03/06) — a 372px list rendering the derived set, where each row is an accessible button that drives the shared selection state shared with markers, with the selection tint/left-rail, row hover, a status chip, and a LIVE pulse on the ledger head.

**Blocked by:** 11 — Filters & search on the derived set.

**Status:** resolved

- [x] 372px rail, `26px 24px` padding, 34px number column, `14px` gap; rows carry inline JetBrains Mono metadata; sharp radii.
- [x] Rows are buttons in a semantic `<ol>`, keyboard-orderable, accessible name = fire name + size, `aria-pressed` reflects selection.
- [x] Selected row: tint `rgba(242,103,43,.08)` + 2px orange left rail; hover `rgba(242,236,226,.04)`.
- [x] Status chip on each row (Open; the Closed treatment arrives with ticket 15).
- [x] LIVE pulse on the ledger head; static (solid dot) under `prefers-reduced-motion`.
- [x] Selecting a row drives the same shared selection state as the markers.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

`LedgerRail` now takes the derived set + shared selection and renders the numbered WILDLAND LEDGER rail.

- **Files changed**: `src/components/shell/LedgerRail.tsx` (rail list), `src/components/shell/AppShell.tsx` (wires `visibleFires`/`selectedFireId`/`onSelectFire` into the rail), `src/components/shell/LedgerRail.test.tsx` (new, co-located).
- **What was built**: 372px rail under the existing Masthead; each fire renders as a real `<button>` inside a semantic `<ol>`/`<li>`, keyboard-orderable with the global `:focus-visible` ring. Accessible name = `<title>, <formatFireSize>` (same separator as the map markers), `aria-pressed` reflects `selectedFireId`. Row grid `34px 1fr auto` with 14px gaps; zero-padded index in the 34px JetBrains Mono column; name (Space Grotesk 600), accent mono acres (`formatFireSize`, `Not reported` when null), and a JetBrains Mono meta line carrying the Open status chip · update age (`useNow` + `formatDataAge`) · lat/lng · source. Selected row: `rgba(242,103,43,.08)` tint + 2px `border-l-accent` rail + `rounded-row`; hover `rgba(242,236,226,.04)`. Selection flows through AppShell's existing click-to-toggle `onSelectFire` — the same shared state the markers drive. LIVE pulse: verified the global `prefers-reduced-motion: reduce` rule (`src/styles.css`) already cuts the Masthead dot's `animate-pulse` to 0ms, so it renders solid — no explicit handling added.
- **Tests**: `LedgerRail.test.tsx`, 6 tests at Seam B with seeded `fire()` fixtures and a stateful harness replicating AppShell's toggle: rows render for the derived set; each row is a button in an `<ol>` with accessible name "name, size acres"; `aria-pressed` reflects selection; clicking calls `onSelectFire`; re-clicking a selected row toggles it off; Open chip renders per row.
- **Verification**: `pnpm check` (lint + typecheck + format:check + test — 14 files, 77 tests) and `pnpm build` both pass; `rounded-row` confirmed generated from `--radius-row` in the built CSS.
