# 15 — Open/All status toggle

**What to build:** The segmented Open/All toggle made real (spec decision closing the `issues/` fog: ship the working toggle). Open (default) fetches `status=open`; All fetches `status=all` bounded by `days=30`, with a status-keyed cache. Closed fires get the closed treatment across every surface they touch: muted flame markers, a Closed chip in the ledger and panel, a split active/closed aggregate in the ticker, and the on-map key extended.

**Blocked by:** 09 — Live map tracer bullet, 11 — Filters & search on the derived set, 12 — Ledger rail, 13 — Burn ticker, 14 — Rich fire detail panel.

**Status:** ready-for-agent

- [ ] Segmented Open/All control. Open (default) = `status=open`; All = `status=all` bounded `days=30`; the query/cache slot is keyed by status so toggling swaps cleanly.
- [ ] Closed fires on the map: muted flame (no glow) markers, uniform flame shape + halo retained (no size encoding).
- [ ] On-map key extended: "orange flame = active wildfire; muted flame = closed fire; size and status in the ledger/ticker".
- [ ] Closed chip in the ledger and the panel status reads Closed (from `closed`).
- [ ] Ticker splits active/closed aggregates under All; single count under Open.
- [ ] Recency / magnitude / search filters apply identically under both statuses.
- [ ] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.
