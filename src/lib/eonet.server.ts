import type { HazardEvent, HazardEventsResult, RawEonetResponse } from "./hazard-event";
import { MAX_HAZARD_EVENTS, capHazardEvents, normalizeHazardEvents } from "./hazard-event";

const EONET_EVENTS_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";
const EONET_ACCEPT_HEADER = "application/json";
const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15 * 1000;

interface CacheEntry {
  events: HazardEvent[];
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<HazardEvent[]>>();

async function fetchHazardEvents(): Promise<HazardEvent[]> {
  const response = await fetch(EONET_EVENTS_URL, {
    headers: { Accept: EONET_ACCEPT_HEADER },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`EONET request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawEonetResponse;
  const events = normalizeHazardEvents(payload.events);
  return capHazardEvents(events, MAX_HAZARD_EVENTS);
}

function fetchHazardEventsCached(key: string): Promise<HazardEvent[]> {
  const pending = inflight.get(key);
  if (pending) {
    return pending;
  }

  const request = fetchHazardEvents().finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

async function revalidate(key: string): Promise<void> {
  try {
    const events = await fetchHazardEventsCached(key);
    cache.set(key, { events, fetchedAt: Date.now() });
  } catch {
    // Keep serving the last-known data; it is already flagged stale.
  }
}

export async function getHazardEventsResult(): Promise<HazardEventsResult> {
  const key = EONET_EVENTS_URL;
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
    void revalidate(key);
    return {
      events: cached.events,
      isStale: true,
      fetchedAt: cached.fetchedAt,
      status: "stale",
    };
  }

  try {
    const events = await fetchHazardEventsCached(key);
    const fetchedAt = Date.now();
    cache.set(key, { events, fetchedAt });
    return { events, isStale: false, fetchedAt, status: "fresh" };
  } catch {
    return { events: [], isStale: true, fetchedAt: now, status: "error" };
  }
}
