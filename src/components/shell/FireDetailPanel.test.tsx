import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Fire } from '#/lib/eonet';

import {
  ABSENT_FIELDS_NOTE,
  FireDetailPanel,
  NARROW_QUERY,
} from './FireDetailPanel';

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

function Harness({
  initialFire,
  swapFire,
}: {
  initialFire: Fire;
  swapFire?: Fire;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(initialFire);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open detail
      </button>
      {swapFire && (
        <button type="button" onClick={() => setCurrent(swapFire)}>
          Show second fire
        </button>
      )}
      {open && (
        <FireDetailPanel fire={current} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function stubMatchMedia(matches: boolean) {
  const mql = {
    matches,
    media: NARROW_QUERY,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  );
  return mql;
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open detail' }));
  return screen.getByRole('dialog');
}

describe('FireDetailPanel', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('opens as a modal dialog labelled by the fire name', async () => {
    const user = userEvent.setup();
    render(<Harness initialFire={fire()} />);

    const dialog = await openDialog(user);

    expect(dialog).toHaveAccessibleName('Wildfire Harris, Rosebud, Montana');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
  });

  it('renders only the grounded fields from the EONET contract', async () => {
    const user = userEvent.setup();
    const updatedDate = new Date(Date.now() - 3 * 3600_000).toISOString();
    render(
      <Harness
        initialFire={fire({
          geometry: { ...fire().geometry, date: updatedDate },
        })}
      />,
    );

    await openDialog(user);

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('924 acres')).toBeInTheDocument();
    expect(screen.getByText('3h ago')).toBeInTheDocument();
    expect(
      screen.getByText(new Date(updatedDate).toUTCString()),
    ).toBeInTheDocument();
    expect(screen.getByText('-106.634, 45.195')).toBeInTheDocument();
    expect(screen.getByText('EONET_1')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'IRWIN incident' }),
    ).toHaveAttribute('href', 'https://irwin.doi.gov/observer/incidents/1');
    expect(screen.getByText(ABSENT_FIELDS_NOTE)).toBeInTheDocument();
  });

  it('links every source out to its incident page', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialFire={fire({
          sources: [
            { id: 'IRWIN', url: 'https://irwin.example/1' },
            { id: 'GDACS', url: 'https://gdacs.example/1' },
          ],
        })}
      />,
    );

    await openDialog(user);

    expect(
      screen.getByRole('link', { name: 'IRWIN incident' }),
    ).toHaveAttribute('href', 'https://irwin.example/1');
    expect(
      screen.getByRole('link', { name: 'GDACS incident' }),
    ).toHaveAttribute('href', 'https://gdacs.example/1');
  });

  it('shows "Not reported" for the size hero when magnitude is null', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialFire={fire({
          geometry: { ...fire().geometry, magnitudeValue: null },
        })}
      />,
    );

    await openDialog(user);

    expect(screen.getByText('Not reported')).toBeInTheDocument();
  });

  it('reports a closed fire as Closed', async () => {
    const user = userEvent.setup();
    render(<Harness initialFire={fire({ closed: '2026-08-10T00:00:00Z' })} />);

    await openDialog(user);

    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('closes via the close button', async () => {
    const user = userEvent.setup();
    render(<Harness initialFire={fire()} />);
    await openDialog(user);

    await user.click(
      screen.getByRole('button', { name: 'Close detail panel' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the opener', async () => {
    const user = userEvent.setup();
    render(<Harness initialFire={fire()} />);
    const opener = screen.getByRole('button', { name: 'Open detail' });

    await openDialog(user);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes on shade click and returns focus to the opener', async () => {
    stubMatchMedia(false);
    const user = userEvent.setup();
    const { container } = render(<Harness initialFire={fire()} />);
    const opener = screen.getByRole('button', { name: 'Open detail' });
    await openDialog(user);

    const shade = container.querySelector('[data-part="shade"]');
    expect(shade).not.toBeNull();
    await user.click(shade as HTMLElement);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('traps Tab focus within the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness initialFire={fire()} />);
    await openDialog(user);

    const closeButton = screen.getByRole('button', {
      name: 'Close detail panel',
    });
    const sourceLink = screen.getByRole('link', { name: 'IRWIN incident' });

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });
    expect(sourceLink).toHaveFocus();

    sourceLink.focus();
    fireEvent.keyDown(sourceLink, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('swaps the content in place when the selected fire changes', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialFire={fire()}
        swapFire={fire({
          id: 'EONET_2',
          title: 'Lost Lake Fire',
          geometry: {
            ...fire().geometry,
            magnitudeValue: 22450,
          },
        })}
      />,
    );
    const dialog = await openDialog(user);
    expect(dialog).toHaveAccessibleName('Wildfire Harris, Rosebud, Montana');

    await user.click(screen.getByRole('button', { name: 'Show second fire' }));

    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(dialog).toHaveAccessibleName('Lost Lake Fire');
    expect(screen.getByText('22,450 acres')).toBeInTheDocument();
    expect(screen.getByText('EONET_2')).toBeInTheDocument();
  });

  it('collapses to a bottom sheet below 820px without the shade', async () => {
    stubMatchMedia(true);
    const user = userEvent.setup();
    const { container } = render(<Harness initialFire={fire()} />);

    const dialog = await openDialog(user);

    expect(dialog).toHaveAttribute('data-variant', 'sheet');
    expect(container.querySelector('[data-part="shade"]')).toBeNull();
  });

  it('stays a popover over the shaded map at 820px and above', async () => {
    stubMatchMedia(false);
    const user = userEvent.setup();
    const { container } = render(<Harness initialFire={fire()} />);

    const dialog = await openDialog(user);

    expect(dialog).toHaveAttribute('data-variant', 'popover');
    expect(container.querySelector('[data-part="shade"]')).not.toBeNull();
  });
});
