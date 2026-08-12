import { BurnTicker } from './BurnTicker';
import { LedgerRail } from './LedgerRail';
import { MapSurface } from './MapSurface';

export function AppShell() {
  return (
    <div className="bg-forest text-bone flex h-full w-full overflow-hidden">
      <LedgerRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <MapSurface />
        <BurnTicker />
      </div>
    </div>
  );
}
