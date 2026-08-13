# 14 — Rich fire detail panel (popover + bottom sheet)

**What to build:** The rich fire detail panel (ticket 05) — a 340px popover docked top-right over a shaded map that opens from any selection path (marker / ledger / search result) via the shared selection state, shows only the fields EONET v3 actually provides, links out to IRWIN/GDACS for the rest, collapses to a bottom sheet below 820px, and carries full dialog semantics (ticket 06).

**Blocked by:** 09 — Live map tracer bullet, 11 — Filters & search on the derived set.

**Status:** resolved

- [x] 340px floating card docked top-right (`right: 18px; top: 18px`), 14px radius, hairline border, subdued shadow, drag-grip + close in the header; map shades `rgba(17,22,15,.28)` while open and stays live behind the card.
- [x] Opens from any selection path via the one selection state; ticking another fire swaps the card content in place.
- [x] Grounded fields only: status (Open/Closed), size-in-acres hero ("Not reported" when null), last-updated (relative), absolute UTC timestamp, coordinates, EONET ID, source button(s) → IRWIN/GDACS incident pages.
- [x] Dashed absent-fields note — "Containment %, cause, and agency live on the source incident page — not in the EONET feed. Imagery is linked from there too." — never promises what the feed can't supply.
- [x] Dismiss via Escape / ✕ / shade click; the map never scrolls while the panel is open.
- [x] Below 820px: bottom sheet (full-width, rounded top, 62vh cap); header flattens to centered title + close.
- [x] Dialog semantics: `role="dialog"` + `aria-modal`, labelled by the fire name, focus trapped while open, Escape closes, focus returns to the opening marker.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

`FireDetailPanel` (`src/components/shell/FireDetailPanel.tsx`) renders when `AppShell`'s one selection state (`selectedFireId`) resolves against the **full loaded `fires` array** — never the filtered set, so a selected fire stays visible even if filters hide it — and swaps content in place when the selection ticks to another fire.

**Popover:** a 340px card docked top-right of the map region (`right:18px; top:18px`), 14px radius (`--radius-card`), hairline-strong border, subdued shadow, drag-grip + close in the header, over a `rgba(17,22,15,.28)` shade that covers the map (blocks map scroll/pan while open; the feed stays live). **Bottom sheet <820px:** `matchMedia('(max-width: 820px)')` drives the switch via the exported `useIsNarrow` hook (SSR-safe, testable by mocking `window.matchMedia`): full-width, rounded top, 62vh cap, header flattened to centered title + close, shade suppressed.

**Dialog semantics:** a native `<dialog open aria-modal="true" aria-labelledby>` (oxlint's `jsx-a11y/prefer-tag-over-role` mandates the element over `role="dialog"`; computed role stays `dialog`), labelled by the fire name, focus moved in on open, focus trapped in-house via `useFocusTrap` (`src/lib/use-focus-trap.ts`, no new deps), Escape / ✕ / shade click dismiss, focus returns to the opening marker. `useNow` (30s tick) drives the relative last-updated via the shared `formatDataAge`; the size hero reuses `formatFireSize` ("Not reported" on null). Fields are the grounded EONET contract only — status, size, last-updated, absolute UTC timestamp, coordinates (`lng, lat`), EONET ID, IRWIN/GDACS source buttons — plus the verbatim dashed absent-fields note.

**Files changed:** `FireDetailPanel.tsx` (+`FireDetailPanel.test.tsx`) added; `use-focus-trap.ts` added; `AppShell.tsx` wired (`selectedFire` lookup + `clearSelection`); `AppShell.test.tsx` extended (MapSurface stub now renders per-fire marker buttons so selection/wiring is tested at the shell seam). Ticket 14 checklist complete.

**Tests:** 87 total across 14 files (was 71/13). New: 12 `FireDetailPanel` tests (dialog label/aria-modal, grounded fields, Not reported, Closed, ✕/Escape/shade dismiss + focus return, Tab trap, swap-in-place, sheet/popover switch via mocked `matchMedia`) + 4 AppShell wiring tests (open-on-select + Escape focus return, selected-fire-survives-filters, swap-in-place, close button).

**Verification:** `pnpm check` (oxlint --deny-warnings, tsc --noEmit, oxfmt --check, vitest) green; `pnpm build` green.
