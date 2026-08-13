import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FireFilters } from '#/lib/fire-filters';
import { FIRE_FILTERS_DEFAULT } from '#/lib/fire-filters';

import { FilterBar } from './FilterBar';

function Harness({ onChange }: { onChange?: (f: FireFilters) => void }) {
  const [filters, setFilters] = useState<FireFilters>(FIRE_FILTERS_DEFAULT);
  return (
    <FilterBar
      filters={filters}
      onChange={(next) => {
        setFilters(next);
        onChange?.(next);
      }}
    />
  );
}

function renderFilterBar(
  filters: FireFilters,
  onChange: (filters: FireFilters) => void,
) {
  render(<FilterBar filters={filters} onChange={onChange} />);
}

describe('FilterBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders one flat row: recency, magnitude, and a search box', () => {
    renderFilterBar({ recency: 'any', magnitude: 'any', search: '' }, () => {});

    expect(
      screen.getByRole('combobox', { name: /recency/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /magnitude/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: /search/i }),
    ).toBeInTheDocument();
  });

  it('exposes the recency and magnitude option sets', () => {
    renderFilterBar({ recency: 'any', magnitude: 'any', search: '' }, () => {});

    const recency = screen.getByRole('combobox', { name: /recency/i });
    expect(recency).toHaveDisplayValue('Any');
    expect(
      Array.from(recency.querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(['Any', '24h', '7d']);

    const magnitude = screen.getByRole('combobox', { name: /magnitude/i });
    expect(magnitude).toHaveDisplayValue('Any');
    expect(
      Array.from(magnitude.querySelectorAll('option')).map(
        (o) => o.textContent,
      ),
    ).toEqual(['Any', '>100 acres', '>1k acres', '>10k acres']);
  });

  it('reports the active-filter count always, even at zero', () => {
    renderFilterBar({ recency: 'any', magnitude: 'any', search: '' }, () => {});

    expect(screen.getByText('0 active')).toBeInTheDocument();
  });

  it('counts only non-default dimensions as active', () => {
    renderFilterBar(
      { recency: '7d', magnitude: '>1k', search: 'ashland' },
      () => {},
    );

    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('calls onChange with the new recency value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilterBar({ recency: 'any', magnitude: 'any', search: '' }, onChange);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /recency/i }),
      '24h',
    );

    expect(onChange).toHaveBeenCalledWith({
      recency: '24h',
      magnitude: 'any',
      search: '',
    });
  });

  it('calls onChange with the new magnitude value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilterBar({ recency: 'any', magnitude: 'any', search: '' }, onChange);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /magnitude/i }),
      '>10k',
    );

    expect(onChange).toHaveBeenCalledWith({
      recency: 'any',
      magnitude: '>10k',
      search: '',
    });
  });

  it('calls onChange as the search query is typed and keeps the box in sync', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const search = screen.getByRole('searchbox', { name: /search/i });
    await user.type(search, 'boot');

    expect(search).toHaveValue('boot');
    await waitFor(() => {
      const lastCall = onChange.mock.calls.at(-1)?.[0];
      expect(lastCall?.search).toBe('boot');
    });
  });

  it('shows a Clear search button and empties the query on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilterBar(
      { recency: 'any', magnitude: 'any', search: 'boot' },
      onChange,
    );

    await user.click(screen.getByRole('button', { name: /clear search/i }));

    expect(onChange).toHaveBeenCalledWith({
      recency: 'any',
      magnitude: 'any',
      search: '',
    });
  });

  it('reflects the current search value', () => {
    renderFilterBar(
      { recency: 'any', magnitude: 'any', search: 'boot' },
      () => {},
    );

    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue(
      'boot',
    );
  });

  it('treats a whitespace-only search as inactive', () => {
    renderFilterBar(
      { recency: 'any', magnitude: 'any', search: '   ' },
      () => {},
    );

    expect(
      screen.queryByRole('button', { name: /clear search/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('0 active')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /clear all filters/i }),
    ).not.toBeInTheDocument();
  });
});
