# Prototype: Rich fire detail panel

Type: prototype
Status: resolved
Blocked by: 01
Claimed by: agent (this session)

## Question

What does the rich fire detail panel look like and show? Design:

- Placement: sidebar vs popover vs full-screen route.
- Fields shown — grounded strictly in what ticket 01 proves EONET v3 actually returns.
- Layout, imagery/source links, mobile behavior, and how it opens from a marker and from search/filters.

Use `/design-taste-frontend` and `/impeccable`. Blocked by research ticket 01 — the panel must only promise fields that exist in the data.

## Answer

**Chosen placement: POPOVER — a floating docked card over the map (variant B).** Decided live 2026-08-12 against a three-way prototype on a real MapLibre + OpenFreeMap map, in the locked WILDLAND LEDGER language. Sidebar (rail-integrated) and Full-screen (route takeover) placements rejected. Field set approved as-is.

### Prototype asset

`prototypes/detail-panel/index.html` — a throwaway page with all three placements switchable via `?v=a|b|c` (arrow keys / bottom switcher bar). Variant B is the winner; A and C stay in the file as rejected placements. Includes the v1 filter bar (recency + magnitude + search, per ticket 04) to exercise how the panel opens from filters.

### Placement

- **Popover**: a `340px` floating card docked top-right over the map (`right: 18px; top: 18px`), `14px` radius, `rgba(242,236,226,.22)` border, subdued drop shadow, drag-grip + close in the header. The map stays the stage — it remains live behind the card; opening a fire shades the map (`rgba(17,22,15,.28)`) so the detail reads. Ticking another fire swaps the card content in place. Closing (✕, shade click, or Escape) drops back to the map only.
- The Single-Responsibility point for the door-by convention: the panel opens from **any** selection path — marker click, ledger row, or a search/filter result — because ticket 04's one visible set drives markers, list, and counts identically. One selection state, one panel.

### Grounded fields (locked)

Panel promises **only** what ticket 01 verified EONET v3 returns:
- Status (Open / Closed, from `closed`)
- Size in acres (hero figure, from `magnitudeValue` + `magnitudeUnit`; "Not reported" when null)
- Last updated (relative, from `geometry.date`)
- Timestamp (absolute UTC)
- Coordinates (lat/lng)
- EONET ID
- **Source button(s)** → out to IRWIN / GDACS incident pages (the real incident home)
- **Absent-fields note**: a dashed callout — "Containment %, cause, and agency live on the source incident page — not in the EONET feed. Imagery is linked from there too." — so the panel never promises what the feed can't supply.

### Mobile behavior

Popover collapses to a **bottom sheet** below `820px` (full-width, rounded top, `62vh` cap); the card header flattens to a centered title + close. Ledger → top sheet; full-screen variant scales its type down. Entering the ticket answered the placement question; the sheet degradation is the concrete v1 mobile interaction.

### Contracts the spec can encode

- Panel = one component keyed off the single selected event; no per-event fetch (ticket 02's one-query model).
- Markers carry the selection state visually (accent ring + glow) and the panel reflects it.
- Escape / shade / ✕ all dismiss; the map never scrolls while a panel is open.

### Flagged (not resolved here, needs a decision before spec-writing)

The v1 prototype shell carries an **Open/All segmented toggle** (borrowed from ticket 03's component aesthetic) even though ticket 04 ruled status a non-filter for v1 (open by construction; closed = archive roadmap). The detail panel work surfaced the conflict — which of the two wins in the build, or whether the toggle is a trimmed-edition relic, is a small residual decision. Graduated to map fog (see map "Not yet specified").

### Newly surfaced

- Popover **dialog semantics** (focus trap, aria roles, Escape) now interact with ticket 06's accessibility baseline — the panel should be named there.
