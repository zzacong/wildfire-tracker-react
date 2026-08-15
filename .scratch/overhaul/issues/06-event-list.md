# 06 - Event list panel

Status: resolved
Blocked by: 02

## Answer

Sortable event list panel (`src/components/shell/EventListPanel.tsx` + `events/` sub-components): newest-first default, sort by date and area; row click selects + flies map; selected row highlighted; skeleton/empty states. Committed as `feat(list): add sortable event list panel` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- Sortable list of hazard events; default **newest first**, sortable by date and area.
- Clicking a row selects the event and flies the map to it.
- Shows open events (and recently closed when enabled by issue 07).
