import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Fire } from '#/lib/eonet';

import { LedgerRail } from './LedgerRail';

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
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      coordinates: [-106.634317, 45.195183],
      magnitudeValue: 924.3,
      magnitudeUnit: 'acres',
    },
    ...overrides,
  };
}

interface LedgerRailFixtureProps {
  fires: Fire[];
  initialSelectedId?: string | null;
  onSelectFire?: (id: string) => void;
}

function LedgerRailFixture({
  fires,
  initialSelectedId = null,
  onSelectFire,
}: LedgerRailFixtureProps) {
  const [selectedFireId, setSelectedFireId] = useState<string | null>(
    initialSelectedId,
  );
  return (
    <LedgerRail
      updatedAt={null}
      isRefreshing={false}
      onRefresh={() => {}}
      fires={fires}
      selectedFireId={selectedFireId}
      onSelectFire={(id) => {
        setSelectedFireId((current) => (current === id ? null : id));
        onSelectFire?.(id);
      }}
      status="open"
      onStatusChange={() => {}}
      activeFilterCount={0}
    />
  );
}

function renderLedgerRail(
  fires: Fire[],
  selectedFireId: string | null,
  onSelectFire: (id: string) => void,
) {
  return render(
    <LedgerRail
      updatedAt={null}
      isRefreshing={false}
      onRefresh={() => {}}
      fires={fires}
      selectedFireId={selectedFireId}
      onSelectFire={onSelectFire}
      status="open"
      onStatusChange={() => {}}
      activeFilterCount={0}
    />,
  );
}

describe('LedgerRail', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders one numbered button row per fire in the derived set', () => {
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    const lazyCreek = fire({ id: 'EONET_B', title: 'Lazy Creek Fire' });
    renderLedgerRail([ashland, lazyCreek], null, () => {});

    expect(
      screen.getByRole('heading', { name: /wildfire/i }),
    ).toBeInTheDocument();

    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('renders each fire as a button whose accessible name is name and size', () => {
    const ashland = fire({
      id: 'EONET_A',
      title: 'Ashland Inferno',
    });
    const unknown = fire({
      id: 'EONET_B',
      title: 'Lazy Creek Fire',
      geometry: {
        ...fire().geometry,
        magnitudeValue: null,
      },
    });
    renderLedgerRail([ashland, unknown], null, () => {});

    expect(
      screen.getByRole('button', { name: 'Ashland Inferno, 924 acres' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Lazy Creek Fire, Not reported' }),
    ).toBeInTheDocument();
  });

  it('reflects the shared selection via aria-pressed', () => {
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    const lazyCreek = fire({ id: 'EONET_B', title: 'Lazy Creek Fire' });
    renderLedgerRail([ashland, lazyCreek], 'EONET_A', () => {});

    expect(
      screen.getByRole('button', { name: 'Ashland Inferno, 924 acres' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Lazy Creek Fire, 924 acres' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelectFire with the fire id when a row is clicked', async () => {
    const user = userEvent.setup();
    const onSelectFire = vi.fn();
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    renderLedgerRail([ashland], null, onSelectFire);

    await user.click(
      screen.getByRole('button', { name: 'Ashland Inferno, 924 acres' }),
    );

    expect(onSelectFire).toHaveBeenCalledWith('EONET_A');
  });

  it('toggles a selected row off when it is clicked again', async () => {
    const user = userEvent.setup();
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    render(<LedgerRailFixture fires={[ashland]} initialSelectedId="EONET_A" />);

    const row = screen.getByRole('button', {
      name: 'Ashland Inferno, 924 acres',
    });
    expect(row).toHaveAttribute('aria-pressed', 'true');

    await user.click(row);

    expect(row).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows an Open status chip on every open row', () => {
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    const lazyCreek = fire({ id: 'EONET_B', title: 'Lazy Creek Fire' });
    renderLedgerRail([ashland, lazyCreek], null, () => {});

    expect(screen.getAllByText('Open')).toHaveLength(2);
  });

  it('shows a Closed status chip on closed rows', () => {
    const ashland = fire({ id: 'EONET_A', title: 'Ashland Inferno' });
    const burnedOut = fire({
      id: 'EONET_B',
      title: 'Lazy Creek Fire',
      closed: '2026-08-10T00:00:00Z',
    });
    renderLedgerRail([ashland, burnedOut], null, () => {});

    expect(screen.getAllByText('Open')).toHaveLength(1);
    expect(screen.getByText('Closed')).toBeInTheDocument();
    const closedRow = screen.getByRole('button', {
      name: 'Lazy Creek Fire, 924 acres',
    });
    expect(within(closedRow).getByText('Closed')).toBeInTheDocument();
    expect(within(closedRow).queryByText('Open')).not.toBeInTheDocument();
  });
});
