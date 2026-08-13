import { formatUpdatedAgo } from '#/lib/freshness';
import { useNow } from '#/lib/use-now';

export interface FreshnessReadoutProps {
  updatedAt: number;
}

export function FreshnessReadout({ updatedAt }: FreshnessReadoutProps) {
  const now = useNow();
  return <span>{formatUpdatedAgo(updatedAt, now)}</span>;
}
