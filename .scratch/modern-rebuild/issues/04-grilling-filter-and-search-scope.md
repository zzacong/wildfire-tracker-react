# Grilling: Filters & search scope

Type: grilling
Status: open
Blocked by:

## Question

What filters and search does v1 ship, exactly? Decide:

- The filter set: status (open only vs all), date/recency range, magnitude, geographic extent?
- Whether filters are applied server-side (EONET query params) or client-side over the loaded set — and how that interacts with the freshness architecture.
- How search behaves: what fields are searched (title, description, location), which dataset (loaded events vs a server-side query), and the empty/edge states.

Output: a user-facing filter & search contract the spec and UI build from.

## Answer
