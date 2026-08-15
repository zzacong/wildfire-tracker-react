import type { Kind } from "./hazard-event";

/**
 * Status filter: "open" only (default) or include recently closed events,
 * i.e. fires contained within the last 30 days.
 */
export type StatusFilter = "open" | "recently-closed";

/** The kinds wired into the filter seam today. Only wildfire is populated. */
export const WIRED_KINDS: ReadonlyArray<Kind> = ["wildfire"];

export const DEFAULT_HAZARD_KIND: Kind = "wildfire";

/** The fully-resolved filters passed to the data layer. */
export interface HazardFilters {
  status: StatusFilter;
  kind: Kind;
  start?: string;
  end?: string;
}

/** Search-param shape: every field optional, URL stays minimal. */
export type HazardFiltersInput = Partial<HazardFilters>;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isoDateOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) {
    return undefined;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return value;
}

export function normalizeHazardFilters(input: HazardFiltersInput | undefined): HazardFilters {
  const status: StatusFilter = input?.status === "recently-closed" ? "recently-closed" : "open";
  const kind: Kind =
    input?.kind && WIRED_KINDS.includes(input.kind) ? input.kind : DEFAULT_HAZARD_KIND;

  return {
    status,
    kind,
    start: isoDateOrUndefined(input?.start),
    end: isoDateOrUndefined(input?.end),
  };
}

/** Validate and sanitize raw router search params into filter input. */
export function parseHazardFiltersSearch(search: Record<string, unknown>): HazardFiltersInput {
  return {
    status: search.status === "recently-closed" ? "recently-closed" : undefined,
    kind:
      typeof search.kind === "string" && WIRED_KINDS.includes(search.kind as Kind)
        ? (search.kind as Kind)
        : undefined,
    start: typeof search.start === "string" ? search.start : undefined,
    end: typeof search.end === "string" ? search.end : undefined,
  };
}
