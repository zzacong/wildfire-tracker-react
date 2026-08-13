import { queryOptions } from '@tanstack/react-query';

import type { WildfireStatus, WildfiresResult } from './eonet';

export const wildfiresQueryKey = (status: WildfireStatus) =>
  ['eonet', 'wildfires', status] as const;

export const WILDFIRES_POLL_INTERVAL_MS = 5 * 60 * 1000;

export const wildfiresQueryOptions = (status: WildfireStatus) =>
  queryOptions({
    queryKey: wildfiresQueryKey(status),
    refetchInterval: WILDFIRES_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    queryFn: async () => {
      if (import.meta.env.SSR) {
        const { getWildfires } = await import('./eonet-server');
        return getWildfires(status);
      }
      const res = await fetch(`/api/eonet?status=${status}`);
      if (!res.ok) {
        throw new Error(`Wildfires request failed: ${res.status}`);
      }
      return (await res.json()) as WildfiresResult;
    },
  });
