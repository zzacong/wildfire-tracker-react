import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { MapSurface } from '#/components/map/MapSurface';
import { wildfiresQueryOptions } from '#/lib/wildfires';

import { BurnTicker } from './BurnTicker';
import { LedgerRail } from './LedgerRail';

export function AppShell() {
  const { data, isLoading } = useQuery(wildfiresQueryOptions('open'));
  const [selectedFireId, setSelectedFireId] = useState<string | null>(null);

  const onSelectFire = (id: string) =>
    setSelectedFireId((current) => (current === id ? null : id));

  return (
    <div className="bg-forest text-bone flex h-full w-full overflow-hidden">
      <LedgerRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <MapSurface
          fires={data?.fires ?? []}
          selectedFireId={selectedFireId}
          onSelectFire={onSelectFire}
          isLoading={isLoading}
        />
        <BurnTicker />
      </div>
    </div>
  );
}
