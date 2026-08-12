# Grilling: Design system accessibility baseline

Type: grilling
Status: resolved
Blocked by: 03
Claimed by: agent (deepseek session)

## Question

The WILDLAND LEDGER direction (ticket 03) is dark-primary with bone-on-forest type and small mono data sizes. What accessibility baseline does the design system hold so the spec's typography scale and tokens are pinned correctly? Decide:

- WCAG target: AA (4.5:1 / 3:1) for all text including the small 10–13px mono data values against forest `#11160f` and panel `#1a2118` backgrounds — which chosen token pairs already pass, and which need adjustment (e.g. faint `#70795f` data labels)?
- Focus-visible states for the map, ledger rows, chips, and detail card — a consistent pattern (not the browser default ring on dark).
- Reduced motion: the LIVE pulse on the ledger head and the marker glow/grow on the dark map under `prefers-reduced-motion`.
- Marker + map accessibility: non-color affordance (size/shape) for fire markers, and an accessible equivalent of the map's marker legend so the map isn't color-only.
- Screen-reader structure for the numbered ledger list and the ticker aggregates (semantic list/landmarks, aria-live for the ticker).

Output: a concrete accessibility bar the spec's design-token and typography sections can encode.

## Answer

**Accessibility bar decided live 2026-08-12** (grilling, all five questions approved as recommended). Computed WCAG 2.1 AA contrast ratios ground every token call.

### Contrast baseline (WCAG 2.1 AA, 4.5:1 for all text at any size)

- bone `#f1ece2` on forest `#11160f` (15.57) and panel `#1a2118` (13.99) — **pass**
- muted `#a7b09d` on forest (8.15) / panel (7.33) — **pass**
- accent `#f2672b` on forest (5.89) / panel (5.30) — **pass** for normal text; `#13160f` on accent (toggle active, src button) 5.87 — **pass**
- **`faint` token changed `#70795f` → `#828c70`** (4.66 on panel / 5.18 on forest) so the 10–13px mono data labels (ledger `.num`/`.meta`, ticker `.k`, detail `.k`) meet AA. Three-tier hierarchy (bone→muted→faint) preserved; `#70795f` no longer used for any text.
- Hairlines `rgba(242,236,226,.12)` are decorative, not control boundaries — no 3:1 requirement.

### Focus-visible

- One ring token everywhere: `2px` bone `#f1ece2` outline + `2px` offset. Keyboard-navigable only (`:focus-visible`).
- Map markers get a soft dark halo behind the glyph so the ring + flame stay ≥3:1 over any basemap tile (light or dark). The same halo is the Q4 contrast backing.

### Reduced motion (`@media (prefers-reduced-motion: reduce)`)

- All animation and transition cut to `0ms`: LIVE dot renders solid accent (no `vC-blink`), selected marker ring static (no pulse), row hover / marker tip fades removed.

### Markers + map (non-color + legend)

- Uniform flame glyph (shape carries "this is a fire" independent of color) + dark halo disc (contrast over any tile). No size-by-magnitude encoding, no number badges.
- Small on-map key: "orange flame = active wildfire; size and status in the ledger/ticker" — magnitude is not encoded by marker size.

### Screen-reader + keyboard structure

- Ledger = semantic `<ol>`/`<li>` of **buttons** (accessible name = fire name + size), keyboard-orderable, `aria-pressed` reflects selection.
- Ticker = `aria-live="polite"` region announcing **changed aggregates only** on the 5m poll.
- Markers = `tabindex="0"` buttons, `aria-label="<name>, <size> acres"`, Enter/Space opens the panel, `aria-pressed` for selection; basemap canvas `aria-hidden`.
- Detail panel (per ticket 05) = `role="dialog"` + `aria-modal`, labelled by the fire name, **focus trapped** while open, **Escape** closes, focus returns to the opening marker.

### Encoded into the design tokens

- `--c-faint` = `#828c70` (replaces `#70795f`); `--focus-ring` = `2px` bone outline + `2px` offset; `--marker-halo` = dark disc behind the flame; `--motion-reduce` = all transitions `0ms` under the media query.

No new fog graduated; the popover-dialog fog item is now answered (see map update).