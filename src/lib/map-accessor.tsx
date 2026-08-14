"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { Map as MapLibreMap, PaddingOptions } from "maplibre-gl";

export interface FlyToOptions {
  zoom?: number;
  duration?: number;
  padding?: PaddingOptions;
}

export interface MapAccessor {
  setMap: (map: MapLibreMap | null) => void;
  getMap: () => MapLibreMap | null;
  flyTo: (lng: number, lat: number, options?: FlyToOptions) => void;
}

const MapAccessorContext = createContext<MapAccessor | null>(null);

export function MapAccessorProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MapLibreMap | null>(null);

  const setMap = useCallback((map: MapLibreMap | null) => {
    mapRef.current = map;
  }, []);

  const getMap = useCallback(() => mapRef.current, []);

  const flyTo = useCallback((lng: number, lat: number, options?: FlyToOptions) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: options?.zoom,
      duration: options?.duration,
      padding: options?.padding,
    });
  }, []);

  const value = useMemo(() => ({ setMap, getMap, flyTo }), [setMap, getMap, flyTo]);

  return <MapAccessorContext.Provider value={value}>{children}</MapAccessorContext.Provider>;
}

export function useMapAccessor(): MapAccessor {
  const ctx = useContext(MapAccessorContext);
  if (!ctx) {
    throw new Error("useMapAccessor must be used within a MapAccessorProvider");
  }
  return ctx;
}
