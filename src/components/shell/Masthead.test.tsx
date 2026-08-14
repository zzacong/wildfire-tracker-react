import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Masthead } from './Masthead';

function renderMasthead(
  overrides: Partial<Parameters<typeof Masthead>[0]> = {},
) {
  return render(
    <Masthead
      updatedAt={null}
      isRefreshing={false}
      onRefresh={() => {}}
      status="open"
      onStatusChange={() => {}}
      {...overrides}
    />,
  );
}

describe('Masthead', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the segmented Open/All status control', () => {
    renderMasthead();

    expect(screen.getByRole('radio', { name: 'open' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'all' })).toBeInTheDocument();
  });

  it('checks the active status and unchecks the other', () => {
    renderMasthead({ status: 'all' });

    expect(screen.getByRole('radio', { name: 'all' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'open' })).not.toBeChecked();
  });

  it('reports a status change when a segment is clicked', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    renderMasthead({ status: 'open', onStatusChange });

    await user.click(screen.getByRole('radio', { name: 'all' }));

    expect(onStatusChange).toHaveBeenCalledWith('all');
  });
});
