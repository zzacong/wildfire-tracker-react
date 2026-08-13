import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Fire } from '#/lib/eonet';

import { BurnTicker } from './BurnTicker';

const T0 = 1_000_000;
const T1 = 2_000_000;

describe('BurnTicker', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the count aggregate for the visible set in a labeled footer', () => {
    render(<BurnTicker fires={[fire(), fire()]} />);

    expect(screen.getByLabelText('Burn ticker')).toBeInTheDocument();
    expect(screen.getByText('Active fires')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('updates the count when the fires prop changes', () => {
    const rendered = render(<BurnTicker fires={[fire()]} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    rendered.rerender(<BurnTicker fires={[fire(), fire(), fire()]} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('exposes a polite live region', () => {
    render(<BurnTicker fires={[]} />);

    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('announces only on a poll-driven aggregate change, not a filter-driven one', () => {
    const rendered = render(
      <BurnTicker fires={[fire(), fire()]} dataUpdatedAt={T0} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('');

    rendered.rerender(<BurnTicker fires={[fire()]} dataUpdatedAt={T0} />);

    expect(screen.getByRole('status')).toHaveTextContent('');

    rendered.rerender(
      <BurnTicker fires={[fire(), fire(), fire()]} dataUpdatedAt={T1} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Active fires: 3');
  });

  it('does not announce the first data arrival', () => {
    const rendered = render(<BurnTicker fires={[]} />);

    rendered.rerender(
      <BurnTicker fires={[fire(), fire()]} dataUpdatedAt={T0} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('');

    rendered.rerender(
      <BurnTicker fires={[fire(), fire(), fire()]} dataUpdatedAt={T1} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Active fires: 3');
  });

  it('does not announce a poll that leaves the aggregate unchanged', () => {
    const rendered = render(
      <BurnTicker fires={[fire(), fire()]} dataUpdatedAt={T0} />,
    );

    rendered.rerender(
      <BurnTicker fires={[fire(), fire()]} dataUpdatedAt={T1} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('cuts pulse/glow animation to 0ms under prefers-reduced-motion via the global rule', () => {
    const css = readFileSync(
      join(import.meta.dirname, '..', '..', 'styles.css'),
      'utf8',
    );

    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).toMatch(/animation-duration:\s*var\(--motion-reduce\)/);
    expect(css).toMatch(/transition-duration:\s*var\(--motion-reduce\)/);
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
