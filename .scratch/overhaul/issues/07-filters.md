# 07 - Filters: status, kind, date range

Status: resolved
Blocked by: 02

## Answer

Filter bar (`src/components/shell/FilterBar.tsx`) with status (open-only default vs include recently closed 30 days), kind seam (only Wildfire wired), date range; feeds EONET `start`/`end`/status via search params + `loaderDeps`. Filter helpers in `src/lib/hazard-filters.ts` + tests. Committed as `feat(filters): add status, kind, and date-range filters` (squash-merged).
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- Status filter: **open only** (default) vs include **recently closed (last 30 days)**.
- Kind filter seam: control renders, only *Wildfire* populated today (no other kinds wired).
- Date range filter via EONET `start`/`end`.
- Filters feed the server loader (loaderDeps) and re-fetch/cache as needed.
