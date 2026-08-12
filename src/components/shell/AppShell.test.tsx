import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the dark-primary situation-room regions', () => {
    render(<AppShell />);

    expect(
      screen.getByRole('heading', { name: /wildfire/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Wildfire ledger')).toBeInTheDocument();
    expect(screen.getByLabelText('Ledger entries')).toBeInTheDocument();
    expect(screen.getByLabelText('Burn ticker')).toBeInTheDocument();
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
  });
});
