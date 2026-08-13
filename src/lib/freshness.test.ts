import { describe, expect, it } from 'vitest';

import { formatDataAge, formatUpdatedAgo, minutesSince } from './freshness';

const NOW = new Date('2026-08-13T12:00:00Z').getTime();

describe('minutesSince', () => {
  it('is zero for the same instant', () => {
    expect(minutesSince(NOW, NOW)).toBe(0);
  });

  it('measures whole minutes in the past', () => {
    expect(minutesSince(NOW - 3 * 60_000, NOW)).toBe(3);
  });

  it('never reports a negative age for future timestamps', () => {
    expect(minutesSince(NOW + 60_000, NOW)).toBe(0);
  });
});

describe('formatUpdatedAgo', () => {
  it('says just now for data under a minute old', () => {
    expect(formatUpdatedAgo(NOW, NOW)).toBe('Updated just now');
  });

  it('reports minutes in the past', () => {
    expect(formatUpdatedAgo(NOW - 3 * 60_000, NOW)).toBe('Updated 3m ago');
  });

  it('reports hours past an hour', () => {
    expect(formatUpdatedAgo(NOW - 2 * 3_600_000, NOW)).toBe('Updated 2h ago');
  });
});

describe('formatDataAge', () => {
  it('formats the bare age used by the banner', () => {
    expect(formatDataAge(NOW - 5 * 60_000, NOW)).toBe('5m ago');
  });
});
