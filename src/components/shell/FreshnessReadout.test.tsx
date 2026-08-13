import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FreshnessReadout } from './FreshnessReadout';

describe('FreshnessReadout', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the updated-ago label for the data timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T12:03:00Z'));
    const updatedAt = Date.parse('2026-08-13T12:00:00Z');

    render(<FreshnessReadout updatedAt={updatedAt} />);

    expect(screen.getByText('Updated 3m ago')).toBeInTheDocument();
  });
});
