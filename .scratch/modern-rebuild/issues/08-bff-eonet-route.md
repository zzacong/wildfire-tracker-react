# 08 — BFF data route (EONET v3 wrapper)

**What to build:** The server-side data boundary (ticket 02 architecture, spec "BFF data route"). A TanStack Start server route wraps `GET /events?category=wildfires&status=open|all` behind a Nitro stale-while-revalidate cache and returns the normalized wildfire payload the whole app renders from. The browser never calls NASA directly. This carries the spec's **Seam A** integration tests.

**Blocked by:** 07 — Scaffold & WILDLAND LEDGER design system.

**Status:** ready-for-agent

- [ ] Route accepts `?status=open|all` and requests the EONET list endpoint with `category=wildfires`.
- [ ] Normalized Fire model returned: `id`, `title`, `description` (nullable → fallback text), `link`, `closed` (null while open), `sources` (`IRWIN`/`GDACS` incident URLs), and a single display geometry/date/magnitude chosen as the **newest** `geometry` entry.
- [ ] Defensive contract handling: `Polygon` geometry derives a marker point (envelope center); events with zero geometry are dropped; magnitude kept as acres or null.
- [ ] Nitro SWR cache with 5m TTL, **keyed by status** — an `open` request never serves an `all` payload or vice-versa.
- [ ] Seam A tests (in-process route invocation, upstream `fetch` stubbed): normalized contract shape; status param routing; newest-geometry selection; nullable-description fallback; null magnitude preserved; polygon envelope derivation; malformed/zero-geometry events dropped; no upstream call within TTL + revalidation after; status-cache isolation; first-load failure surfaces as a first-load error.
