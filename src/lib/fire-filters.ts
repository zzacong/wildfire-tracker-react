import type { Fire } from './eonet';

export type RecencyFilter = 'any' | '24h' | '7d';

export type MagnitudeFilter = 'any' | '>100' | '>1k' | '>10k';

export interface FireFilters {
  recency: RecencyFilter;
  magnitude: MagnitudeFilter;
  search: string;
}

export const FIRE_FILTERS_DEFAULT: FireFilters = {
  recency: 'any',
  magnitude: 'any',
  search: '',
};

export const RECENCY_OPTIONS: Array<{
  value: RecencyFilter;
  label: string;
}> = [
  { value: 'any', label: 'Any' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

export const MAGNITUDE_OPTIONS: Array<{
  value: MagnitudeFilter;
  label: string;
}> = [
  { value: 'any', label: 'Any' },
  { value: '>100', label: '>100 acres' },
  { value: '>1k', label: '>1k acres' },
  { value: '>10k', label: '>10k acres' },
];

const RECENCY_MS: Record<Exclude<RecencyFilter, 'any'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

const MAGNITUDE_MIN: Record<Exclude<MagnitudeFilter, 'any'>, number> = {
  '>100': 100,
  '>1k': 1000,
  '>10k': 10000,
};

export function activeFilterCount(filters: FireFilters): number {
  return (
    (filters.recency !== 'any' ? 1 : 0) +
    (filters.magnitude !== 'any' ? 1 : 0) +
    (filters.search.trim() !== '' ? 1 : 0)
  );
}

export function matchesSearch(fire: Fire, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (term === '') {
    return true;
  }
  return (
    fire.title.toLowerCase().includes(term) ||
    fire.description.toLowerCase().includes(term)
  );
}

function withinRecency(
  fire: Fire,
  recency: RecencyFilter,
  now: number,
): boolean {
  if (recency === 'any') {
    return true;
  }
  const updatedAt = Date.parse(fire.geometry.date);
  if (Number.isNaN(updatedAt)) {
    return false;
  }
  return now - updatedAt <= RECENCY_MS[recency];
}

function meetsMagnitude(fire: Fire, magnitude: MagnitudeFilter): boolean {
  if (magnitude === 'any') {
    return true;
  }
  const value = fire.geometry.magnitudeValue;
  return value !== null && value >= MAGNITUDE_MIN[magnitude];
}

export function selectVisibleFires(
  fires: Fire[],
  filters: FireFilters,
  now: number,
): Fire[] {
  return fires.filter(
    (fire) =>
      withinRecency(fire, filters.recency, now) &&
      meetsMagnitude(fire, filters.magnitude) &&
      matchesSearch(fire, filters.search),
  );
}
