import type { FireFilters } from '#/lib/fire-filters';
import {
  activeFilterCount,
  FIRE_FILTERS_DEFAULT,
  MAGNITUDE_OPTIONS,
  RECENCY_OPTIONS,
} from '#/lib/fire-filters';

export interface FilterBarProps {
  filters: FireFilters;
  onChange: (filters: FireFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const activeCount = activeFilterCount(filters);
  const hasSearch = filters.search.trim() !== '';

  const update = (patch: Partial<FireFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="border-hairline bg-panel flex items-center gap-3 border-b px-6 py-3">
      <label
        htmlFor="filter-search"
        className="text-faint font-mono text-[11px] tracking-[0.12em] uppercase"
      >
        Search
      </label>
      <div className="relative min-w-0 flex-1">
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Name or description…"
          className="border-hairline bg-forest text-bone placeholder:text-faint w-full rounded-[8px] border px-3 py-1.5 font-mono text-xs"
        />
        {hasSearch && (
          <button
            type="button"
            onClick={() => update({ search: '' })}
            aria-label="Clear search"
            className="text-faint hover:text-bone absolute top-1/2 right-2 -translate-y-1/2 font-mono text-xs"
          >
            ×
          </button>
        )}
      </div>
      <label
        htmlFor="filter-recency"
        className="text-faint font-mono text-[11px] tracking-[0.12em] uppercase"
      >
        Recency
      </label>
      <select
        id="filter-recency"
        value={filters.recency}
        onChange={(event) =>
          update({ recency: event.target.value as FireFilters['recency'] })
        }
        className="border-hairline bg-forest text-bone rounded-[8px] border px-3 py-1.5 font-mono text-xs"
      >
        {RECENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor="filter-magnitude"
        className="text-faint font-mono text-[11px] tracking-[0.12em] uppercase"
      >
        Magnitude
      </label>
      <select
        id="filter-magnitude"
        value={filters.magnitude}
        onChange={(event) =>
          update({ magnitude: event.target.value as FireFilters['magnitude'] })
        }
        className="border-hairline bg-forest text-bone rounded-[8px] border px-3 py-1.5 font-mono text-xs"
      >
        {MAGNITUDE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        aria-label="Active filter count"
        className="text-muted font-mono text-[11px]"
      >
        {activeCount} active
      </span>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange(FIRE_FILTERS_DEFAULT)}
          aria-label="Clear all filters"
          className="text-accent hover:text-bone font-mono text-[11px] font-medium tracking-[0.12em] uppercase"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
