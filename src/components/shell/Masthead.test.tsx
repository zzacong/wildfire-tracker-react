import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
      activeFilterCount={0}
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

  it('renders the assembled masthead: brand, LIVE, readout, refresh, and active-filter count', () => {
    renderMasthead({
      updatedAt: Date.now(),
      onRefresh: () => {},
      activeFilterCount: 2,
    });

    expect(
      screen.getByRole('heading', { name: 'WILDFIRE' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Live feed')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'open' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'all' })).toBeInTheDocument();
    expect(screen.getByText(/^Updated /)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh now' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Active filter count')).toHaveTextContent(
      '2 active',
    );
  });

  it('shows the active-filter count always, even at zero', () => {
    renderMasthead({ activeFilterCount: 0 });

    expect(screen.getByLabelText('Active filter count')).toHaveTextContent(
      '0 active',
    );
  });

  it('reports the latest active-filter count from props', () => {
    const rendered = renderMasthead({ activeFilterCount: 1 });

    rendered.rerender(
      <Masthead
        updatedAt={null}
        isRefreshing={false}
        onRefresh={() => {}}
        status="open"
        onStatusChange={() => {}}
        activeFilterCount={3}
      />,
    );

    expect(screen.getByLabelText('Active filter count')).toHaveTextContent(
      '3 active',
    );
  });

  it('keeps the LIVE dot static under prefers-reduced-motion via the global rule', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    renderMasthead({ updatedAt: Date.now() });

    const dot = document.querySelector('.animate-pulse');
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass('bg-accent');

    const css = readFileSync(
      join(import.meta.dirname, '..', '..', 'styles.css'),
      'utf8',
    );
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).toMatch(/\*\s*,\s*\*::before,\s*\*::after/);
    expect(css).toMatch(
      /animation-duration:\s*var\(--motion-reduce\)\s*!important/,
    );
    expect(css).toMatch(/animation-iteration-count:\s*1\s*!important/);
    expect(css).toMatch(
      /transition-duration:\s*var\(--motion-reduce\)\s*!important/,
    );
  });
});
