# Grilling: Design system accessibility baseline

Type: grilling
Status: open
Blocked by: 03

## Question

The WILDLAND LEDGER direction (ticket 03) is dark-primary with bone-on-forest type and small mono data sizes. What accessibility baseline does the design system hold so the spec's typography scale and tokens are pinned correctly? Decide:

- WCAG target: AA (4.5:1 / 3:1) for all text including the small 10–13px mono data values against forest `#11160f` and panel `#1a2118` backgrounds — which chosen token pairs already pass, and which need adjustment (e.g. faint `#70795f` data labels)?
- Focus-visible states for the map, ledger rows, chips, and detail card — a consistent pattern (not the browser default ring on dark).
- Reduced motion: the LIVE pulse on the ledger head and the marker glow/grow on the dark map under `prefers-reduced-motion`.
- Marker + map accessibility: non-color affordance (size/shape) for fire markers, and an accessible equivalent of the map's marker legend so the map isn't color-only.
- Screen-reader structure for the numbered ledger list and the ticker aggregates (semantic list/landmarks, aria-live for the ticker).

Output: a concrete accessibility bar the spec's design-token and typography sections can encode.

## Answer