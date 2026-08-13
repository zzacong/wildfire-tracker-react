import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useNow } from './use-now';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useNow', () => {
  it('tracks the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const { result } = renderHook(() => useNow());
    expect(result.current).toBe(Date.parse('2025-01-01T00:00:00Z'));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toBe(Date.parse('2025-01-01T00:01:00Z'));
  });

  it('stops ticking while the tab is hidden', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const { result } = renderHook(() => useNow());
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toBe(Date.parse('2025-01-01T00:00:00Z'));
  });

  it('resumes and catches up when the tab becomes visible', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const { result } = renderHook(() => useNow());
    const hidden = vi.spyOn(document, 'hidden', 'get');
    hidden.mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(60_000));
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current).toBe(Date.parse('2025-01-01T00:01:00Z'));
  });
});
