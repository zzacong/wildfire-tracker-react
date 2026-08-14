export const FALLBACK_DESCRIPTION = 'No description provided';

export type WildfireStatus = 'open' | 'all';

export interface EonetEnvelope {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: Array<{ id: string; title: string }>;
  sources: Array<{ id: string; url: string }>;
  geometry: EonetGeometry[];
}

export interface EonetGeometry {
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  date: string;
  type: 'Point' | 'Polygon';
  coordinates: unknown;
}

export interface FireSource {
  id: string;
  url: string;
}

export interface FireGeometry {
  type: 'Point' | 'Polygon';
  date: string;
  coordinates: [number, number];
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
}

export interface Fire {
  id: string;
  title: string;
  description: string;
  link: string;
  closed: string | null;
  sources: FireSource[];
  geometry: FireGeometry;
}

export interface WildfiresResult {
  status: WildfireStatus;
  fires: Fire[];
  fetchedAt: string;
  stale: boolean;
}

export function normalizeEonetEnvelope(envelope: EonetEnvelope): Fire[] {
  const events = Array.isArray(envelope?.events) ? envelope.events : [];
  const fires: Fire[] = [];
  for (const event of events) {
    const fire = normalizeEvent(event);
    if (fire) {
      fires.push(fire);
    }
  }
  return fires;
}

function normalizeEvent(event: EonetEvent): Fire | null {
  if (!event || typeof event !== 'object') {
    return null;
  }
  const newest = pickNewestGeometry(event.geometry);
  if (!newest) {
    return null;
  }
  const point = markerPoint(newest);
  if (!point) {
    return null;
  }
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? FALLBACK_DESCRIPTION,
    link: event.link,
    closed: event.closed ?? null,
    sources: Array.isArray(event.sources)
      ? event.sources
          .filter((source) => source && typeof source.url === 'string')
          .map((source) => ({ id: source.id, url: source.url }))
      : [],
    geometry: {
      type: newest.type,
      date: newest.date,
      coordinates: point,
      magnitudeValue:
        typeof newest.magnitudeValue === 'number'
          ? newest.magnitudeValue
          : null,
      magnitudeUnit:
        typeof newest.magnitudeUnit === 'string' ? newest.magnitudeUnit : null,
    },
  };
}

function pickNewestGeometry(
  geometry: EonetGeometry[] | undefined,
): EonetGeometry | null {
  if (!Array.isArray(geometry) || geometry.length === 0) {
    return null;
  }
  let newest: EonetGeometry | null = null;
  let newestTime = Number.NEGATIVE_INFINITY;
  for (const entry of geometry) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const time = new Date(entry.date).getTime();
    if (Number.isNaN(time)) {
      continue;
    }
    if (time > newestTime) {
      newestTime = time;
      newest = entry;
    }
  }
  return newest;
}

function markerPoint(geometry: EonetGeometry): [number, number] | null {
  if (geometry.type === 'Point') {
    return isLngLat(geometry.coordinates) ? geometry.coordinates : null;
  }
  if (geometry.type === 'Polygon') {
    return polygonBoundsCenter(geometry.coordinates);
  }
  return null;
}

function isLngLat(value: unknown): value is [number, number] {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    typeof value[0] !== 'number' ||
    typeof value[1] !== 'number'
  ) {
    return false;
  }
  const [lng, lat] = value;
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

function polygonBoundsCenter(coordinates: unknown): [number, number] | null {
  if (!Array.isArray(coordinates)) {
    return null;
  }
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let found = false;
  for (const ring of coordinates) {
    if (!Array.isArray(ring)) {
      continue;
    }
    for (const position of ring) {
      if (!isLngLat(position)) {
        continue;
      }
      const [lng, lat] = position;
      if (lng < minLng) {
        minLng = lng;
      }
      if (lng > maxLng) {
        maxLng = lng;
      }
      if (lat < minLat) {
        minLat = lat;
      }
      if (lat > maxLat) {
        maxLat = lat;
      }
      found = true;
    }
  }
  if (!found) {
    return null;
  }
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}
