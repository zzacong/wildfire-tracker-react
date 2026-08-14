import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Fire } from '#/lib/eonet';

const markerInstances: Array<{
  element: HTMLElement | undefined;
  setLngLat: ReturnType<typeof vi.fn>;
  addTo: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('maplibre-gl', () => {
  class Marker {
    element: HTMLElement | undefined;
    setLngLat = vi.fn(() => this);
    addTo = vi.fn(() => this);
    remove = vi.fn();

    constructor(options: { element?: HTMLElement } = {}) {
      this.element = options.element;
      markerInstances.push(this);
    }
  }

  class Map {
    on = vi.fn((event: string, cb: () => void) => {
      if (event === 'load') cb();
    });
    addControl = vi.fn();
    getCanvas = () => ({
      setAttribute: vi.fn(),
    });
    remove = vi.fn();
  }

  return {
    Map,
    Marker,
    NavigationControl: class {},
    AttributionControl: class {},
  };
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

describe('MapSurface', () => {
  beforeEach(() => {
    markerInstances.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('creates a marker per fire and sets the basemap canvas to aria-hidden', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[fire({ id: 'EONET_1' }), fire({ id: 'EONET_2' })]}
        selectedFireId={null}
        onSelectFire={() => {}}
        isLoading={false}
      />,
    );

    expect(markerInstances).toHaveLength(2);
    expect(markerInstances[0].setLngLat).toHaveBeenCalledWith([
      -106.634317, 45.195183,
    ]);
    expect(markerInstances[0].addTo).toHaveBeenCalled();
  });

  it('shows the map key text', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[]}
        selectedFireId={null}
        onSelectFire={() => {}}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText(
        'orange flame = active wildfire; muted flame = closed fire; size and status in the ledger/ticker',
      ),
    ).toBeInTheDocument();
  });

  it('shows the loading skeleton when loading with no fires yet', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[]}
        selectedFireId={null}
        onSelectFire={() => {}}
        isLoading={true}
      />,
    );

    expect(screen.getByText('Loading fires…')).toBeInTheDocument();
  });

  it('does not show the loading skeleton once fires arrive', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[fire()]}
        selectedFireId={null}
        onSelectFire={() => {}}
        isLoading={true}
      />,
    );

    expect(screen.queryByText('Loading fires…')).not.toBeInTheDocument();
  });

  it('activates a fire when its marker button is clicked', async () => {
    const { MapSurface } = await import('./MapSurface');
    const onSelectFire = vi.fn();
    render(
      <MapSurface
        fires={[fire({ id: 'EONET_1' }), fire({ id: 'EONET_2' })]}
        selectedFireId={null}
        onSelectFire={onSelectFire}
        isLoading={false}
      />,
    );

    await waitFor(() => {
      const markers = markerInstances
        .map((m) => m.element)
        .filter(
          (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
        );
      expect(markers).toHaveLength(2);
    });

    const marker = markerInstances
      .map((m) => m.element)
      .find((el) => el instanceof HTMLButtonElement && el.textContent);
    expect(marker).toBeInstanceOf(HTMLButtonElement);
    await userEvent.click(marker as HTMLButtonElement);
    expect(onSelectFire).toHaveBeenCalledWith('EONET_1');
  });

  it('marks the selected fire button as pressed', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[fire({ id: 'EONET_1' }), fire({ id: 'EONET_2' })]}
        selectedFireId="EONET_2"
        onSelectFire={() => {}}
        isLoading={false}
      />,
    );

    const markers = markerInstances
      .map((m) => m.element)
      .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement);

    expect(
      markers
        .find((el) => el.getAttribute('aria-pressed') === 'true')
        ?.getAttribute('aria-label'),
    ).toContain('Wildfire Harris');
  });

  it('renders a closed fire with the muted closed marker class', async () => {
    const { MapSurface } = await import('./MapSurface');
    render(
      <MapSurface
        fires={[
          fire({ id: 'EONET_1' }),
          fire({ id: 'EONET_2', closed: '2026-08-10T00:00:00Z' }),
        ]}
        selectedFireId={null}
        onSelectFire={() => {}}
        isLoading={false}
      />,
    );

    const markers = markerInstances
      .map((m) => m.element)
      .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement);

    expect(markers).toHaveLength(2);
    expect(markers[0].classList.contains('fire-marker--closed')).toBe(false);
    expect(markers[1].classList.contains('fire-marker--closed')).toBe(true);
  });
});
