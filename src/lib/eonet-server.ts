import {
  normalizeEonetEnvelope,
  type EonetEnvelope,
  type Fire,
  type WildfireStatus,
  type WildfiresResult,
} from './eonet';

export const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events';
export const EONET_CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  fires: Fire[];
  fetchedAt: number;
}

const cache = new Map<WildfireStatus, CacheEntry>();
const inflight = new Map<WildfireStatus, Promise<CacheEntry>>();

export function resetEonetCache(): void {
  cache.clear();
  inflight.clear();
}

export function eonetUrl(status: WildfireStatus): string {
  const params = new URLSearchParams({ category: 'wildfires', status });
  if (status === 'all') {
    params.set('days', '30');
  }
  return `${EONET_BASE_URL}?${params.toString()}`;
}

async function fetchEnvelope(status: WildfireStatus): Promise<EonetEnvelope> {
  const res = await fetch(eonetUrl(status));
  if (!res.ok) {
    throw new Error(`EONET request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as EonetEnvelope;
}

async function refresh(status: WildfireStatus): Promise<CacheEntry> {
  const pending = inflight.get(status);
  if (pending) {
    return pending;
  }
  const promise = fetchEnvelope(status)
    .then((envelope) => {
      const entry: CacheEntry = {
        fires: normalizeEonetEnvelope(envelope),
        fetchedAt: Date.now(),
      };
      cache.set(status, entry);
      return entry;
    })
    .finally(() => {
      inflight.delete(status);
    });
  inflight.set(status, promise);
  return promise;
}

function toResult(
  status: WildfireStatus,
  entry: CacheEntry,
  stale: boolean,
): WildfiresResult {
  return {
    status,
    fires: entry.fires,
    fetchedAt: new Date(entry.fetchedAt).toISOString(),
    stale,
  };
}

export async function getWildfires(
  status: WildfireStatus,
): Promise<WildfiresResult> {
  const entry = cache.get(status);
  if (!entry) {
    return toResult(status, await refresh(status), false);
  }
  const stale = Date.now() - entry.fetchedAt >= EONET_CACHE_TTL_MS;
  if (stale) {
    void refresh(status).catch(() => {});
  }
  return toResult(status, entry, stale);
}
