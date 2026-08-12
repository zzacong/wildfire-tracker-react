# Grilling: Filters & search scope

Type: grilling
Status: resolved
Blocked by:

## Question

What filters and search does v1 ship, exactly? Decide:

- The filter set: status (open only vs all), date/recency range, magnitude, geographic extent?
- Whether filters are applied server-side (EONET query params) or client-side over the loaded set — and how that interacts with the freshness architecture.
- How search behaves: what fields are searched (title, description, location), which dataset (loaded events vs a server-side query), and the empty/edge states.

Output: a user-facing filter & search contract the spec and UI build from.

## Answer

Decided 2026-08-12 (grilled with the driver; all recommendations accepted).

**Filter set — recency + magnitude, no status, no geographic.** The open-fire feed makes status a non-filter (open by construction; closed history is the archive roadmap). The map viewport is the spatial filter; pan/zoom shapes what's shown — no bbox control in v1. Filter bar carries: recency (Any time / 24h / 7d, sliced on latest-update `geometry.date`) and magnitude thresholds (Any / >100 / >1k / >10k acres, sliced on `magnitudeValue`; null-magnitude fires pass only under Any).

**Search — one box, title + description.** Case-insensitive substring over `title` and `description` (EONET has no structured location field; `description` is the loose "30 Miles SW from Ashland, MT" text). Client-side over the loaded open set, no server round-trip.

**Composition — filters ∧ search narrow everything.** One visible set drives the map markers, any list/ledger, and count readouts identically — never a divergence between "what's on the map" and "what's in the list."

**Edge states.** Explicit empty state ("No fires match") with one-tap "Clear filters" reset; active-filter count always visible; a magnitude filter applies only to non-null magnitudes (under "Any" nulls still show).

**Interactions.** Keep the bar flat — one row (recency | magnitude | search), no nested drawers in v1. Detail-panel density is owned by ticket 05.
