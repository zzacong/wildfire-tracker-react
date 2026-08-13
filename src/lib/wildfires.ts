import { queryOptions } from '@tanstack/react-query';

import type { WildfireStatus, WildfiresResult } from './eonet';

export const wildfiresQueryKey = (status: WildfireStatus) =>
  ['eonet', 'wildfires', status] as const;

export const wildfiresQueryOptions = (status: WildfireStatus) =>
  queryOptions({
    queryKey: wildfiresQueryKey(status),
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
