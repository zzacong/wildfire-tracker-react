# 02 - Server-side EONET data layer

Status: resolved
Blocked by: 01

## Answer

Server-side EONET fetch (`src/lib/eonet.server.ts`) with TTL cache, stale-while-revalidate, 1000-event cap, normalization to domain shape (`src/lib/hazard-event.ts`), geometry drop, failure fallback with `isStale`. Loader + Cache-Control headers in `src/lib/hazard-events.ts`. 28 unit tests. Committed as `feat(data): add server-side EONET data layer with caching and cap` (squash-merged).

Fetch hazard events server-side, browser never calls EONET:

- Server function (GET) hitting `https://eonet.gsfc.nasa.gov/api/v3/events` with `Accept: application/json`.
- Route loader + ~15 min TTL cache (module-level map + `Cache-Control` headers), stale-while-revalidate.
- Enforce **1000-event cap** server-side (drop beyond cap).
- Normalize the payload into the domain shape: id, title, kind (map EONET category → Kind), status (open/closed from `closed`), geometry (lon/lat point), area (normalized to acres, source unit recorded), dates, description, source links.
- Drop events without a usable geometry.
- On fetch failure: return last-known data + `isStale` flag for the banner.
- Unit tests for normalization + cap + status derivation (Vitest).
