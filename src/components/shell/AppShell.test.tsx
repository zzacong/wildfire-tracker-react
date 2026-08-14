import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '#/components/shell/AppShell';
import type { Fire, WildfireStatus, WildfiresResult } from '#/lib/eonet';
import { wildfiresQueryKey } from '#/lib/wildfires';

const mapFiresMock = vi.fn();
vi.mock('#/components/map/MapSurface', () => ({
  MapSurface: ({
    fires,
    selectedFireId,
    onSelectFire,
  }: {
    fires: Fire[];
    selectedFireId: string | null;
    onSelectFire: (id: string) => void;
  }) => {
    mapFiresMock(fires);
    return (
      <main aria-label="Map">
        {fires.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-label={f.title}
            aria-pressed={f.id === selectedFireId}
            onClick={() => onSelectFire(f.id)}
          >
            {f.title}
          </button>
        ))}
      </main>
    );
  },
}));

function result(overrides: Partial<WildfiresResult> = {}): WildfiresResult {
  return {
    status: 'open',
    fires: [],
    fetchedAt: '2026-08-13T12:00:00Z',
    stale: false,
    ...overrides,
  };
}

function seedQueryClient(options?: { staleTime?: number }): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: options?.staleTime },
    },
  });
}

function renderAppShell(queryClient: QueryClient) {
  render(
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>,
  );
}

function seedFires(...fires: Fire[]) {
  const queryClient = seedQueryClient({ staleTime: Infinity });
  queryClient.setQueryData(wildfiresQueryKey('open'), result({ fires }), {
    updatedAt: Date.now(),
  });
  return queryClient;
}

function seedStatus(
  queryClient: QueryClient,
  status: WildfireStatus,
  ...fires: Fire[]
) {
  queryClient.setQueryData(
    wildfiresQueryKey(status),
    result({ status, fires }),
    { updatedAt: Date.now() },
  );
  return queryClient;
}

