# 05 - Rich detail panel

Status: resolved
Blocked by: 02, 03

## Answer

Rich slide-over detail panel (`src/components/shell/DetailPanel.tsx`): area (acres), status, start/close dates, description, source links + EONET link; close/Escape resets selection; keyboard accessible. Formatting helpers in `src/components/shell/detail/format.ts` + tests. Committed as `feat(detail): implement rich detail panel` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

Slide-over detail panel for a selected hazard event:

- Area (acres, normalized), status (open/closed), start date, close date, description.
- Source links back to the reporting agencies (IRWIN/GDACS/…), plus EONET event link.
- Close/reset selection; keyboard accessible.
