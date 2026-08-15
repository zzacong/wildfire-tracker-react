import type {
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSourceSpecification,
  LayerSpecification,
  SourceSpecification,
} from "maplibre-gl";

import type { HazardEvent } from "@/lib/hazard-event";

export const HAZARD_EVENTS_SOURCE_ID = "hazard-events";
export const HAZARD_HEATMAP_SOURCE_ID = "hazard-heatmap";

export const HAZARD_CLUSTERS_LAYER_ID = "hazard-clusters";
export const HAZARD_CLUSTER_COUNT_LAYER_ID = "hazard-cluster-count";
export const HAZARD_POINTS_LAYER_ID = "hazard-points";
export const HAZARD_SELECTED_LAYER_ID = "hazard-selected";
export const HAZARD_HEATMAP_LAYER_ID = "hazard-heatmap";

export const EVENT_CLUSTER_MAX_ZOOM = 11;
export const EVENT_CLUSTER_RADIUS = 44;

export const DEFAULT_SYMBOL_FONT = ["Noto Sans Regular"] as const;

const FIRE_RAMP = {
  ember: "rgba(127, 29, 29, 0.7)",
  red: "#dc2626",
  orange: "#f97316",
  amber: "#fbbf24",
  hot: "#fef3c7",
} as const;

function interpolate(
  input: ExpressionSpecification,
  stops: Array<[number, string | number]>,
): ExpressionSpecification {
  return [
    "interpolate",
    ["linear"],
    input,
    ...stops.flatMap(([zoom, value]) => [zoom, value]),
  ] as unknown as ExpressionSpecification;
}

export type HazardFeatureProperties = {
  id: string;
  title: string;
  kind: HazardEvent["kind"];
  status: HazardEvent["status"];
  areaAcres: number;
};

export type HazardFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: HazardFeatureProperties;
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
};

export function buildEventsFeatureCollection(events: HazardEvent[]): HazardFeatureCollection {
  return {
    type: "FeatureCollection",
    features: events.map((event) => ({
      type: "Feature",
      properties: {
        id: event.id,
        title: event.title,
        kind: event.kind,
        status: event.status,
        areaAcres: event.area?.value ?? 0,
      },
      geometry: {
        type: "Point",
        coordinates: [event.geometry.lon, event.geometry.lat],
      },
    })),
  };
}

export function buildHazardSources(events: HazardEvent[]): Record<string, SourceSpecification> {
  const data = buildEventsFeatureCollection(events);
  return {
    [HAZARD_EVENTS_SOURCE_ID]: {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom: EVENT_CLUSTER_MAX_ZOOM,
      clusterRadius: EVENT_CLUSTER_RADIUS,
    } satisfies GeoJSONSourceSpecification,
    [HAZARD_HEATMAP_SOURCE_ID]: {
      type: "geojson",
      data,
    } satisfies GeoJSONSourceSpecification,
  };
}

export function buildHazardLayerSpecs(fontStack: readonly string[]): LayerSpecification[] {
  const font = [...fontStack];
  return [
    {
      id: HAZARD_HEATMAP_LAYER_ID,
      type: "heatmap",
      source: HAZARD_HEATMAP_SOURCE_ID,
      layout: { visibility: "none" },
      paint: {
        "heatmap-weight": interpolate(
          ["get", "areaAcres"],
          [
            [0, 0.5],
            [250000, 1],
          ],
        ),
        "heatmap-intensity": 0.9,
        "heatmap-radius": interpolate(
          ["zoom"],
          [
            [0, 1],
            [4, 14],
            [9, 28],
          ],
        ),
        "heatmap-opacity": 0.8,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 0, 0)",
          0.15,
          FIRE_RAMP.ember,
          0.35,
          FIRE_RAMP.red,
          0.6,
          FIRE_RAMP.orange,
          0.85,
          FIRE_RAMP.amber,
          1,
          FIRE_RAMP.hot,
        ],
      },
    },
    {
      id: HAZARD_CLUSTERS_LAYER_ID,
      type: "circle",
      source: HAZARD_EVENTS_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": interpolate(
          ["get", "point_count"],
          [
            [1, "#fb923c"],
            [10, FIRE_RAMP.orange],
            [50, "#ef4444"],
            [200, "#b91c1c"],
          ],
        ),
        "circle-radius": interpolate(
          ["get", "point_count"],
          [
            [1, 16],
            [50, 24],
            [200, 32],
            [1000, 40],
          ],
        ),
        "circle-opacity": 0.95,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "rgba(20, 10, 0, 0.6)",
      },
    },
    {
      id: HAZARD_CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: HAZARD_EVENTS_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 11,
        "text-font": font,
        "text-anchor": "center",
      },
      paint: {
        "text-color": "#fff7ed",
        "text-halo-color": "rgba(20, 10, 0, 0.75)",
        "text-halo-width": 1.25,
      },
    },
    {
      id: HAZARD_POINTS_LAYER_ID,
      type: "circle",
      source: HAZARD_EVENTS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": interpolate(
          ["zoom"],
          [
            [5, 5],
            [9, 7],
          ],
        ),
        "circle-color": FIRE_RAMP.orange,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "rgba(20, 10, 0, 0.65)",
      },
    },
    {
      id: HAZARD_SELECTED_LAYER_ID,
      type: "circle",
      source: HAZARD_EVENTS_SOURCE_ID,
      filter: ["==", "id", ""],
      paint: {
        "circle-radius": interpolate(
          ["zoom"],
          [
            [5, 9],
            [9, 11],
          ],
        ),
        "circle-color": FIRE_RAMP.amber,
        "circle-opacity": 1,
        "circle-stroke-width": 2,
        "circle-stroke-color": "rgba(20, 10, 0, 0.7)",
      },
    },
  ];
}

export function selectedEventFilter(eventId: string | null): FilterSpecification {
  return ["==", "id", eventId ?? ""];
}
