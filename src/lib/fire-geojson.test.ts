import { describe, expect, it } from 'vitest';

import type { Fire } from './eonet';
import { firesToGeoJson } from './fire-geojson';

function fire(overrides: Partial<Fire>): Fire {
  return {
    id: 'EONET_1',
    title: 'Wildfire Harris, Rosebud, Montana',
    description: '30 Miles SW from Ashland, MT',
    link: '/events/EONET_1',
    closed: null,
    sources: [
      { id: 'IRWIN', url: 'https://irwin.doi.gov/observer/incidents/1' },
    ],
    geometry: {
      type: 'Point',
      date: '2026-08-09T16:55:00Z',
      coordinates: [-106.634317, 45.195183],
      magnitudeValue: 924.3,
      magnitudeUnit: 'acres',
    },
    ...overrides,
  };
}

describe('firesToGeoJson', () => {
  it('maps each fire to a GeoJSON Point feature carrying the fire id and size', () => {
    const collection = firesToGeoJson([
      fire({ id: 'EONET_A' }),
      fire({
        id: 'EONET_B',
        geometry: {
          type: 'Point',
          date: '2026-08-09T16:55:00Z',
          coordinates: [-122.4, 37.8],
          magnitudeValue: 12000,
          magnitudeUnit: 'acres',
        },
      }),
    ]);

    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(2);
    expect(collection.features[0]).toMatchObject({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-106.634317, 45.195183] },
      properties: { id: 'EONET_A', sizeAcres: 924.3 },
    });
    expect(collection.features[1]).toMatchObject({
      geometry: { type: 'Point', coordinates: [-122.4, 37.8] },
      properties: { id: 'EONET_B', sizeAcres: 12000 },
    });
  });

  it('keeps a null magnitude as null size in the feature properties', () => {
    const collection = firesToGeoJson([
      fire({
        geometry: {
          type: 'Point',
          date: '2026-08-09T16:55:00Z',
          coordinates: [10, 20],
          magnitudeValue: null,
          magnitudeUnit: 'acres',
        },
      }),
    ]);

    expect(collection.features[0].properties).toEqual({
      id: 'EONET_1',
      sizeAcres: null,
    });
  });

  it('returns an empty FeatureCollection for an empty fires array', () => {
    expect(firesToGeoJson([])).toEqual({
      type: 'FeatureCollection',
      features: [],
    });
  });
});
