# 04 - Markers, clustering, heatmap

Status: resolved
Blocked by: 03

## Answer

Clustered markers (cluster at low zoom, individual at high zoom, zoom-to-cluster on click), native MapLibre heatmap layer with toggle, marker click sets selected event, accessible keyboard-focusable markers. Implemented in `src/components/map/{MapView,AccessibleMarkers,HeatmapToggle,hazard-layers}.tsx`. Committed as `feat(map): add clustered markers, accessible selection, heatmap toggle` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- Marker layer rendering hazard events; clustered at low zoom, individual markers when zoomed in.
- **Heatmap toggle** — native MapLibre heatmap layer as an alternative view.
- Clicking a marker selects the event (drives the detail panel, issue 05).
- Accessible markers (keyboard-focusable, ARIA labels).
