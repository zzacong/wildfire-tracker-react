import { describe, expect, it } from "vitest";

import {
  DEFAULT_SYMBOL_FONT,
  EVENT_CLUSTER_MAX_ZOOM,
  EVENT_CLUSTER_RADIUS,
  HAZARD_CLUSTER_COUNT_LAYER_ID,
  HAZARD_CLUSTERS_LAYER_ID,
  HAZARD_EVENTS_SOURCE_ID,
  HAZARD_HEATMAP_LAYER_ID,
  HAZARD_HEATMAP_SOURCE_ID,
  HAZARD_POINTS_LAYER_ID,
  HAZARD_SELECTED_LAYER_ID,
  buildEventsFeatureCollection,
  buildHazardLayerSpecs,
  buildHazardSources,
  selectedEventFilter,
  type HazardFeatureProperties,
} from "./hazard-layers";
import type { HazardEvent } from "@/lib/hazard-event";

function event(id: string, lon = -120.5, lat = 40.2): HazardEvent {
  return {
    id,
    title: `Fire ${id}`,
    kind: "wildfire",
    status: "open",
    geometry: { lon, lat },
    area: id === "EONET_AREA" ? { value: 1200, sourceUnit: "acres" } : null,
    dates: { start: "2026-08-01T00:00:00Z", closed: null },
    description: null,
    sources: [],
    link: `https://eonet.gsfc.nasa.gov/api/v3/events/${id}`,
  };
}

describe("buildEventsFeatureCollection", () => {
  it("maps each event to a Point feature with its properties", () => {
    const collection = buildEventsFeatureCollection([event("a"), event("EONET_AREA")]);

    expect(collection.features).toHaveLength(2);
    const [first] = collection.features;
    expect(first.geometry).toEqual({ type: "Point", coordinates: [-120.5, 40.2] });
    expect((first.properties as HazardFeatureProperties).id).toBe("a");
    expect((first.properties as HazardFeatureProperties).title).toBe("Fire a");
    expect((first.properties as HazardFeatureProperties).areaAcres).toBe(0);
    expect((collection.features[1].properties as HazardFeatureProperties).areaAcres).toBe(1200);
  });
});

describe("buildHazardSources", () => {
  it("clusters the events source and keeps the heatmap source unclustered", () => {
    const sources = buildHazardSources([event("a")]);

    expect(Object.keys(sources)).toEqual([HAZARD_EVENTS_SOURCE_ID, HAZARD_HEATMAP_SOURCE_ID]);

    const eventsSource = sources[HAZARD_EVENTS_SOURCE_ID];
    expect(eventsSource.type).toBe("geojson");
    expect(eventsSource).toMatchObject({
      cluster: true,
      clusterMaxZoom: EVENT_CLUSTER_MAX_ZOOM,
      clusterRadius: EVENT_CLUSTER_RADIUS,
    });

    const heatmapSource = sources[HAZARD_HEATMAP_SOURCE_ID];
    expect(heatmapSource.type).toBe("geojson");
    expect(heatmapSource).not.toHaveProperty("cluster");
  });

  it("derives heatmap weight from acres when present", () => {
    buildHazardSources([event("EONET_AREA")]);
    const heatmapPaint = buildHazardLayerSpecs(DEFAULT_SYMBOL_FONT).find(
      (layer) => layer.id === HAZARD_HEATMAP_LAYER_ID,
    );
    expect(heatmapPaint?.type).toBe("heatmap");
  });
});

describe("buildHazardLayerSpecs", () => {
  const specs = buildHazardLayerSpecs(DEFAULT_SYMBOL_FONT);

  it("orders the heatmap below the markers", () => {
    const ids = specs.map((layer) => layer.id);
    expect(ids).toEqual([
      HAZARD_HEATMAP_LAYER_ID,
      HAZARD_CLUSTERS_LAYER_ID,
      HAZARD_CLUSTER_COUNT_LAYER_ID,
      HAZARD_POINTS_LAYER_ID,
      HAZARD_SELECTED_LAYER_ID,
    ]);
  });

  it("starts with the heatmap hidden", () => {
    const heatmap = specs.find((layer) => layer.id === HAZARD_HEATMAP_LAYER_ID);
    expect(heatmap?.layout).toMatchObject({ visibility: "none" });
  });

  it("only shows clusters where points aggregate", () => {
    const clusters = specs.find((layer) => layer.id === HAZARD_CLUSTERS_LAYER_ID) as {
      filter?: unknown;
    };
    expect(clusters?.filter).toEqual(["has", "point_count"]);
    const points = specs.find((layer) => layer.id === HAZARD_POINTS_LAYER_ID) as {
      filter?: unknown;
    };
    expect(points?.filter).toEqual(["!", ["has", "point_count"]]);
  });

  it("uses the resolved font stack for cluster counts", () => {
    const counts = specs.find((layer) => layer.id === HAZARD_CLUSTER_COUNT_LAYER_ID);
    expect(counts?.layout).toMatchObject({ "text-font": [...DEFAULT_SYMBOL_FONT] });
  });

  it("feeds data-driven expressions into interpolate stops", () => {
    const clusters = specs.find((layer) => layer.id === HAZARD_CLUSTERS_LAYER_ID);
    const clusterPaint = clusters?.type === "circle" ? clusters.paint : undefined;
    expect(clusterPaint?.["circle-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "point_count"],
      1,
      "#fb923c",
      10,
      "#f97316",
      50,
      "#ef4444",
      200,
      "#b91c1c",
    ]);

    const heatmap = specs.find((layer) => layer.id === HAZARD_HEATMAP_LAYER_ID);
    const heatmapPaint = heatmap?.type === "heatmap" ? heatmap.paint : undefined;
    expect(heatmapPaint?.["heatmap-weight"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "areaAcres"],
      0,
      0.5,
      250000,
      1,
    ]);

    const points = specs.find((layer) => layer.id === HAZARD_POINTS_LAYER_ID);
    const pointsPaint = points?.type === "circle" ? points.paint : undefined;
    expect(pointsPaint?.["circle-radius"]).toEqual([
      "interpolate",
      ["linear"],
      ["zoom"],
      5,
      5,
      9,
      7,
    ]);
  });
});

describe("selectedEventFilter", () => {
  it("matches the given event id", () => {
    expect(selectedEventFilter("EONET_1")).toEqual(["==", "id", "EONET_1"]);
  });

  it("matches nothing when nothing is selected", () => {
    expect(selectedEventFilter(null)).toEqual(["==", "id", ""]);
  });
});
