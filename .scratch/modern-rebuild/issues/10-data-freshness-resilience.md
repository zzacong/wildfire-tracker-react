# 10 — Data freshness & resilience

**What to build:** Stale-before-replace freshness UX (ticket 02) on top of the live map. The client query polls every 5m — paused when the tab is hidden, refreshing on re-focus — with an "Updated Xm ago" readout, silent background swaps, a non-blocking banner + Retry when a refresh fails, a full-screen error only when the first load itself fails, and a manual "Refresh now".

**Blocked by:** 09 — Live map tracer bullet.

**Status:** ready-for-agent

- [ ] 5m client poll; polling pauses on tab hide/blur; a refresh fires on tab re-focus.
- [ ] "Updated Xm ago" readout shown.
- [ ] Background refresh keeps last-known-good markers visible and swaps silently.
- [ ] Failed background refresh: stale dataset retained, non-blocking banner ("Couldn't refresh — showing data from Xm ago") + Retry button.
- [ ] Failed **first** load only: full-screen error + retry.
- [ ] Manual "Refresh now" busts the client cache and surfaces fresh data immediately.
