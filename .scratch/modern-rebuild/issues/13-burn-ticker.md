# 13 — Burn ticker

**What to build:** The bottom burn-ticker of live aggregates (tickets 03/06) — a JetBrains Mono strip showing the count for the visible (derived) set, reflective of filters and search, announced politely to screen readers only when aggregates change. (The active/closed split lands with ticket 15.)

**Blocked by:** 11 — Filters & search on the derived set.

**Status:** ready-for-agent

- [ ] Bottom ticker strip shows the count aggregate for the visible set; numbers update with filters/search.
- [ ] `aria-live="polite"` region announcing **changed aggregates only** on a 5m poll (no full re-announcement).
- [ ] Data rendered in JetBrains Mono, dense stat-cell layout per the design tokens.
- [ ] Pulse/glow animation cut to `0ms` under `prefers-reduced-motion`.
- [ ] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.
