export interface FiresEmptyStateProps {
  onClearFilters?: () => void;
}

export function FiresEmptyState({ onClearFilters }: FiresEmptyStateProps) {
  const hasFires = onClearFilters !== undefined;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
      <div className="border-hairline bg-panel pointer-events-auto flex max-w-xs flex-col items-center gap-3 rounded-[14px] border px-8 py-8 text-center">
        <p className="text-bone font-display text-[16px] font-bold">
          {hasFires
            ? 'No fires match the current filters'
            : 'No fires in this view'}
        </p>
        <p className="text-muted text-sm">
          {hasFires
            ? 'Loosen the recency, magnitude, or search criteria.'
            : 'The feed returned no wildfires right now. Check back soon.'}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="border-hairline text-accent hover:text-bone mt-1 rounded-[8px] border px-5 py-2 font-mono text-xs font-medium tracking-[0.12em] uppercase"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
