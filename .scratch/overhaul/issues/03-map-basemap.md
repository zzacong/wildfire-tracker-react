# 03 - Map basemap + layout shell

Status: resolved
Blocked by: 01

## Answer

MapLibre GL JS + OpenFreeMap dark basemap full-bleed; app shell (`src/components/shell/*`) with floating filter/legend bar + event list + detail panel slots; dark mission-control theme tokens in `src/styles.css`; OpenFreeMap attribution auto-rendered. Exports selection context (`src/lib/selection.tsx`) and map accessor (`src/lib/map-accessor.tsx`). Committed as `feat(map): add MapLibre dark basemap and app shell` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- MapLibre GL JS + OpenFreeMap **dark** style, full-bleed map filling the viewport.
- App shell: floating filter/legend bar + detail panel + event list positioned over the map.
- Dark "mission control" theme tokens (fire-orange/red accents, glassy panels) wired through Tailwind/shadcn.
- Attribution for OpenFreeMap visible per its terms.
