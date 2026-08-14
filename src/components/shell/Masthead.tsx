import type { WildfireStatus } from '#/lib/eonet';
import { cn } from '#/lib/utils';

import { FlameIcon } from '../FlameIcon';
import { FreshnessReadout } from './FreshnessReadout';

export interface MastheadProps {
  updatedAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  status: WildfireStatus;
  onStatusChange: (status: WildfireStatus) => void;
}

export const STATUS_OPTIONS: WildfireStatus[] = ['open', 'all'];

export function Masthead({
  updatedAt,
  isRefreshing,
  onRefresh,
  status,
  onStatusChange,
}: MastheadProps) {
  return (
    <header className="border-hairline border-b px-6 pt-[26px] pb-[18px]">
      <div className="flex items-center gap-2">
        <FlameIcon className="text-accent size-[26px]" />
        <h1 className="font-display text-bone text-[30px] leading-none font-bold tracking-[-0.02em]">
          WILDFIRE
        </h1>
        <div className="border-hairline bg-forest ml-auto flex rounded-[8px] border p-0.5">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option;
            return (
              <label
                key={option}
                className={cn(
                  'has-[:focus-visible]:outline-bone has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-2 cursor-pointer rounded-[6px] px-3 py-1 font-mono text-[10px] font-medium tracking-[0.14em] uppercase',
                  active
                    ? 'bg-accent text-accent-ink'
                    : 'text-muted hover:text-bone',
                )}
              >
                <input
                  type="radio"
                  name="wildfire-status"
                  value={option}
                  checked={active}
                  onChange={() => onStatusChange(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      </div>
      <div className="text-muted mt-3 flex items-center gap-2.5 text-xs">
        <span className="text-accent flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
          <span
            aria-hidden="true"
            className="bg-accent size-1.5 animate-pulse rounded-full"
          />
          Live feed
        </span>
        <span aria-hidden="true">·</span>
        <span>NASA EONET v3</span>
        {updatedAt !== null && (
          <>
            <span aria-hidden="true">·</span>
            <FreshnessReadout updatedAt={updatedAt} />
          </>
        )}
        <span className="ml-auto flex items-center gap-1">
          {isRefreshing && (
            <span
              aria-hidden="true"
              className="border-accent/40 size-3 animate-spin rounded-full border-2 border-t-transparent"
            />
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="text-accent hover:text-bone font-mono text-[10px] font-medium tracking-[0.12em] uppercase"
          >
            Refresh now
          </button>
        </span>
      </div>
    </header>
  );
}
