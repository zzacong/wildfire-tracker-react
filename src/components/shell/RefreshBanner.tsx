import { formatDataAge } from '#/lib/freshness';
import { useNow } from '#/lib/use-now';

export interface RefreshBannerProps {
  updatedAt: number;
  onRetry: () => void;
}

export function RefreshBanner({ updatedAt, onRetry }: RefreshBannerProps) {
  const now = useNow();

  return (
    <output className="border-hairline bg-panel text-muted flex items-center gap-4 border px-4 py-2 font-mono text-[11px]">
      <p>
        Couldn&rsquo;t refresh — showing data from{' '}
        {formatDataAge(updatedAt, now)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-accent hover:text-bone ml-auto text-[11px] font-medium tracking-[0.12em] uppercase"
      >
        Retry
      </button>
    </output>
  );
}
