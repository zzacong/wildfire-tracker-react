"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import { Route } from "@/routes/index";
import { useMapAccessor } from "@/lib/map-accessor";
import { useSelection } from "@/lib/selection";
import { AccessibleMarkers } from "@/components/map/AccessibleMarkers";
import { HeatmapToggle } from "@/components/map/HeatmapToggle";
import {
  DEFAULT_SYMBOL_FONT,
  HAZARD_CLUSTERS_LAYER_ID,
  HAZARD_CLUSTER_COUNT_LAYER_ID,
  HAZARD_EVENTS_SOURCE_ID,
  HAZARD_HEATMAP_LAYER_ID,
  HAZARD_HEATMAP_SOURCE_ID,
  HAZARD_POINTS_LAYER_ID,
  HAZARD_SELECTED_LAYER_ID,
  buildEventsFeatureCollection,
  buildHazardLayerSpecs,
  buildHazardSources,
  selectedEventFilter,
} from "@/components/map/hazard-layers";

const OPEN_FREEMAP_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

const INITIAL_CENTER: [number, number] = [0, 20];
const INITIAL_ZOOM = 1.2;

const MARKER_LAYER_IDS = [
  HAZARD_CLUSTERS_LAYER_ID,
  HAZARD_CLUSTER_COUNT_LAYER_ID,
  HAZARD_POINTS_LAYER_ID,
  HAZARD_SELECTED_LAYER_ID,
] as const;

function setLayerVisibility(map: MapLibreMap, layerId: string, visibility: "visible" | "none") {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", visibility);
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMap, getMap } = useMapAccessor();
  const { selectedEventId, setSelectedEventId } = useSelection();

  const [mapReady, setMapReady] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [symbolFont, setSymbolFont] = useState<string[]>([...DEFAULT_SYMBOL_FONT]);

  const loaderData = Route.useLoaderData();
  const events = loaderData?.events ?? [];

  useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | undefined;

    void import("maplibre-gl").then((maplibregl) => {
      const container = containerRef.current;
      if (disposed || !container) return;

      map = new maplibregl.Map({
        container,
        style: OPEN_FREEMAP_DARK_STYLE,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: false,
        minZoom: 1,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-right");
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

      map.on("load", () => {
        if (!disposed) setMapReady(true);
      });

      setMap(map);
    });

    return () => {
      disposed = true;
      setMapReady(false);
      setMap(null);
      map?.remove();
    };
  }, [setMap]);

  const resolveSymbolFont = useCallback(() => {
    const map = getMap();
    if (!map) return;

    const fonts = new Set<string>();
    for (const layer of map.getStyle().layers) {
      const layout = layer.layout as { "text-font"?: string[] } | undefined;
      const font = layout?.["text-font"];
      if (Array.isArray(font)) {
        for (const name of font) fonts.add(name);
      }
    }
    if (fonts.size > 0) setSymbolFont([...fonts]);
  }, [getMap]);

  useEffect(() => {
    if (mapReady) resolveSymbolFont();
  }, [mapReady, resolveSymbolFont]);

  useEffect(() => {
    const map = getMap();
    if (!map || !mapReady) return;

    if (!map.getSource(HAZARD_EVENTS_SOURCE_ID)) {
      const sources = buildHazardSources(events);
      for (const [sourceId, spec] of Object.entries(sources)) {
        map.addSource(sourceId, spec);
      }
      for (const spec of buildHazardLayerSpecs(symbolFont)) {
        map.addLayer(spec);
      }
    } else if (events.length > 0) {
      const eventsSource = map.getSource(HAZARD_EVENTS_SOURCE_ID) as GeoJSONSource;
      const heatmapSource = map.getSource(HAZARD_HEATMAP_SOURCE_ID) as GeoJSONSource;
      const data = buildEventsFeatureCollection(events);
      eventsSource?.setData(data);
      heatmapSource?.setData(data);
    }
  }, [mapReady, events, symbolFont, getMap]);

  useEffect(() => {
    if (mapReady) {
      const map = getMap();
      if (!map || !map.getLayer(HAZARD_CLUSTER_COUNT_LAYER_ID)) return;
      map.setLayoutProperty(HAZARD_CLUSTER_COUNT_LAYER_ID, "text-font", symbolFont);
    }
  }, [symbolFont, mapReady, getMap]);

  useEffect(() => {
    const map = getMap();
    if (!map || !mapReady) return;

    setLayerVisibility(map, HAZARD_HEATMAP_LAYER_ID, heatmapEnabled ? "visible" : "none");
    for (const layerId of MARKER_LAYER_IDS) {
      setLayerVisibility(map, layerId, heatmapEnabled ? "none" : "visible");
    }
  }, [heatmapEnabled, mapReady, getMap]);

  useEffect(() => {
    const map = getMap();
    if (!map || !mapReady) return;
    if (!map.getLayer(HAZARD_SELECTED_LAYER_ID)) return;

    map.setFilter(HAZARD_SELECTED_LAYER_ID, selectedEventFilter(selectedEventId));
  }, [selectedEventId, mapReady, getMap]);

  useEffect(() => {
    const map = getMap();
    if (!map || !mapReady) return;

    const onClusterClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;

      const clusterId = feature.properties?.cluster_id;
      if (typeof clusterId !== "number") return;

      const source = map.getSource(HAZARD_EVENTS_SOURCE_ID);
      if (!source || !("getClusterExpansionZoom" in source)) return;

      void (source as GeoJSONSource).getClusterExpansionZoom(clusterId).then((zoom) => {
        map.easeTo({
          center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
          zoom: Math.min(zoom + 1, 16),
          duration: 600,
        });
      });
    };

    const onPointClick = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === "string") setSelectedEventId(id);
    };

    const onCursorPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const onCursorDefault = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", HAZARD_CLUSTERS_LAYER_ID, onClusterClick);
    map.on("click", HAZARD_POINTS_LAYER_ID, onPointClick);
    map.on("mouseenter", HAZARD_CLUSTERS_LAYER_ID, onCursorPointer);
    map.on("mouseleave", HAZARD_CLUSTERS_LAYER_ID, onCursorDefault);
    map.on("mouseenter", HAZARD_POINTS_LAYER_ID, onCursorPointer);
    map.on("mouseleave", HAZARD_POINTS_LAYER_ID, onCursorDefault);

    return () => {
      map.off("click", HAZARD_CLUSTERS_LAYER_ID, onClusterClick);
      map.off("click", HAZARD_POINTS_LAYER_ID, onPointClick);
      map.off("mouseenter", HAZARD_CLUSTERS_LAYER_ID, onCursorPointer);
      map.off("mouseleave", HAZARD_CLUSTERS_LAYER_ID, onCursorDefault);
      map.off("mouseenter", HAZARD_POINTS_LAYER_ID, onCursorPointer);
      map.off("mouseleave", HAZARD_POINTS_LAYER_ID, onCursorDefault);
    };
  }, [mapReady, getMap, setSelectedEventId]);

  return (
    <div className="relative size-full">
      <div
        ref={containerRef}
        data-testid="map-view"
        role="region"
        aria-label="Hazard events map"
        className="size-full"
      />
      <HeatmapToggle enabled={heatmapEnabled} onToggle={setHeatmapEnabled} />
      <AccessibleMarkers
        events={events}
        ready={mapReady}
        visible={!heatmapEnabled}
        selectedEventId={selectedEventId}
        onSelect={setSelectedEventId}
      />
    </div>
  );
}
