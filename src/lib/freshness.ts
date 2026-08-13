export function minutesSince(timestampMs: number, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - timestampMs) / 60_000));
}

function formatAge(minutes: number): string {
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  return `${Math.floor(minutes / 60)}h ago`;
}

export function formatUpdatedAgo(timestampMs: number, nowMs: number): string {
  return `Updated ${formatAge(minutesSince(timestampMs, nowMs))}`;
}

export function formatDataAge(timestampMs: number, nowMs: number): string {
  return formatAge(minutesSince(timestampMs, nowMs));
}
