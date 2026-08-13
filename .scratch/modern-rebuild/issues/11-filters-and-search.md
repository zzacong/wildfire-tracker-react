# 11 — Filters & search on the derived set

**What to build:** The one visible set (ticket 04) — filters ∧ search slice the loaded array client-side and the map markers re-root onto the resulting derived set, so markers, any list, and counts always agree. A flat one-row filter bar (recency | magnitude | search), an explicit "No fires match" empty state with one-tap Clear filters, and an always-visible active-filter count.

**Blocked by:** 09 — Live map tracer bullet.

**Status:** resolved

- [x] Derived-set selector slices the loaded array; markers are re-projected from the derived set (markers == list == counts, never divergent).
- [x] Recency filter: Any / 24h / 7d, sliced on latest-update `geometry.date`.
- [x] Magnitude filter: Any / >100 / >1k / >10k acres, sliced on `magnitudeValue`; **null-magnitude fires pass only under Any**.
- [x] Search: one box, case-insensitive substring over `title` + `description` (client-side, no server round-trip).
- [x] Filters ∧ search AND into one visible set.
- [x] "No fires match" empty state + one-tap Clear filters; active-filter count always visible.
- [x] Flat one-row bar — no nested drawers in v1.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

Derived-set slicing lives in `src/lib/fire-filters.ts`: `selectVisibleFires(fires, filters, now)` ANDs three pure filters — recency (`withinRecency`, Any/24h/7d over `Date.parse(fire.geometry.date)` vs `now`), magnitude (`meetsMagnitude`, Any/>100/>1k/>10k on `magnitudeValue`, `>=` threshold so a boundary value passes, and null-magnitude fires pass **only** under Any), and search (`matchesSearch`, trimmed case-insensitive substring over `title` + `description`). `activeFilterCount` counts the non-default dimensions; `RECENCY_OPTIONS`/`MAGNITUDE_OPTIONS` and `FIRE_FILTERS_DEFAULT` drive the bar.

`FilterBar` (`src/components/shell/FilterBar.tsx`) is the flat one-row bar: search box (with per-field × clear, trimmed-aware) + recency select + magnitude select, an always-visible "N active" count, and a "Clear all filters" button that appears only when any filter is active. `FiresEmptyState` is the map-area overlay: "No fires match the current filters" + one-tap Clear filters when the feed had fires but the derived set is empty; a "No fires in this view" variant (no clear button) for an empty feed. `AppShell` owns the filter state, derives `visibleFires` via `useMemo` keyed on `fires`/`filters`/`now` (where `now` ticks through the shared `useNow` hook so fires age out of the 24h/7d windows), re-roots `MapSurface` onto `visibleFires`, and shows the empty-state overlay when the set is empty. Selector logic is exercised **through** the components that render it per spec Seam B (no free-standing selector unit tests): AppShell integration tests cover marker re-rooting, recency slicing, magnitude boundary + null-pass-under-Any, AND composition, empty state + one-tap clear, active counts; FilterBar tests cover the control surface. 71 tests, gate green (`oxlint --deny-warnings`, `oxfmt --check`, `tsc --noEmit`), build + SSR smoke passed.
