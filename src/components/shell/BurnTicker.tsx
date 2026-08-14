import { useEffect, useRef, useState } from 'react';

import type { Fire } from '#/lib/eonet';

export interface BurnTickerProps {
  fires: Fire[];
  dataUpdatedAt?: number | null;
}

function splitActiveClosed(fires: Fire[]): { active: number; closed: number } {
  const closed = fires.filter((fire) => fire.closed !== null).length;
  return { active: fires.length - closed, closed };
}

export function BurnTicker({ fires, dataUpdatedAt = null }: BurnTickerProps) {
  const { active, closed } = splitActiveClosed(fires);
  const showSplit = closed > 0;
  const signature = `${active}|${closed}`;
  const lastSeenRef = useRef({ dataUpdatedAt, signature });
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const last = lastSeenRef.current;
    if (dataUpdatedAt === null) {
      return;
    }
    if (last.dataUpdatedAt === null) {
      lastSeenRef.current = { dataUpdatedAt, signature };
      return;
    }
    if (dataUpdatedAt === last.dataUpdatedAt) {
      return;
    }
    lastSeenRef.current = { dataUpdatedAt, signature };
    if (signature !== last.signature) {
      setAnnouncement(
        showSplit
          ? `Active fires: ${active}, Closed fires: ${closed}`
          : `Active fires: ${active}`,
      );
    }
  }, [active, closed, dataUpdatedAt, showSplit, signature]);

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
          {active}
        </span>
      </div>
      {showSplit && (
        <div className="border-hairline flex flex-col justify-center border-l px-[18px]">
          <span className="text-faint font-mono text-[10px] tracking-[0.2em] uppercase">
            Closed fires
          </span>
          <span className="text-muted font-mono text-[20px] leading-none font-medium">
            {closed}
          </span>
        </div>
      )}
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </output>
    </footer>
  );
}
