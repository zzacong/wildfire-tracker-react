import type { HazardEvent } from "@/lib/hazard-event";

export type SortKey = "date" | "area";
export type SortDirection = "asc" | "desc";

export interface EventSort {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: EventSort = { key: "date", direction: "desc" };

function compareByDate(a: HazardEvent, b: HazardEvent, direction: SortDirection): number {
  const aDate = a.dates.start;
  const bDate = b.dates.start;
  const aBlank = aDate === "";
  const bBlank = bDate === "";
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1;
  if (bBlank) return -1;
  const cmp = aDate.localeCompare(bDate);
  return direction === "asc" || cmp === 0 ? cmp : -cmp;
}

function compareByArea(a: HazardEvent, b: HazardEvent, direction: SortDirection): number {
  const av = a.area?.value ?? null;
  const bv = b.area?.value ?? null;
  if (av === bv) return compareByDate(a, b, "desc");
  if (av === null) return 1;
  if (bv === null) return -1;
  const cmp = av - bv;
  return direction === "asc" ? cmp : -cmp;
}

export function compareEvents(a: HazardEvent, b: HazardEvent, sort: EventSort): number {
  return sort.key === "date"
    ? compareByDate(a, b, sort.direction)
    : compareByArea(a, b, sort.direction);
}

export function sortEvents(events: HazardEvent[], sort: EventSort): HazardEvent[] {
  return [...events].sort((a, b) => compareEvents(a, b, sort));
}
