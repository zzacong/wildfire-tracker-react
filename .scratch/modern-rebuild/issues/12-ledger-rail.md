# 12 — Ledger rail

**What to build:** The numbered WILDLAND LEDGER rail of fires (tickets 03/06) — a 372px list rendering the derived set, where each row is an accessible button that drives the shared selection state shared with markers, with the selection tint/left-rail, row hover, a status chip, and a LIVE pulse on the ledger head.

**Blocked by:** 11 — Filters & search on the derived set.

**Status:** ready-for-agent

- [ ] 372px rail, `26px 24px` padding, 34px number column, `14px` gap; rows carry inline JetBrains Mono metadata; sharp radii.
- [ ] Rows are buttons in a semantic `<ol>`, keyboard-orderable, accessible name = fire name + size, `aria-pressed` reflects selection.
- [ ] Selected row: tint `rgba(242,103,43,.08)` + 2px orange left rail; hover `rgba(242,236,226,.04)`.
- [ ] Status chip on each row (Open; the Closed treatment arrives with ticket 15).
- [ ] LIVE pulse on the ledger head; static (solid dot) under `prefers-reduced-motion`.
- [ ] Selecting a row drives the same shared selection state as the markers.
- [ ] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.
