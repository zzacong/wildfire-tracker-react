# Grilling: Data freshness & fetching architecture

Type: grilling
Status: resolved
Blocked by:

## Question

How fresh must the live map be, and what data architecture delivers that on TanStack Start? Decide:

- Fetch path: server loader (SSR, cached) vs client TanStack Query with polling vs a server function + query on the client.
- Refetch cadence: 5m, 15m, on-load only? stale-while-revalidate handling.
- How one EONET request feeds the map markers, the filters, and the detail panel (shared cache, derived state).
- Loading / error / stale-while-revalidate UX for a public product.

Output: a concrete data-flow decision the spec can encode.

## Answer

**Fetch path — BFF-cached, SSR first paint, client SWR through the route.** The browser never calls EONET directly. A TanStack Start server route wraps `GET /events?category=wildfires&status=open` behind a Nitro stale-while-revalidate cache (5m TTL); the server loader hydrates the first dataset so SSR paints markers before any client round-trip; a client TanStack Query (`['eonet','wildfires','open']`) refetches through that route on an interval + manual refresh, honoring the upstream 60/min-per-IP cap and EONET's `no-cache` headers at scale (one upstream fetch serves all visitors in a window).

**Cadence — 5m client poll / 5m upstream TTL, poll paused when tab hidden.** TanStack Query `refetchInterval` 5m; SWR keeps the previous dataset visible while revalidating; upstream cache revalidates at most every 5m. Polling pauses on `visibilitychange`/blur and a refresh fires on tab re-focus. A manual "Refresh now" action busts the client cache and surfaces fresh data immediately. The BFF cache makes fast polling near-free, so freshness is a UX choice, not a cost trade.

**One request feeds everything — single dataset, derived state.** The EONET list payload already carries every detail-panel field (verified in research), so there is no per-event fetch. One query holds the open-wildfires array as the single source of truth; map markers derive from it as GeoJSON; filters & search slice it client-side (no refetch — the dataset is tens-to-hundreds of events); the detail panel is a selected-event-id pointing into the same array. A refresh atomically swaps the whole array, keeping markers/filters/detail consistent.

**UX — stale-before-replace.** First load: map skeleton + "Loading fires…" until first paint, then markers. Background refresh keeps last-known-good markers visible with a "Updated Xm ago" readout and swaps silently. Refresh failure: keep the stale-but-known-good dataset, show a non-blocking banner ("Couldn't refresh — showing data from Xm ago") with a Retry button. Only a failed _first_ load (nothing to show yet) gets a full-screen error + retry.
