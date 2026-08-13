import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '#/components/shell/AppShell';

vi.mock('#/components/map/MapSurface', () => ({
  MapSurface: () => <main aria-label="Map" />,
}));

describe('AppShell', () => {
  it('renders the dark-primary situation-room regions', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: /wildfire/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Wildfire ledger')).toBeInTheDocument();
    expect(screen.getByLabelText('Ledger entries')).toBeInTheDocument();
    expect(screen.getByLabelText('Burn ticker')).toBeInTheDocument();
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
  });
});
