# 14 — Rich fire detail panel (popover + bottom sheet)

**What to build:** The rich fire detail panel (ticket 05) — a 340px popover docked top-right over a shaded map that opens from any selection path (marker / ledger / search result) via the shared selection state, shows only the fields EONET v3 actually provides, links out to IRWIN/GDACS for the rest, collapses to a bottom sheet below 820px, and carries full dialog semantics (ticket 06).

**Blocked by:** 09 — Live map tracer bullet, 11 — Filters & search on the derived set.

**Status:** ready-for-agent

- [ ] 340px floating card docked top-right (`right: 18px; top: 18px`), 14px radius, hairline border, subdued shadow, drag-grip + close in the header; map shades `rgba(17,22,15,.28)` while open and stays live behind the card.
- [ ] Opens from any selection path via the one selection state; ticking another fire swaps the card content in place.
- [ ] Grounded fields only: status (Open/Closed), size-in-acres hero ("Not reported" when null), last-updated (relative), absolute UTC timestamp, coordinates, EONET ID, source button(s) → IRWIN/GDACS incident pages.
- [ ] Dashed absent-fields note — "Containment %, cause, and agency live on the source incident page — not in the EONET feed. Imagery is linked from there too." — never promises what the feed can't supply.
- [ ] Dismiss via Escape / ✕ / shade click; the map never scrolls while the panel is open.
- [ ] Below 820px: bottom sheet (full-width, rounded top, 62vh cap); header flattens to centered title + close.
- [ ] Dialog semantics: `role="dialog"` + `aria-modal`, labelled by the fire name, focus trapped while open, Escape closes, focus returns to the opening marker.
- [ ] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.
