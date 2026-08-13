import { useEffect, useRef, useState } from 'react';

import type { Fire } from '#/lib/eonet';

export interface BurnTickerProps {
  fires: Fire[];
  dataUpdatedAt?: number | null;
}

export function BurnTicker({ fires, dataUpdatedAt = null }: BurnTickerProps) {
  const count = fires.length;
  const lastSeenRef = useRef({ dataUpdatedAt, count });
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const last = lastSeenRef.current;
    if (dataUpdatedAt === null) {
      return;
    }
    if (last.dataUpdatedAt === null) {
      lastSeenRef.current = { dataUpdatedAt, count };
      return;
    }
    if (dataUpdatedAt === last.dataUpdatedAt) {
      return;
    }
    lastSeenRef.current = { dataUpdatedAt, count };
    if (count !== last.count) {
      setAnnouncement(`Active fires: ${count}`);
    }
  }, [count, dataUpdatedAt]);

  return (
    <footer
      aria-label="Burn ticker"
      className="border-hairline bg-panel flex h-16 shrink-0 items-stretch border-t"
    >
      <div className="flex flex-col justify-center px-[18px]">
        <span className="text-faint font-mono text-[10px] tracking-[0.2em] uppercase">
          Active fires
        </span>
        <span className="text-bone font-mono text-[20px] leading-none font-medium">
          {count}
        </span>
      </div>
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </output>
    </footer>
  );
}
