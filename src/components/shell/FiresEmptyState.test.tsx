import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FiresEmptyState } from './FiresEmptyState';

describe('FiresEmptyState', () => {
  afterEach(() => {
    cleanup();
  });

  it('explains that no fires match the current filters', () => {
    render(<FiresEmptyState onClearFilters={() => {}} />);

    expect(
      screen.getByText('No fires match the current filters'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument();
  });

  it('does not offer to clear filters when the feed itself is empty', () => {
    render(<FiresEmptyState />);

    expect(screen.getByText('No fires in this view')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /clear filters/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onClearFilters on one tap', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(<FiresEmptyState onClearFilters={onClearFilters} />);

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
