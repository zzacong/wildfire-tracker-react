# EONET v3 Wildfire Data Contract — live sample

Sampled live: 2026-08-12 via `curl https://eonet.gsfc.nasa.gov/api/v3/...` (no API key).

## Headers observed

- `Access-Control-Allow-Origin: *`
- `X-RateLimit-Limit: 60`, `X-RateLimit-Remaining: 58`
- `Cache-Control: no-cache, private`
- Server: Apache

## Open wildfire events (verbatim, limited)

`GET /events?category=wildfires&status=open&limit=2`

```json
{
  "title": "EONET Events",
  "description": "Natural events from EONET.",
  "link": "https://eonet.gsfc.nasa.gov/api/v3/events",
  "events": [
    {
      "id": "EONET_22430",
      "title": "Wildfire Harris, Rosebud, Montana",
      "description": "30 Miles SW from Ashland, MT",
      "link": "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_22430",
      "closed": null,
      "categories": [{ "id": "wildfires", "title": "Wildfires" }],
      "sources": [
        {
          "id": "IRWIN",
          "url": "https://irwin.doi.gov/observer/incidents/2026-MTMCD-000676"
        }
      ],
      "geometry": [
        {
          "magnitudeValue": 924.3,
          "magnitudeUnit": "acres",
          "date": "2026-08-09T16:55:00Z",
          "type": "Point",
          "coordinates": [-106.634317, 45.195183]
        }
      ]
    },
    {
      "id": "EONET_22424",
      "title": "Wildfire WEISER KNOLL, Fremont, Wyoming",
      "description": "13 Miles SE from Lander, WY",
      "link": "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_22424",
      "closed": null,
      "categories": [{ "id": "wildfires", "title": "Wildfires" }],
      "sources": [
        {
          "id": "IRWIN",
          "url": "https://irwin.doi.gov/observer/incidents/2026-WYWBD-000294"
        }
      ],
      "geometry": [
        {
          "magnitudeValue": 8500.0,
          "magnitudeUnit": "acres",
          "date": "2026-08-09T16:32:00Z",
          "type": "Point",
          "coordinates": [-108.607547, 42.636437]
        }
      ]
    }
  ]
}
```

## Closed events via status=all + days

`GET /events?category=wildfires&status=all&days=7&limit=2`

```json
{
  "events": [
    {
      "id": "EONET_22387",
      "title": "Wildfire in Australia 1030307",
      "description": null,
      "closed": "2026-08-09T00:00:00Z",
      "sources": [{ "id": "GDACS", "url": "..." }]
    },
    {
      "id": "EONET_22458",
      "title": "Wildfire in Brazil 1030351",
      "closed": "2026-08-10T00:00:00Z"
    }
  ]
}
```

Notes: `days=2` returned an empty list — a data-window miss, not a param failure; `days=7` and `status=all` both work. Detail endpoint `GET /events/{id}` returns the same per-event shape.

## Contract takeaways

- Category filter is the string `wildfires` (not v2.1's numeric `8`).
- `description` is nullable — UI needs a fallback.
- `geometry` may be Point or Polygon; coordinates are `[lng, lat]` GeoJSON order.
- `magnitudeValue`/`magnitudeUnit` = size in acres for wildfires (sometimes null).
- No containment %, cause, agency, or imagery in EONET — detail panel links out to `sources[].url` (IRWIN/GDACS).
