import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '#/components/shell/AppShell';
import type { Fire, WildfiresResult } from '#/lib/eonet';
import { wildfiresQueryKey } from '#/lib/wildfires';

vi.mock('#/components/map/MapSurface', () => ({
  MapSurface: () => <main aria-label="Map" />,
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
