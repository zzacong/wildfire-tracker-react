"use client";

import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { HAZARD_EVENTS_SOURCE_ID } from "@/components/map/hazard-layers";
import type { HazardEvent } from "@/lib/hazard-event";
import { useMapAccessor } from "@/lib/map-accessor";

interface AccessibleMarkersProps {
  events: HazardEvent[];
  ready: boolean;
  visible: boolean;
  selectedEventId: string | null;
  onSelect: (id: string) => void;
}

interface MarkerHandle {
  marker: MapLibreMarker;
  element: HTMLButtonElement;
}

const MARKER_CLASSES = [
  "map-marker-a11y",
  "pointer-events-auto absolute cursor-pointer rounded-full bg-transparent outline-none",
  "transition-[background-color,box-shadow]",
  "hover:bg-primary/15 hover:shadow-[0_0_0_2px] hover:shadow-primary/40",
  "focus-visible:bg-primary/10 focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-primary",
].join(" ");

function syncMarkers(map: MapLibreMap, handles: Map<string, MarkerHandle>, visible: boolean) {
  if (!visible) {
    for (const { element } of handles.values()) {
      element.style.display = "none";
    }
    return;
  }

  const visibleIds = new Set<string>();
  for (const feature of map.querySourceFeatures(HAZARD_EVENTS_SOURCE_ID)) {
    const props = feature.properties as Record<string, unknown> | null;
    if (!props || props.cluster === true) continue;
    if (typeof props.id === "string") visibleIds.add(props.id);
  }

  for (const [id, { element }] of handles) {
    element.style.display = visibleIds.has(id) ? "" : "none";
  }
}

export function AccessibleMarkers({
  events,
  ready,
  visible,
  selectedEventId,
  onSelect,
}: AccessibleMarkersProps) {
  const { getMap } = useMapAccessor();
  const handlesRef = useRef<Map<string, MarkerHandle>>(new Map());

  useEffect(() => {
    if (!ready) return;
    const map = getMap();
    if (!map) return;
    let disposed = false;

    void import("maplibre-gl").then((maplibregl) => {
      if (disposed) return;

      const handles = new Map<string, MarkerHandle>();
      for (const hazardEvent of events) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = MARKER_CLASSES;
        element.style.width = "24px";
        element.style.height = "24px";
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-pressed", "false");
        element.setAttribute("aria-label", hazardEvent.title);

        let pointerDownX = 0;
        let pointerDownY = 0;
        element.addEventListener("pointerdown", (event) => {
          pointerDownX = event.clientX;
          pointerDownY = event.clientY;
        });
        element.addEventListener("click", (event) => {
          const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
          if (moved > 6) return;
          onSelect(hazardEvent.id);
        });

        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([hazardEvent.geometry.lon, hazardEvent.geometry.lat])
          .addTo(map);

        handles.set(hazardEvent.id, { marker, element });
      }

      handlesRef.current = handles;
      syncMarkers(map, handles, visible);
    });

    return () => {
      disposed = true;
      for (const { marker } of handlesRef.current.values()) {
        marker.remove();
      }
      handlesRef.current = new Map();
    };
  }, [ready, events, getMap, onSelect]);

  useEffect(() => {
    if (!ready) return;
    const map = getMap();
    if (!map) return;

    const onSourceData = (event: unknown) => {
      const sourceEvent = event as { sourceId?: string; isSourceLoaded?: boolean };
      if (sourceEvent.sourceId === HAZARD_EVENTS_SOURCE_ID && sourceEvent.isSourceLoaded) {
        syncMarkers(map, handlesRef.current, visible);
      }
    };
    const onMoveEnd = () => syncMarkers(map, handlesRef.current, visible);

    syncMarkers(map, handlesRef.current, visible);
    map.on("sourcedata", onSourceData);
    map.on("moveend", onMoveEnd);

    return () => {
      map.off("sourcedata", onSourceData);
      map.off("moveend", onMoveEnd);
    };
  }, [ready, getMap, visible]);

  useEffect(() => {
    for (const [id, { element }] of handlesRef.current) {
      if (id === selectedEventId) {
        element.setAttribute("aria-pressed", "true");
      } else {
        element.setAttribute("aria-pressed", "false");
      }
    }
  }, [selectedEventId, ready]);

  return null;
}
