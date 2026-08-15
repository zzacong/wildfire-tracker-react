import type { HazardEvent, HazardEventsResult, Kind, RawEonetResponse } from "./hazard-event";
import { MAX_HAZARD_EVENTS, capHazardEvents, normalizeHazardEvents } from "./hazard-event";
import {
  normalizeHazardFilters,
  type HazardFilters,
  type HazardFiltersInput,
  type StatusFilter,
} from "./hazard-filters";

const EONET_EVENTS_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";
const EONET_ACCEPT_HEADER = "application/json";
const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15 * 1000;
const RECENTLY_CLOSED_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Kind -> EONET category id. Only wildfire is wired today; others slot in later. */
const KIND_TO_EONET_CATEGORY: Readonly<Partial<Record<Kind, string>>> = {
  wildfire: "wildfires",
};

interface CacheEntry {
  events: HazardEvent[];
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<HazardEvent[]>>();

function toEonetQueryParams(filters: HazardFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set("status", filters.status === "recently-closed" ? "all" : "open");
  const category = KIND_TO_EONET_CATEGORY[filters.kind];
  if (category) {
    params.set("category", category);
  }
  if (filters.start) {
    params.set("start", filters.start);
  }
  if (filters.end) {
    params.set("end", filters.end);
  }
  return params;
}

async function fetchHazardEvents(params: URLSearchParams): Promise<HazardEvent[]> {
  const url = new URL(EONET_EVENTS_URL);
  url.search = params.toString();

  const response = await fetch(url, {
    headers: { Accept: EONET_ACCEPT_HEADER },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`EONET request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawEonetResponse;
  return normalizeHazardEvents(payload.events);
}

function filterByStatus(events: HazardEvent[], status: StatusFilter): HazardEvent[] {
  if (status === "open") {
    return events.filter((event) => event.status === "open");
  }

  const cutoff = Date.now() - RECENTLY_CLOSED_DAYS * DAY_MS;
  return events.filter(
    (event) =>
      event.status === "open" ||
      (event.dates.closed !== null && Date.parse(event.dates.closed) >= cutoff),
  );
}

/** The full server-side pipeline: normalize -> status filter -> 1000 cap. */
function transformEvents(events: HazardEvent[], status: StatusFilter): HazardEvent[] {
  return capHazardEvents(filterByStatus(events, status), MAX_HAZARD_EVENTS);
}

function fetchHazardEventsCached(key: string, params: URLSearchParams): Promise<HazardEvent[]> {
  const pending = inflight.get(key);
  if (pending) {
    return pending;
  }

  const request = fetchHazardEvents(params).finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

async function revalidate(
  key: string,
  filters: HazardFilters,
  params: URLSearchParams,
): Promise<void> {
  try {
    const events = await fetchHazardEventsCached(key, params);
    cache.set(key, { events: transformEvents(events, filters.status), fetchedAt: Date.now() });
  } catch {
    // Keep serving the last-known data; it is already flagged stale.
  }
}

export async function getHazardEventsResult(
  input?: HazardFiltersInput,
): Promise<HazardEventsResult> {
  const filters = normalizeHazardFilters(input);
  const params = toEonetQueryParams(filters);
  const key = `${EONET_EVENTS_URL}?${params.toString()}`;
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && Math.max(0, now - cached.fetchedAt) < CACHE_TTL_MS) {
    return {
      events: cached.events,
      isStale: false,
      fetchedAt: cached.fetchedAt,
      status: "fresh",
    };
  }

  if (cached) {
    void revalidate(key, filters, params);
    return {
      events: cached.events,
      isStale: true,
      fetchedAt: cached.fetchedAt,
      status: "stale",
    };
  }

  try {
    const events = await fetchHazardEventsCached(key, params);
    const transformed = transformEvents(events, filters.status);
    const fetchedAt = Date.now();
    cache.set(key, { events: transformed, fetchedAt });
    return { events: transformed, isStale: false, fetchedAt, status: "fresh" };
  } catch {
    return { events: [], isStale: true, fetchedAt: now, status: "error" };
  }
}
