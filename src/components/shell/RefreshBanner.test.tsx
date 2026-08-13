import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RefreshBanner } from './RefreshBanner';

describe('RefreshBanner', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('tells the visitor data is stale and how old it is', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T12:05:00Z'));
    const updatedAt = Date.parse('2026-08-13T12:00:00Z');

    render(<RefreshBanner updatedAt={updatedAt} onRetry={() => {}} />);

    expect(
      screen.getByText('Couldn\u2019t refresh — showing data from 5m ago'),
    ).toBeInTheDocument();
  });

  it('retries on demand', () => {
    const onRetry = vi.fn();
    render(<RefreshBanner updatedAt={Date.now()} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
