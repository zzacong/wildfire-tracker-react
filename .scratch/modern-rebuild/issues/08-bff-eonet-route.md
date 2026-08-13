# 08 — BFF data route (EONET v3 wrapper)

**What to build:** The server-side data boundary (ticket 02 architecture, spec "BFF data route"). A TanStack Start server route wraps `GET /events?category=wildfires&status=open|all` behind a Nitro stale-while-revalidate cache and returns the normalized wildfire payload the whole app renders from. The browser never calls NASA directly. This carries the spec's **Seam A** integration tests.

**Blocked by:** 07 — Scaffold & WILDLAND LEDGER design system.

**Status:** resolved

- [x] Route accepts `?status=open|all` and requests the EONET list endpoint with `category=wildfires`.
- [x] Normalized Fire model returned: `id`, `title`, `description` (nullable → fallback text), `link`, `closed` (null while open), `sources` (`IRWIN`/`GDACS` incident URLs), and a single display geometry/date/magnitude chosen as the **newest** `geometry` entry.
- [x] Defensive contract handling: `Polygon` geometry derives a marker point (envelope center); events with zero geometry are dropped; magnitude kept as acres or null.
- [x] Nitro SWR cache with 5m TTL, **keyed by status** — an `open` request never serves an `all` payload or vice-versa.
- [x] Seam A tests (in-process route invocation, upstream `fetch` stubbed): normalized contract shape; status param routing; newest-geometry selection; nullable-description fallback; null magnitude preserved; polygon envelope derivation; malformed/zero-geometry events dropped; no upstream call within TTL + revalidation after; status-cache isolation; first-load failure surfaces as a first-load error.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

Implemented as `src/routes/api/eonet.ts` (route + `handleEonetGet`), `src/lib/eonet-server.ts` (SWR cache service), `src/lib/eonet.ts` (normalization, pre-existing file), `src/routeTree.gen.ts` (regenerated), and `src/routes/api/eonet.test.ts` (Seam A suite, 14 tests).

- **SWR cache** is a hand-rolled in-memory module-level `Map` keyed by status (`open`/`all`) rather than Nitro's `defineCachedFunction`/`useStorage` — chosen so the route is invocable in-process in Vitest with `fetch` stubbed. Semantics: fresh entry served with no upstream call; stale entry (past `EONET_CACHE_TTL_MS` = 5m) served immediately while a background refresh runs; cache miss blocks on upstream. `getWildfires(status)`; `resetEonetCache()` for tests. **Decision (review follow-up, 2026-08-13):** the deviation from the spec's literal "Nitro SWR cache" is accepted — Seam A's in-process testability (no Nitro runtime in Vitest) requires an observable in-memory cache, and the tradeoff (per-instance cache, cold-start reset on Vercel serverless) is acceptable for the 5m TTL. Revisit real Nitro storage-backed caching at the Vercel deployment ticket.
- **Upstream URL**: `https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=<status>`; `status=all` additionally sends `days=30`.
- **Error handling**: invalid/missing `status` → 400 with JSON body; first-load upstream failure → 502 (stale payload is still served if present).
- **Verified**: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` (16 tests), `pnpm build` all pass. Runtime smoke test on the Nitro preview build confirmed `?status=open` → 200 live data, `?status=all` → 200, `?status=bogus` → 400, missing → 400.

## Comments

- 2026-08-13 — Implemented and resolved; ready for `/code-review` before commit.
- 2026-08-13 — `/code-review` run (two axes). Spec: added the missing refresh-failure seam test (stale served + retry, no 502). Standards: collapsed duplicated result construction, dropped unused `fetchImpl` seam param, renamed `polygonEnvelopeCenter` → `polygonBoundsCenter`, removed one comment. Kept the `status`/`fetchedAt`/`stale` envelope (feeds ticket 10's "Updated Xm ago"). Cache-architecture deviation logged in Answer above.
