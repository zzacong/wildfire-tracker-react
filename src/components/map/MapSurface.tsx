import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import type { Fire } from '#/lib/eonet';

import { buildFireMarkerButton } from './fireMarker';

import 'maplibre-gl/dist/maplibre-gl.css';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const MAP_CENTER: [number, number] = [-112, 43];
const MAP_ZOOM = 3.4;

export interface MapSurfaceProps {
  fires: Fire[];
  selectedFireId: string | null;
  onSelectFire: (id: string) => void;
  isLoading: boolean;
}

export function MapSurface({
  fires,
  selectedFireId,
  onSelectFire,
  isLoading,
}: MapSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const propsRef = useRef({ fires, selectedFireId, onSelectFire });
  propsRef.current = { fires, selectedFireId, onSelectFire };

  useEffect(() => {
    const map = new MapLibreMap({
      container: containerRef.current!,
      style: OPENFREEMAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(
      new NavigationControl({ showCompass: false }),
      'bottom-right',
    );
    map.on('load', () => {
      map.getCanvas().setAttribute('aria-hidden', 'true');
    });
    mapRef.current = map;
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const { selectedFireId, onSelectFire } = propsRef.current;
    for (const fire of fires) {
      const [lng, lat] = fire.geometry.coordinates;
      const el = buildFireMarkerButton(fire, {
        selected: fire.id === selectedFireId,
        onSelect: onSelectFire,
      });
      const marker = new Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [fires, selectedFireId]);

  return (
    <main
      aria-label="Map"
      className="bg-forest relative min-h-0 flex-1 overflow-hidden"
    >
      <div ref={containerRef} className="absolute inset-0" />
      {isLoading && fires.length === 0 && (
        <output className="absolute inset-0 z-10 grid place-items-center">
          <span className="text-muted font-mono">Loading fires…</span>
        </output>
      )}
      <p className="text-faint absolute bottom-2 left-2 z-10 font-mono text-[11px]">
        orange flame = active wildfire; size and status in the ledger/ticker
      </p>
    </main>
  );
}
