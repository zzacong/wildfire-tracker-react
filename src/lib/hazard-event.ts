export const MAX_HAZARD_EVENTS = 1000;

export const HECTARES_TO_ACRES = 2.47105;

export type Kind =
  | "wildfire"
  | "flood"
  | "earthquake"
  | "volcano"
  | "severeStorm"
  | "seaLakeIce"
  | "drought"
  | "landslide"
  | "snow"
  | "other";

export type EventStatus = "open" | "closed";

export interface Geometry {
  lon: number;
  lat: number;
}

export interface Area {
  value: number;
  sourceUnit: "acres" | "hectares";
}

export interface Source {
  id: string;
  url: string;
}

export interface HazardEventDates {
  start: string;
  closed: string | null;
}

export interface HazardEvent {
  id: string;
  title: string;
  kind: Kind;
  status: EventStatus;
  geometry: Geometry;
  area: Area | null;
  dates: HazardEventDates;
  description: string | null;
  sources: Source[];
  link: string;
}

export type HazardEventsStatus = "fresh" | "stale" | "error";

export interface HazardEventsResult {
  events: HazardEvent[];
  isStale: boolean;
  fetchedAt: number;
  status: HazardEventsStatus;
}

export interface RawEonetCategory {
  id: string;
  title: string;
}

export interface RawEonetSource {
  id: string;
  url: string;
}

export interface RawEonetGeometry {
  date: string;
  type: string;
  coordinates: unknown;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
}

export interface RawEonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: RawEonetCategory[];
  sources: RawEonetSource[];
  geometry: RawEonetGeometry[];
}

export interface RawEonetResponse {
  events: RawEonetEvent[];
}

const EONET_CATEGORY_TO_KIND: Readonly<Record<string, Kind>> = {
  wildfires: "wildfire",
  floods: "flood",
  earthquakes: "earthquake",
  volcanoes: "volcano",
  severeStorms: "severeStorm",
  seaLakeIce: "seaLakeIce",
  droughts: "drought",
  landslides: "landslide",
  snow: "snow",
};

export function normalizeKind(categoryId: string | undefined): Kind {
  return (categoryId && EONET_CATEGORY_TO_KIND[categoryId]) || "other";
}

export function deriveStatus(closed: string | null | undefined): EventStatus {
  return closed ? "closed" : "open";
}

export function normalizeArea(
  magnitudeValue: number | null | undefined,
  magnitudeUnit: string | null | undefined,
): Area | null {
  if (magnitudeValue == null || !Number.isFinite(magnitudeValue) || magnitudeValue <= 0) {
    return null;
  }

  switch (magnitudeUnit) {
    case "acres":
      return { value: magnitudeValue, sourceUnit: "acres" };
    case "hectares":
      return {
        value: magnitudeValue * HECTARES_TO_ACRES,
        sourceUnit: "hectares",
      };
    default:
      return null;
  }
}

function isPointGeometry(
  geometry: RawEonetGeometry,
): geometry is RawEonetGeometry & { coordinates: [number, number] } {
  return (
    geometry.type === "Point" &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length >= 2 &&
    typeof geometry.coordinates[0] === "number" &&
    typeof geometry.coordinates[1] === "number"
  );
}

export function toGeometry(geometries: RawEonetGeometry[]): Geometry | null {
  const points = geometries.filter(isPointGeometry);
  if (points.length === 0) {
    return null;
  }

  const latest = points.reduce((a, b) => (a.date >= b.date ? a : b));
  const [lon, lat] = latest.coordinates;
  return { lon, lat };
}

export function normalizeEvent(raw: RawEonetEvent): HazardEvent | null {
  const geometry = toGeometry(raw.geometry);
  if (geometry === null) {
    return null;
  }

  let start = "";
  for (const entry of raw.geometry) {
    if (isPointGeometry(entry) && (start === "" || entry.date < start)) {
      start = entry.date;
    }
  }

  const withMagnitude = raw.geometry
    .filter((entry) => entry.magnitudeValue != null && typeof entry.magnitudeUnit === "string")
    .sort((a, b) => a.date.localeCompare(b.date));
  const latest = withMagnitude[withMagnitude.length - 1];
  const area = normalizeArea(latest?.magnitudeValue, latest?.magnitudeUnit);

  return {
    id: raw.id,
    title: raw.title,
    kind: normalizeKind(raw.categories[0]?.id),
    status: deriveStatus(raw.closed),
    geometry,
    area,
    dates: { start, closed: raw.closed || null },
    description: raw.description ?? null,
    sources: raw.sources ?? [],
    link: raw.link,
  };
}

export function normalizeHazardEvents(rawEvents: RawEonetEvent[]): HazardEvent[] {
  return rawEvents.flatMap((raw) => {
    const event = normalizeEvent(raw);
    return event === null ? [] : [event];
  });
}

export function capHazardEvents(
  events: HazardEvent[],
  cap: number = MAX_HAZARD_EVENTS,
): HazardEvent[] {
  if (events.length <= cap) {
    return events;
  }

  return [...events].sort((a, b) => b.dates.start.localeCompare(a.dates.start)).slice(0, cap);
}
