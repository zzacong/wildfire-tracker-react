import { formatFireSize } from '#/components/map/fireMarker';
import type { Fire, WildfireStatus } from '#/lib/eonet';
import { formatDataAge } from '#/lib/freshness';
import { useNow } from '#/lib/use-now';
import { cn } from '#/lib/utils';

import { Masthead } from './Masthead';

export interface LedgerRailProps {
  updatedAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  fires: Fire[];
  selectedFireId: string | null;
  onSelectFire: (id: string) => void;
  status: WildfireStatus;
  onStatusChange: (status: WildfireStatus) => void;
  activeFilterCount: number;
}

function sourceName(fire: Fire): string {
  return fire.sources[0]?.id ?? '—';
}

export function LedgerRail({
  updatedAt,
  isRefreshing,
  onRefresh,
  fires,
  selectedFireId,
  onSelectFire,
  status,
  onStatusChange,
  activeFilterCount,
}: LedgerRailProps) {
  const now = useNow();

  return (
    <aside
      aria-label="Wildfire ledger"
      className="border-hairline bg-panel flex w-[372px] shrink-0 flex-col border-r"
    >
      <Masthead
        updatedAt={updatedAt}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        status={status}
        onStatusChange={onStatusChange}
        activeFilterCount={activeFilterCount}
      />
      <div
        aria-label="Ledger entries"
        className="min-h-0 flex-1 overflow-y-auto px-6 py-2"
      >
        <ol>
          {fires.map((fire, index) => {
            const [lng, lat] = fire.geometry.coordinates;
            const selected = fire.id === selectedFireId;
            return (
              <li key={fire.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${fire.title}, ${formatFireSize(fire.geometry.magnitudeValue)}`}
                  onClick={() => onSelectFire(fire.id)}
                  className={cn(
                    'hover:bg-[rgba(242,236,226,.04)] grid w-full cursor-pointer grid-cols-[34px_1fr_auto] items-start gap-x-3.5 gap-y-0.5 rounded-row border-l-2 py-4 text-left',
                    selected
                      ? 'border-l-accent bg-[rgba(242,103,43,.08)]'
                      : 'border-l-transparent',
                  )}
                >
                  <span className="text-faint pt-0.5 font-mono text-[11px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-bone text-sm leading-snug font-semibold">
                    {fire.title}
                  </span>
                  <span className="text-accent text-right font-mono text-[13px] font-semibold">
                    {formatFireSize(fire.geometry.magnitudeValue)}
                  </span>
                  <span className="text-faint col-span-2 col-start-2 mt-0.5 font-mono text-[10px]">
                    {fire.closed === null ? (
                      <span className="border-hairline text-accent rounded-[4px] border px-1 py-px font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
                        Open
                      </span>
                    ) : (
                      <span className="border-hairline-strong text-muted rounded-[4px] border px-1 py-px font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
                        Closed
                      </span>
                    )}
                    <span aria-hidden="true"> · </span>
                    {formatDataAge(Date.parse(fire.geometry.date), now)}
                    <span aria-hidden="true"> · </span>
                    {lat.toFixed(2)}°, {lng.toFixed(2)}°
                    <span aria-hidden="true"> · </span>
                    {sourceName(fire)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
