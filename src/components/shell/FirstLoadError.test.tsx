import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FirstLoadError } from './FirstLoadError';

describe('FirstLoadError', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a full-screen error with a retry action', () => {
    const onRetry = vi.fn();
    render(<FirstLoadError onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/load the wildfire feed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
