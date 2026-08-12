# Research: EONET v3 wildfire data contract

Type: research
Status: resolved
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

Verified live 2026-08-12 against `https://eonet.gsfc.nasa.gov/api/v3` (no API key; CORS `Access-Control-Allow-Origin: *`; rate limit 60 req/min per `X-RateLimit-Limit`; `Cache-Control: no-cache, private`).

### Envelope and event fields

List endpoint: `GET /events?category=wildfires&status=open` returns `{ title, description, link, events: [...] }`.

Each event carries:

- `id` — stable string, e.g. `EONET_22430` (also the detail-URL suffix).
- `title` — e.g. `Wildfire Harris, Rosebud, Montana`.
- `description` — short text, **nullable** (many events have `null`). Typical: `30 Miles SW from Ashland, MT`.
- `link` — EONET detail URL: `/events/EONET_22430`.
- `closed` — `null` while open; ISO timestamp once closed (archive use).
- `categories` — array of `{ id, title }`; wildfires id is the **string** `wildfires` (v2.1's numeric `8` is gone).
- `sources` — array of `{ id, url }`, e.g. `IRWIN` → `https://irwin.doi.gov/observer/incidents/2026-MTMCD-000676`, or `GDACS`. These are the real incident pages; imagery/status/containment live there, not in EONET.
- `geometry` — array of geometries, each `{ magnitudeValue, magnitudeUnit, date, type, coordinates }`.
  - `magnitudeValue` + `magnitudeUnit` — **size in acres for wildfires** (observed `924.30` acres, `8500.00` acres). Great for a detail panel. Null for some events.
  - `date` — latest event timestamp ISO (`2026-08-09T16:55:00Z`).
  - `type` — **`Point`** for these samples. EONET docs allow Polygon too; treat as point-or-polygon defensively.
  - `coordinates` — `[lng, lat]` (GeoJSON order).

### What a detail panel can promise vs. must not

Can show (from EONET directly): name, description (or fallback), current size in acres, latest update timestamp, open/closed status, source link(s) out to IRWIN/GDACS incident pages.
**Absent from EONET:** containment %, cause, responsible agency, dedicated imagery — do NOT promise these in the panel; link out to the incident source instead.

### Filtering (feeds archive roadmap)

- `category=wildfires` — string id filter (verified).
- `status=open|closed|all` — default `open`; `status=all&days=7` returned closed events with populated `closed` timestamps (verified).
- `days=N` — recency window (verified with `days=7`; `days=2` returned empty simply because no events fell in that window).
- Also documented: `start`/`end` (YYYY-MM-DD), `bbox`, `magID`/`magMin`/`magMax`, `limit`.
- Detail endpoint `GET /events/{id}` returns the same per-event shape (verified).

### Live sample (verbatim, 2026-08-12)

Open: `EONET_22430` "Wildfire Harris, Rosebud, Montana", desc "30 Miles SW from Ashland, MT", sources `[IRWIN]`, geometry Point `[-106.634317, 45.195183]`, magnitudeValue `924.30` acres, date `2026-08-09T16:55:00Z`, closed `null`.
Open: `EONET_22424` "Wildfire WEISER KNOLL, Fremont, Wyoming", desc "13 Miles SE from Lander, WY", magnitudeValue `8500.00` acres.
Closed: `EONET_22387` "Wildfire in Australia 1030307", `closed: 2026-08-09T00:00:00Z`, source GDACS.

Full raw samples: see `research/01-eonet-v3-data-contract.md` in this effort's folder.
