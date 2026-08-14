# 02 - Server-side EONET data layer

Status: claimed
Blocked by: 01

Fetch hazard events server-side, browser never calls EONET:

- Server function (GET) hitting `https://eonet.gsfc.nasa.gov/api/v3/events` with `Accept: application/json`.
- Route loader + ~15 min TTL cache (module-level map + `Cache-Control` headers), stale-while-revalidate.
- Enforce **1000-event cap** server-side (drop beyond cap).
- Normalize the payload into the domain shape: id, title, kind (map EONET category → Kind), status (open/closed from `closed`), geometry (lon/lat point), area (normalized to acres, source unit recorded), dates, description, source links.
- Drop events without a usable geometry.
- On fetch failure: return last-known data + `isStale` flag for the banner.
- Unit tests for normalization + cap + status derivation (Vitest).
