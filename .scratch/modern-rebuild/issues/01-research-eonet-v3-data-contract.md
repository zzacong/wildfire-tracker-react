# Research: EONET v3 wildfire data contract

Type: research
Status: open
Blocked by:

## Question

What does the NASA EONET v3 API actually return for wildfire events, so the spec's data contract and detail panel can promise real fields? Specifically:

- Full field shape of `GET /events?category=wildfires&status=open` — `id`, `title`, `description`, `link`, `closed`, `categories`, `sources`, `geometry`, magnitude.
- Geometry shape: are wildfires points, polygons, or both? Multi-geometry events?
- What per-event fields exist that a "rich detail panel" could show — size/acres, containment %, cause, status, responsible agency, imagery links. Which of these are simply absent from EONET (so we must show "unavailable" or source from elsewhere)?
- How `days`, `start`/`end`, `status=all` filtering works (feeds the later archive roadmap).
- Rate limits, CORS, caching guidance.
- A live sample of a few real wildfire events (fields + values), captured at resolution time.

## Answer
