# 11 — Filters & search on the derived set

**What to build:** The one visible set (ticket 04) — filters ∧ search slice the loaded array client-side and the map markers re-root onto the resulting derived set, so markers, any list, and counts always agree. A flat one-row filter bar (recency | magnitude | search), an explicit "No fires match" empty state with one-tap Clear filters, and an always-visible active-filter count.

**Blocked by:** 09 — Live map tracer bullet.

**Status:** ready-for-agent

- [ ] Derived-set selector slices the loaded array; markers are re-projected from the derived set (markers == list == counts, never divergent).
- [ ] Recency filter: Any / 24h / 7d, sliced on latest-update `geometry.date`.
- [ ] Magnitude filter: Any / >100 / >1k / >10k acres, sliced on `magnitudeValue`; **null-magnitude fires pass only under Any**.
- [ ] Search: one box, case-insensitive substring over `title` + `description` (client-side, no server round-trip).
- [ ] Filters ∧ search AND into one visible set.
- [ ] "No fires match" empty state + one-tap Clear filters; active-filter count always visible.
- [ ] Flat one-row bar — no nested drawers in v1.
- [ ] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.