describe('AppShell', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders the dark-primary situation-room regions', async () => {
    const queryClient = seedQueryClient({ staleTime: Infinity });
    queryClient.setQueryData(wildfiresQueryKey('open'), result(), {
      updatedAt: Date.now(),
    });
    renderAppShell(queryClient);

    expect(
      screen.getByRole('heading', { name: /wildfire/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Wildfire ledger')).toBeInTheDocument();
    expect(screen.getByLabelText('Ledger entries')).toBeInTheDocument();
    expect(screen.getByLabelText('Burn ticker')).toBeInTheDocument();
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
  });

  it('shows the "Updated Xm ago" readout once data has loaded', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T12:03:00Z'));

    const queryClient = seedQueryClient({ staleTime: Infinity });
    queryClient.setQueryData(wildfiresQueryKey('open'), result(), {
      updatedAt: Date.parse('2026-08-13T12:00:00Z'),
    });
    renderAppShell(queryClient);

    expect(screen.getByText('Updated 3m ago')).toBeInTheDocument();
  });

  it('shows a full-screen error and recovers via Retry when the first load fails', async () => {
    const user = userEvent.setup();
    const queryClient = seedQueryClient();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('upstream down')),
    );

    renderAppShell(queryClient);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/load the wildfire feed/i)).toBeInTheDocument();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json(result({ fires: [fire()] }))),
    );

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
  });

  it('keeps the stale dataset visible and shows a banner when a refresh fails', async () => {
    const user = userEvent.setup();
    const queryClient = seedQueryClient({ staleTime: Infinity });
    queryClient.setQueryData(wildfiresQueryKey('open'), result(), {
      updatedAt: Date.now() - 5 * 60 * 1000,
    });
    renderAppShell(queryClient);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('upstream down')),
    );

    await user.click(screen.getByRole('button', { name: 'Refresh now' }));

    expect(
      await screen.findByText(/Couldn\u2019t refresh/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Updated 5m ago')).toBeInTheDocument();
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
  });

  it('surfaces fresh data immediately on a manual Refresh now', async () => {
    const user = userEvent.setup();
    const queryClient = seedQueryClient({ staleTime: Infinity });
    queryClient.setQueryData(wildfiresQueryKey('open'), result(), {
      updatedAt: Date.now() - 5 * 60 * 1000,
    });
    renderAppShell(queryClient);

    const fresh = result({ fires: [fire({ id: 'EONET_2' })] });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(fresh)));

    await user.click(screen.getByRole('button', { name: 'Refresh now' }));

    await waitFor(() =>
      expect(screen.queryByText('Updated 5m ago')).not.toBeInTheDocument(),
    );
  });

  describe('Open/All status toggle', () => {
    it('fetches the all feed when toggled from Open to All', async () => {
      const user = userEvent.setup();
      const allFires = [
        fire({ id: 'EONET_A', title: 'Big Blaze' }),
        fire({
          id: 'EONET_B',
          title: 'Burned Creek Fire',
          closed: '2026-08-10T00:00:00Z',
        }),
      ];
      renderAppShell(seedFires(fire()));

      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          Response.json(result({ status: 'all', fires: allFires })),
        );
      vi.stubGlobal('fetch', fetchMock);

      await user.click(screen.getByRole('radio', { name: 'all' }));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith('/api/eonet?status=all'),
      );
      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith(allFires),
      );
    });

    it('swaps between status-keyed cache slots without refetching', async () => {
      const user = userEvent.setup();
      const closedFire = fire({
        id: 'EONET_B',
        title: 'Burned Creek Fire',
        closed: '2026-08-10T00:00:00Z',
      });
      const queryClient = seedStatus(
        seedFires(fire()),
        'all',
        fire(),
        closedFire,
      );
      renderAppShell(queryClient);

      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await user.click(screen.getByRole('radio', { name: 'all' }));

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([fire(), closedFire]),
      );

      await user.click(screen.getByRole('radio', { name: 'open' }));

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([fire()]),
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('splits the ticker active/closed aggregates under All', async () => {
      const user = userEvent.setup();
      const closedFire = fire({
        id: 'EONET_B',
        title: 'Burned Creek Fire',
        closed: '2026-08-10T00:00:00Z',
      });
      const queryClient = seedStatus(
        seedFires(fire()),
        'all',
        fire(),
        closedFire,
      );
      renderAppShell(queryClient);

      expect(screen.queryByText('Closed fires')).not.toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: 'all' }));

      expect(screen.getByText('Closed fires')).toBeInTheDocument();
      expect(screen.getByText('Active fires')).toBeInTheDocument();
    });

    it('invalidates the active status query key on Refresh now', async () => {
      const user = userEvent.setup();
      const queryClient = seedQueryClient({ staleTime: Infinity });
      queryClient.setQueryData(wildfiresQueryKey('open'), result(), {
        updatedAt: Date.now() - 5 * 60 * 1000,
      });
      queryClient.setQueryData(
        wildfiresQueryKey('all'),
        result({ status: 'all' }),
        { updatedAt: Date.now() - 5 * 60 * 1000 },
      );
      renderAppShell(queryClient);

      await user.click(screen.getByRole('radio', { name: 'all' }));

      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          Response.json(result({ status: 'all', fires: [fire()] })),
        );
      vi.stubGlobal('fetch', fetchMock);

      await user.click(screen.getByRole('button', { name: 'Refresh now' }));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith('/api/eonet?status=all'),
      );
      expect(
        fetchMock.mock.calls.some(
          (call) => call[0] === '/api/eonet?status=open',
        ),
      ).toBe(false);
    });

    it('applies recency, magnitude, and search identically under All', async () => {
      const user = userEvent.setup();
      const bigOpen = fire({
        id: 'EONET_A',
        title: 'Ashland Inferno',
        geometry: { ...fire().geometry, magnitudeValue: 5000 },
      });
      const smallClosed = fire({
        id: 'EONET_B',
        title: 'Lazy Creek Fire',
        geometry: { ...fire().geometry, magnitudeValue: 50 },
        closed: '2026-08-10T00:00:00Z',
      });
      const queryClient = seedStatus(
        seedFires(bigOpen),
        'all',
        bigOpen,
        smallClosed,
      );
      renderAppShell(queryClient);

      await user.click(screen.getByRole('radio', { name: 'all' }));

      const search = screen.getByRole('searchbox', { name: /search/i });
      await user.type(search, 'ashland');
      await user.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>1k',
      );

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([bigOpen]),
      );
    });
  });

  describe('filters & search on the derived set', () => {
    it('projects the derived set onto the map markers', async () => {
      const recentLarge = fire({
        id: 'EONET_RECENT_LARGE',
        title: 'Massive Blaze',
        geometry: {
          ...fire().geometry,
          date: '2026-08-13T06:00:00Z',
          magnitudeValue: 5000,
        },
      });
      const oldNull = fire({
        id: 'EONET_OLD_NULL',
        title: 'Lazy Creek Fire',
        geometry: {
          ...fire().geometry,
          date: '2026-08-01T00:00:00Z',
          magnitudeValue: null,
        },
      });
      renderAppShell(seedFires(recentLarge, oldNull));

      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>1k',
      );

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([recentLarge]),
      );
    });

    it('ANDs recency, magnitude, and search into one visible set', async () => {
      const user = userEvent.setup();
      const recentLargeAshland = fire({
        id: 'EONET_A',
        title: 'Ashland Inferno',
        geometry: {
          ...fire().geometry,
          date: '2026-08-13T10:00:00Z',
          magnitudeValue: 20000,
        },
      });
      const recentSmallAshland = fire({
        id: 'EONET_B',
        title: 'Ashland Creek',
        geometry: {
          ...fire().geometry,
          date: '2026-08-13T10:00:00Z',
          magnitudeValue: 10,
        },
      });
      const oldHugeAshland = fire({
        id: 'EONET_C',
        title: 'Old Ashland Fire',
        geometry: {
          ...fire().geometry,
          date: '2026-07-01T00:00:00Z',
          magnitudeValue: 20000,
        },
      });
      const recentHugeOther = fire({
        id: 'EONET_D',
        description: 'Near a remote ridge line',
        geometry: {
          ...fire().geometry,
          date: '2026-08-13T10:00:00Z',
          magnitudeValue: 20000,
        },
      });
      renderAppShell(
        seedFires(
          recentLargeAshland,
          recentSmallAshland,
          oldHugeAshland,
          recentHugeOther,
        ),
      );

      const search = screen.getByRole('searchbox', { name: /search/i });
      await user.type(search, 'ashland');
      await user.selectOptions(
        screen.getByRole('combobox', { name: /recency/i }),
        '24h',
      );
      await user.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>10k',
      );

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([recentLargeAshland]),
      );
      expect(screen.getByText('3 active')).toBeInTheDocument();
    });

    it('shows the empty state and clears all filters with one tap', async () => {
      const user = userEvent.setup();
      const recentSmall = fire({
        id: 'EONET_1',
        geometry: {
          ...fire().geometry,
          date: '2026-08-13T06:00:00Z',
          magnitudeValue: 50,
        },
      });
      renderAppShell(seedFires(recentSmall));

      await user.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>10k',
      );

      expect(
        await screen.findByText('No fires match the current filters'),
      ).toBeInTheDocument();
      expect(screen.getByText('1 active')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear filters/i }));

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([recentSmall]),
      );
      expect(
        screen.queryByText('No fires match the current filters'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('0 active')).toBeInTheDocument();
    });

    it('does not show the empty state for an empty feed', async () => {
      renderAppShell(seedFires());

      expect(
        screen.queryByText('No fires match the current filters'),
      ).not.toBeInTheDocument();
    });

    it('keeps boundary magnitudes and excludes null-magnitude fires under a threshold', async () => {
      const atHundred = fire({
        id: 'EONET_AT_100',
        geometry: {
          ...fire().geometry,
          magnitudeValue: 100,
        },
      });
      const underHundred = fire({
        id: 'EONET_UNDER_100',
        geometry: {
          ...fire().geometry,
          magnitudeValue: 99,
        },
      });
      const nullMagnitude = fire({
        id: 'EONET_NULL_MAG',
        geometry: {
          ...fire().geometry,
          magnitudeValue: null,
        },
      });
      renderAppShell(seedFires(atHundred, underHundred, nullMagnitude));

      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>100',
      );

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([atHundred]),
      );
    });

    it('slices recency by the 24h window on the latest update date', async () => {
      const withinDay = fire({
        id: 'EONET_WITHIN_24H',
        geometry: {
          ...fire().geometry,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      });
      const olderThanDay = fire({
        id: 'EONET_OLDER_24H',
        geometry: {
          ...fire().geometry,
          date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        },
      });
      renderAppShell(seedFires(withinDay, olderThanDay));

      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /recency/i }),
        '24h',
      );

      await waitFor(() =>
        expect(mapFiresMock).toHaveBeenLastCalledWith([withinDay]),
      );
    });
  });

  describe('detail panel wiring', () => {
    it('opens the detail panel when a fire is selected and restores focus on Escape', async () => {
      const user = userEvent.setup();
      renderAppShell(seedFires(fire()));
      const marker = screen.getByRole('button', {
        name: 'Wildfire Harris, Rosebud, Montana',
      });

      await user.click(marker);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Wildfire Harris, Rosebud, Montana');
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(marker).toHaveFocus();
    });

    it('keeps the selected fire in the panel even when filters hide it', async () => {
      const user = userEvent.setup();
      const small = fire({
        id: 'EONET_SMALL',
        geometry: { ...fire().geometry, magnitudeValue: 50 },
      });
      renderAppShell(seedFires(small));
      const marker = screen.getByRole('button', {
        name: 'Wildfire Harris, Rosebud, Montana',
      });

      await user.click(marker);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.selectOptions(
        screen.getByRole('combobox', { name: /magnitude/i }),
        '>10k',
      );

      await waitFor(() => expect(mapFiresMock).toHaveBeenLastCalledWith([]));
      expect(screen.getByRole('dialog')).toHaveAccessibleName(
        'Wildfire Harris, Rosebud, Montana',
      );
    });

    it('swaps the panel content in place when another fire is selected', async () => {
      const user = userEvent.setup();
      renderAppShell(
        seedFires(fire(), fire({ id: 'EONET_2', title: 'Lost Lake Fire' })),
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Wildfire Harris, Rosebud, Montana',
        }),
      );
      const dialog = screen.getByRole('dialog');

      await user.click(screen.getByRole('button', { name: 'Lost Lake Fire' }));

      expect(screen.getByRole('dialog')).toBe(dialog);
      expect(dialog).toHaveAccessibleName('Lost Lake Fire');
    });

    it('closes the panel via the close button', async () => {
      const user = userEvent.setup();
      renderAppShell(seedFires(fire()));

      await user.click(
        screen.getByRole('button', {
          name: 'Wildfire Harris, Rosebud, Montana',
        }),
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: 'Close detail panel' }),
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

function fire(overrides: Partial<Fire> = {}): Fire {
  return {
    id: 'EONET_1',
    title: 'Wildfire Harris, Rosebud, Montana',
    description: '30 Miles SW from Ashland, MT',
    link: '/events/EONET_1',
    closed: null,
    sources: [
      { id: 'IRWIN', url: 'https://irwin.doi.gov/observer/incidents/1' },
    ],
    geometry: {
      type: 'Point',
      date: '2026-08-09T16:55:00Z',
      coordinates: [-106.634317, 45.195183],
      magnitudeValue: 924.3,
      magnitudeUnit: 'acres',
    },
    ...overrides,
  };
}
