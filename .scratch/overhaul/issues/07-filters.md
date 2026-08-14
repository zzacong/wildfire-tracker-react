# 07 - Filters: status, kind, date range

Status: ready-for-agent
Blocked by: 02
Skills: load `/design-taste-frontend` and `/impeccable` before building any UI for this ticket.

- Status filter: **open only** (default) vs include **recently closed (last 30 days)**.
- Kind filter seam: control renders, only *Wildfire* populated today (no other kinds wired).
- Date range filter via EONET `start`/`end`.
- Filters feed the server loader (loaderDeps) and re-fetch/cache as needed.
