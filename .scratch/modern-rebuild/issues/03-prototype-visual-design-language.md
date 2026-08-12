# Prototype: Visual design language

Type: prototype
Status: resolved
Blocked by:

## Question

What is the redesigned look and feel of the rebuilt tracker? Produce:

- A visual direction (dark mission-control vs clean light civic vs themeable) — chosen with the user, not assumed.
- A design token set: color palette, typography scale, spacing, radii, elevation.
- The component aesthetic the whole rebuild builds on (panels, markers, buttons, filters, cards).

Use `/design-taste-frontend` and `/impeccable` to drive the direction. Link the prototype as an asset. This decides the design system every v1 screen uses.

## Answer

**Chosen direction: WILDLAND LEDGER (variant C), with the glowing flame marker from Mission Control (variant A).** Decided live 2026-08-12 against a three-way prototype on a real MapLibre + OpenFreeMap map with EONET-v3-shaped mock data.

### Prototype asset

`prototypes/visual-design-language/index.html` — one throwaway page, three structurally different variants switchable via `?variant=a|b|c` and a floating bottom bar (arrow keys too). Variant C is the winner; its marker styling now carries A's glow. Variants A and B stay in the file as the rejected directions.

### Direction

- **WILDLAND LEDGER** — a public service with the presence of a situation room. Bold display typography over a dark forest map, a numbered ledger rail of fires, a bottom burn-ticker of live aggregates. Reads as authoritative and calm rather than alarmist; the map is the stage, the ledger is the ledger.
- **Marker treatment (from A):** glowing flame markers (drop-shadow `rgba(242,103,43,.85)` on the flame glyph) — the one fire-color element that can "pop" against the dark map; everything else stays restrained.
- The light civic and dark mission-control directions are rejected; the design system is **dark-primary, not themeable** for v1 (see map fog: accessibility baseline graduated below).

### Design tokens (locked)

- **Palette** — forest `#11160f` (bg), panel `#1a2118`, border `rgba(242,236,226,.12)` / `.22`, bone `#f1ece2` (text), muted `#a7b09d`, faint `#70795f`, **signal orange accent `#f2672b`** (single accent — fires, LIVE, links, selection). One accent, locked; no secondary hue.
- **Type** — Space Grotesk 400/500/700 for display + UI; JetBrains Mono for all data values (sizes, coordinates, timestamps, ticker numbers). Display weight 700, `-0.02em` tracking, tight leading for the masthead; mono `10–13px` for data labels.
- **Spacing** — ledger rail `372px` wide; rail padding `26px 24px`; entry grid `34px` number column, `14px` gap; ticker stat cells `14px 18px` padding. Generous negative space in the rail, dense data in the ticker.
- **Radii** — one scale: sharp ledger rows and ticker (`0–8px`), `14px` on the overlay detail card. Consistent: interactive chips `8px`, cards `14px`, no pills/mixed rounding.
- **Elevation** — flat surfaces separated by hairline borders `rgba(242,236,226,.12)`; the detail card lifts with `rgba(242,236,226,.22)` border + backdrop-blurred ticker. No drop shadows except the fire glow.
- **Component aesthetic** — bordered flat panels (no cards-walls), numbered fire ledger rows with inline mono metadata, segmented Open/All toggle, bottom aggregate ticker, overlay detail card, `rgba(242,103,43,.08)` selection tint + `2px` orange left-rail accent on selected row, `rgba(242,236,226,.04)` row hover.

### Newly surfaced decisions (graduated to fog/map)

- **Accessibility on the design system** — bone-on-forest and the small mono sizes are chosen; the AA-contrast baseline, focus states, and reduced-motion for the ticker/LIVE pulse need a concrete decision before the spec pins typography scale → graduated from map fog to a new ticket (06).
- **Detail panel visual language** — this ticket locks C's panel/card aesthetic; the rich fire detail panel (ticket 05) now builds on it directly.

