import { describe, expect, it } from 'vitest';

import { wildfiresQueryKey, wildfiresQueryOptions } from './wildfires';

describe('wildfiresQueryOptions', () => {
  it('polls every 5 minutes', () => {
    expect(wildfiresQueryOptions('open').refetchInterval).toBe(5 * 60 * 1000);
  });

  it('pauses polling while the tab is hidden and refetches on focus', () => {
    const options = wildfiresQueryOptions('open');
    expect(options.refetchIntervalInBackground).toBe(false);
    expect(options.refetchOnWindowFocus).toBe('always');
  });

  it('keys queries by status', () => {
    expect(wildfiresQueryKey('open')).toEqual(['eonet', 'wildfires', 'open']);
    expect(wildfiresQueryKey('all')).toEqual(['eonet', 'wildfires', 'all']);
  });
});
