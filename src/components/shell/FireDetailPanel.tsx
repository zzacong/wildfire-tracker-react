import { useEffect, useRef, useState } from 'react';

import { formatFireSize } from '#/components/map/fireMarker';
import type { Fire } from '#/lib/eonet';
import { formatDataAge } from '#/lib/freshness';
import { useFocusTrap } from '#/lib/use-focus-trap';
import { useNow } from '#/lib/use-now';
import { cn } from '#/lib/utils';

export const NARROW_QUERY = '(max-width: 820px)';

export const ABSENT_FIELDS_NOTE =
  'Containment %, cause, and agency live on the source incident page — not in the EONET feed. Imagery is linked from there too.';

export function useIsNarrow(query: string = NARROW_QUERY): boolean {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export interface FireDetailPanelProps {
  fire: Fire;
  onClose: () => void;
}

function FieldRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-faint font-mono text-[10px] tracking-[0.12em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          'text-bone text-right font-mono text-[11px] break-words',
          accent && 'text-accent',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function FireDetailPanel({ fire, onClose }: FireDetailPanelProps) {
  const isNarrow = useIsNarrow();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const now = useNow();

  const titleId = `${fire.id}-detail-title`;

  useEffect(() => {
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current?.focus();
    return () => {
      openerRef.current?.focus();
    };
  }, []);

  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const status = fire.closed === null ? 'Open' : 'Closed';
  const magnitudeValue = fire.geometry.magnitudeValue;
  const size = formatFireSize(magnitudeValue);
  const updatedAgo = formatDataAge(Date.parse(fire.geometry.date), now);
  const [lng, lat] = fire.geometry.coordinates;

  return (
    <>
      {!isNarrow && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          data-part="shade"
          onClick={onClose}
          className="absolute inset-0 z-20 cursor-default bg-[rgba(17,22,15,0.28)]"
        />
      )}
      <dialog
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        open
        data-variant={isNarrow ? 'sheet' : 'popover'}
        className={cn(
          'bg-panel text-bone m-0 flex max-h-[calc(100%-36px)] flex-col overflow-hidden p-0 outline-none',
          isNarrow
            ? 'fixed inset-x-0 bottom-0 z-30 max-h-[62vh] rounded-t-[18px] border-t border-hairline-strong'
            : 'absolute top-[18px] right-[18px] z-30 w-[340px] rounded-card border border-hairline-strong shadow-[0_12px_36px_rgba(0,0,0,0.4)]',
        )}
      >
        <header
          className={cn(
            isNarrow
              ? 'relative px-12 py-3 text-center'
              : 'flex items-center gap-2.5 border-b border-hairline px-4 py-3',
          )}
        >
          {!isNarrow && (
            <span
              aria-hidden="true"
              data-part="grip"
              className="bg-faint h-[3px] w-[10px] shrink-0 rounded-full"
            />
          )}
          <h2
            id={titleId}
            className={cn(
              'min-w-0 truncate text-sm font-bold tracking-[-0.01em]',
              isNarrow ? 'mx-auto max-w-full' : 'flex-1',
            )}
          >
            {fire.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className={cn(
              'text-muted hover:text-bone grid size-7 shrink-0 cursor-pointer place-items-center rounded-[6px] font-mono text-base leading-none',
              isNarrow &&
                'absolute top-1/2 right-3 -translate-y-1/2 bg-transparent',
            )}
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-muted mt-3 text-[13px] leading-relaxed">
            {fire.description}
          </p>
          <div className="mt-4">
            <p className="text-faint font-mono text-[10px] tracking-[0.18em] uppercase">
              Size
            </p>
            {magnitudeValue === null ? (
              <p className="text-muted mt-1 font-mono text-sm">{size}</p>
            ) : (
              <p className="text-accent mt-1 font-mono text-[30px] leading-none font-semibold tracking-[-0.02em]">
                {size}
              </p>
            )}
          </div>
          <dl className="divide-hairline border-hairline mt-4 divide-y border-y">
            <FieldRow
              label="Status"
              value={status}
              accent={status === 'Open'}
            />
            <FieldRow label="Last updated" value={updatedAgo} />
            <FieldRow
              label="Timestamp"
              value={new Date(fire.geometry.date).toUTCString()}
            />
            <FieldRow
              label="Coordinates"
              value={`${lng.toFixed(3)}, ${lat.toFixed(3)}`}
            />
            <FieldRow label="EONET ID" value={fire.id} />
          </dl>
          {fire.sources.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {fire.sources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-accent-ink inline-flex items-center rounded-[8px] px-3 py-2 font-mono text-[11px] font-bold"
                >
                  {source.id} incident
                </a>
              ))}
            </div>
          )}
          <p className="text-muted border-hairline-strong bg-forest mt-4 rounded-[8px] border border-dashed px-3 py-2.5 text-[11px] leading-relaxed">
            {ABSENT_FIELDS_NOTE}
          </p>
        </div>
      </dialog>
    </>
  );
}
