import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Fire } from '#/lib/eonet';

import { buildFireMarkerButton, formatFireSize } from './fireMarker';

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

describe('formatFireSize', () => {
  it('formats a known magnitude in acres', () => {
    expect(formatFireSize(924.3)).toBe('924 acres');
  });

  it('reports a null magnitude as not reported', () => {
    expect(formatFireSize(null)).toBe('Not reported');
  });
});

describe('buildFireMarkerButton', () => {
  it('is a focusable button with a fire-name, size label', () => {
    const button = buildFireMarkerButton(fire(), {
      selected: false,
      onSelect: vi.fn(),
    });

    expect(button.tagName).toBe('BUTTON');
    expect(button.tabIndex).toBe(0);
    expect(button.getAttribute('aria-label')).toBe(
      'Wildfire Harris, Rosebud, Montana, 924 acres',
    );
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('reflects selection through aria-pressed and a selected class', () => {
    const selected = buildFireMarkerButton(fire(), {
      selected: true,
      onSelect: vi.fn(),
    });

    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(selected.classList.contains('fire-marker--selected')).toBe(true);

    const unselected = buildFireMarkerButton(fire(), {
      selected: false,
      onSelect: vi.fn(),
    });
    expect(unselected.getAttribute('aria-pressed')).toBe('false');
    expect(unselected.classList.contains('fire-marker--selected')).toBe(false);
  });

  it('marks a closed fire with the muted closed class', () => {
    const closed = buildFireMarkerButton(
      fire({ closed: '2026-08-10T00:00:00Z' }),
      {
        selected: false,
        onSelect: vi.fn(),
      },
    );

    expect(closed.classList.contains('fire-marker--closed')).toBe(true);

    const open = buildFireMarkerButton(fire(), {
      selected: false,
      onSelect: vi.fn(),
    });
    expect(open.classList.contains('fire-marker--closed')).toBe(false);
  });

  it('renders a flame glyph with a dark halo disc, no number badges', () => {
    const button = buildFireMarkerButton(fire(), {
      selected: false,
      onSelect: vi.fn(),
    });

    expect(button.querySelector('[data-part="halo"]')).not.toBeNull();
    expect(button.querySelector('[data-part="glyph"] svg')).not.toBeNull();
    expect(button.querySelector('[data-part="badge"]')).toBeNull();
  });

  it('selects on click (Enter/Space activate a native button)', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const button = buildFireMarkerButton(fire({ id: 'EONET_1' }), {
      selected: false,
      onSelect,
    });
    document.body.appendChild(button);

    button.click();
    expect(onSelect).toHaveBeenCalledWith('EONET_1');

    button.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(3);
  });
});
