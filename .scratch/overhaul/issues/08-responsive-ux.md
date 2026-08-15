# 08 - Responsive UX + polish

Status: resolved
Blocked by: 05, 06, 07

## Answer

Responsive UX: mobile detail panel as a bottom sheet (`src/components/shell/BottomSheet.tsx`), desktop floating panels; stale-data banner + error overlay (`DataStatus.tsx`); empty/loading/error states in event list; mission-control theme polish (typography, spacing, micro-interactions, reduced-motion). Committed as `feat(ux): responsive layout, stale banner, and polish` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- Responsive-first: desktop = floating panels; mobile = detail panel becomes a **bottom sheet**, controls adapt.
- **Stale-data banner** when serving last-known data after a fetch failure.
- Empty state (no events match filters), loading states, error states.
- Final visual polish of the dark mission-control theme (typography, spacing, micro-interactions).
