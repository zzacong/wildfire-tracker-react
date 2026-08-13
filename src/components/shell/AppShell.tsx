import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { MapSurface } from '#/components/map/MapSurface';
import { FIRE_FILTERS_DEFAULT, selectVisibleFires } from '#/lib/fire-filters';
import { useNow } from '#/lib/use-now';
import { wildfiresQueryKey, wildfiresQueryOptions } from '#/lib/wildfires';

import { BurnTicker } from './BurnTicker';
import { FilterBar } from './FilterBar';
import { FiresEmptyState } from './FiresEmptyState';
import { FirstLoadError } from './FirstLoadError';
import { LedgerRail } from './LedgerRail';
import { RefreshBanner } from './RefreshBanner';

export function AppShell() {
  const queryClient = useQueryClient();
  const { data, dataUpdatedAt, isError, isFetching } = useQuery(
    wildfiresQueryOptions('open'),
  );
  const [selectedFireId, setSelectedFireId] = useState<string | null>(null);
  const [filters, setFilters] = useState(FIRE_FILTERS_DEFAULT);
  const now = useNow();

  const onSelectFire = (id: string) =>
    setSelectedFireId((current) => (current === id ? null : id));

  const bustCacheAndRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: wildfiresQueryKey('open'),
    });
  };

  const fires = useMemo(() => data?.fires ?? [], [data]);
  const visibleFires = useMemo(
    () => selectVisibleFires(fires, filters, now),
    [fires, filters, now],
  );

  if (isError && !data) {
    return <FirstLoadError onRetry={bustCacheAndRefresh} />;
  }

  return (
    <div className="bg-forest text-bone flex h-full w-full overflow-hidden">
      <LedgerRail
        updatedAt={dataUpdatedAt > 0 ? dataUpdatedAt : null}
        isRefreshing={isFetching}
        onRefresh={bustCacheAndRefresh}
        fires={visibleFires}
        selectedFireId={selectedFireId}
        onSelectFire={onSelectFire}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {isError && data && (
          <RefreshBanner
            updatedAt={dataUpdatedAt}
            onRetry={bustCacheAndRefresh}
          />
        )}
        {data && <FilterBar filters={filters} onChange={setFilters} />}
        <div className="relative min-h-0 flex-1">
          <MapSurface
            fires={visibleFires}
            selectedFireId={selectedFireId}
            onSelectFire={onSelectFire}
            isLoading={isFetching && fires.length === 0}
          />
          {data && fires.length > 0 && visibleFires.length === 0 && (
            <FiresEmptyState
              onClearFilters={() => setFilters(FIRE_FILTERS_DEFAULT)}
            />
          )}
          {data && fires.length === 0 && visibleFires.length === 0 && (
            <FiresEmptyState />
          )}
        </div>
        <BurnTicker
          fires={visibleFires}
          dataUpdatedAt={dataUpdatedAt > 0 ? dataUpdatedAt : null}
        />
      </div>
    </div>
  );
}
