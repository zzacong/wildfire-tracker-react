import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { MapSurface } from '#/components/map/MapSurface';
import { wildfiresQueryKey, wildfiresQueryOptions } from '#/lib/wildfires';

import { BurnTicker } from './BurnTicker';
import { FirstLoadError } from './FirstLoadError';
import { LedgerRail } from './LedgerRail';
import { RefreshBanner } from './RefreshBanner';

export function AppShell() {
  const queryClient = useQueryClient();
  const { data, dataUpdatedAt, isError, isFetching } = useQuery(
    wildfiresQueryOptions('open'),
  );
  const [selectedFireId, setSelectedFireId] = useState<string | null>(null);

  const onSelectFire = (id: string) =>
    setSelectedFireId((current) => (current === id ? null : id));

  const bustCacheAndRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: wildfiresQueryKey('open'),
    });
  };

  const fires = data?.fires ?? [];

  if (isError && !data) {
    return <FirstLoadError onRetry={bustCacheAndRefresh} />;
  }

  return (
    <div className="bg-forest text-bone flex h-full w-full overflow-hidden">
      <LedgerRail
        updatedAt={dataUpdatedAt > 0 ? dataUpdatedAt : null}
        isRefreshing={isFetching}
        onRefresh={bustCacheAndRefresh}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {isError && data && (
          <RefreshBanner
            updatedAt={dataUpdatedAt}
            onRetry={bustCacheAndRefresh}
          />
        )}
        <MapSurface
          fires={fires}
          selectedFireId={selectedFireId}
          onSelectFire={onSelectFire}
          isLoading={isFetching && fires.length === 0}
        />
        <BurnTicker />
      </div>
    </div>
  );
}
