# 09 — Live map tracer bullet

**What to build:** The headline moment — real open wildfires on a real map. MapLibre GL + OpenFreeMap render flame markers derived as GeoJSON from a client TanStack Query that fetches the BFF route (ticket 08), with SSR first paint and a "Loading fires…" skeleton on first load. Markers are accessible buttons with one shared selection state, and the map sits behind a thin component seam so later slices can stub it.

**Blocked by:** 08 — BFF data route.

**Status:** ready-for-agent

- [ ] MapLibre GL + OpenFreeMap basemap renders; the map is behind a thin component seam (later tickets stub it in component tests).
- [ ] Markers derive as GeoJSON from the loaded open-wildfires array (one query, no per-fire fetch); first dataset hydrates from the server loader (SSR first paint).
- [ ] "Loading fires…" skeleton until first paint of markers.
- [ ] Uniform flame glyph + dark halo disc (contrast ≥3:1 over any tile); no size-by-magnitude encoding, no number badges.
- [ ] Markers are `tabindex="0"` buttons with `aria-label="<name>, <size> acres"`, Enter/Space selects, `aria-pressed` reflects selection; basemap canvas `aria-hidden`.
- [ ] On-map key text: "orange flame = active wildfire; size and status in the ledger/ticker".
- [ ] One shared selection state (selected fire id) introduced; selecting a marker highlights it with the accent ring + glow.
