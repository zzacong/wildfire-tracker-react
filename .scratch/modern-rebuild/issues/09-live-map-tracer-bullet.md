# 09 — Live map tracer bullet

**What to build:** The headline moment — real open wildfires on a real map. MapLibre GL + OpenFreeMap render flame markers derived as GeoJSON from a client TanStack Query that fetches the BFF route (ticket 08), with SSR first paint and a "Loading fires…" skeleton on first load. Markers are accessible buttons with one shared selection state, and the map sits behind a thin component seam so later slices can stub it.

**Blocked by:** 08 — BFF data route.

**Status:** resolved

- [x] MapLibre GL + OpenFreeMap basemap renders; the map is behind a thin component seam (later tickets stub it in component tests).
- [x] Markers derive as GeoJSON from the loaded open-wildfires array (one query, no per-fire fetch); first dataset hydrates from the server loader (SSR first paint).
- [x] "Loading fires…" skeleton until first paint of markers.
- [x] Uniform flame glyph + dark halo disc (contrast ≥3:1 over any tile); no size-by-magnitude encoding, no number badges.
- [x] Markers are `tabindex="0"` buttons with `aria-label="<name>, <size> acres"`, Enter/Space selects, `aria-pressed` reflects selection; basemap canvas `aria-hidden`.
- [x] On-map key text: "orange flame = active wildfire; size and status in the ledger/ticker".
- [x] One shared selection state (selected fire id) introduced; selecting a marker highlights it with the accent ring + glow.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

MapLibre GL + OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`, center `[-112,43]`, zoom `3.4`, compact attribution, `NavigationControl` bottom-right) renders inside `src/components/map/MapSurface.tsx`, behind the `MapSurface` component seam (`src/test/components/shell/AppShell.test.tsx` stubs it). Markers are built by `buildFireMarkerButton` (`src/components/map/fireMarker.ts`): `tabindex="0"` buttons, `aria-label="<name>, <size> acres"` (rounded, `Not reported` when null), `aria-pressed` reflecting selection, uniform flame glyph on a `--marker-halo` disc, no size/badge encoding. The basemap canvas gets `aria-hidden` on map load.

Data flows from one query: `wildfiresQueryOptions('open')` (`src/lib/wildfires.ts`) — key `['eonet','wildfires','open']`, 5m staleTime, env-aware queryFn (server branch imports `getWildfires('open')` in-process; client fetches the BFF route). `src/routes/index.tsx` loader runs `ensureQueryData` so SSR paints the first dataset; the `QueryClient` is created per-router in `getRouter()` (`src/router.tsx`) with a `Wrap` QueryClientProvider and `dehydrate`/`hydrate` options, exposed to loaders via `createRootRouteWithContext<{ queryClient }>`. Markers derive as GeoJSON through `firesToGeoJson` (`src/lib/fire-geojson.ts`).

Selection lives once in `AppShell` (`selectedFireId` state, click-to-toggle) and passes into MapSurface; the selected marker gets `.fire-marker--selected` (accent ring + glow in `src/styles.css`). "Loading fires…" `<output>` shows while `isLoading && fires.length === 0`; the on-map key text renders per spec. Smoke test: `pnpm build` + node server served the HTML with real fire names, the hydrated `queryClientState`, and `aria-hidden` canvas path — client bundle contains no `eonet-server` code.
