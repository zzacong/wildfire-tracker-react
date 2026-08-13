import type { Fire } from './eonet';

export interface FireFeatureProperties {
  id: string;
  sizeAcres: number | null;
}

export interface FireFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: FireFeatureProperties;
}

export interface FireFeatureCollection {
  type: 'FeatureCollection';
  features: FireFeature[];
}

export function firesToGeoJson(fires: Fire[]): FireFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fires.map((fire) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: fire.geometry.coordinates,
      },
      properties: {
        id: fire.id,
        sizeAcres: fire.geometry.magnitudeValue,
      },
    })),
  };
}
