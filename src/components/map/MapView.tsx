"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMapAccessor } from "@/lib/map-accessor";

const OPEN_FREEMAP_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

const INITIAL_CENTER: [number, number] = [0, 20];
const INITIAL_ZOOM = 1.2;

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMap } = useMapAccessor();

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

      setMap(map);
    });

    return () => {
      disposed = true;
      setMap(null);
      map?.remove();
    };
  }, [setMap]);

  return <div ref={containerRef} data-testid="map-view" className="size-full" />;
}
