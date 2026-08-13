import { useEffect, useState } from 'react';

export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    let id: ReturnType<typeof setInterval> | undefined;
    const tick = () => setNow(Date.now());
    const sync = () => {
      if (document.hidden) {
        clearInterval(id);
        id = undefined;
      } else {
        tick();
        id ??= setInterval(tick, intervalMs);
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [intervalMs]);

  return now;
}
