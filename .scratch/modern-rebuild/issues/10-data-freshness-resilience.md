# 10 — Data freshness & resilience

**What to build:** Stale-before-replace freshness UX (ticket 02) on top of the live map. The client query polls every 5m — paused when the tab is hidden, refreshing on re-focus — with an "Updated Xm ago" readout, silent background swaps, a non-blocking banner + Retry when a refresh fails, a full-screen error only when the first load itself fails, and a manual "Refresh now".

**Blocked by:** 09 — Live map tracer bullet.

**Status:** resolved

- [x] 5m client poll; polling pauses on tab hide/blur; a refresh fires on tab re-focus.
- [x] "Updated Xm ago" readout shown.
- [x] Background refresh keeps last-known-good markers visible and swaps silently.
- [x] Failed background refresh: stale dataset retained, non-blocking banner ("Couldn't refresh — showing data from Xm ago") + Retry button.
- [x] Failed **first** load only: full-screen error + retry.
- [x] Manual "Refresh now" busts the client cache and surfaces fresh data immediately.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

Freshness config lives on the one query (`src/lib/wildfires.ts`): `wildfiresQueryOptions` now carries `refetchInterval: WILDFIRES_POLL_INTERVAL_MS` (5m), `refetchIntervalInBackground: false` (poll pauses while the tab is hidden) and `refetchOnWindowFocus: 'always'` (a refresh fires on re-focus, un-gated by the 5m staleTime). TanStack Query retains last-known-good `data` during a background refetch, so markers swap silently and the "Loading fires…" skeleton stays first-load-only (`isLoading = isFetching && fires.length === 0`).

Freshness readout: `FreshnessReadout` (`src/components/shell/FreshnessReadout.tsx`) renders "Updated Xm ago" from the query's `dataUpdatedAt`, ticking every 30s via the shared `useNow` hook (`src/lib/use-now.ts`, which pauses while the tab is hidden), using pure formatters in `src/lib/freshness.ts` (`minutesSince` / `formatUpdatedAgo` / `formatDataAge`, hours-aware, floors to whole minutes, clamps future timestamps to "just now"). It and the manual "Refresh now" button live in the Masthead (`src/components/shell/Masthead.tsx`), threaded through `LedgerRail`; a spinner shows while `isFetching`.

Failure UX is split in `AppShell` by `data` presence: `isError && !data` renders the full-screen `FirstLoadError` (role=alert + Retry); `isError && data` keeps the stale set visible and renders the non-blocking `RefreshBanner` (`<output>` + mono text "Couldn't refresh — showing data from Xm ago" + Retry) above the map. Manual "Refresh now" and both Retry buttons call one handler — `invalidateQueries({ queryKey: wildfiresQueryKey('open') })` — which marks the client cache stale and refetches immediately, surfacing fresh data. Tests at the component seam (Seam B): readout text, first-load error + recovery via Retry, stale-retention banner on refresh failure, manual refresh surfacing fresh data, `useNow` pause/resume on tab visibility — plus query-config assertions (5m poll, pause-hidden, refocus-refetch). 52 tests, gate green, build + SSR smoke passed.
