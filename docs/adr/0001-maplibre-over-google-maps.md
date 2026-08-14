# 0001 - MapLibre GL + OpenFreeMap over Google Maps

The original app used `google-map-react` with a `REACT_APP_GOOGLE_MAP_API_KEY`. We rebuilt on **MapLibre GL JS with OpenFreeMap tiles (dark style)** instead.

Google Maps was disqualified for the redesign: its heatmap layer is deprecated, custom styling is cloud-only and limited, and it requires a billing account + API key. MapLibre is open-source, keyless, and gives us native heatmap layers and full control of a custom dark basemap — zero recurring cost and no secret to manage. OpenFreeMap requires attribution and permits commercial use.
