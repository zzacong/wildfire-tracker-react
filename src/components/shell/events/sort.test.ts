import { describe, expect, it } from "vitest";

import { DEFAULT_SORT, compareEvents, sortEvents, type EventSort } from "./sort";
import type { HazardEvent } from "@/lib/hazard-event";

function event(id: string, start: string, area: number | null = null): HazardEvent {
  return {
    id,
    title: `Event ${id}`,
    kind: "wildfire",
    status: "open",
    geometry: { lon: -120, lat: 40 },
    area: area === null ? null : { value: area, sourceUnit: "acres" },
    dates: { start, closed: null },
    description: null,
    sources: [],
    link: "https://eonet.gsfc.nasa.gov/api/v3/events/test",
  };
}

const EVENTS: HazardEvent[] = [
  event("newest", "2026-08-10T00:00:00Z", 100),
  event("oldest", "2026-06-01T00:00:00Z", 500),
  event("middle", "2026-07-15T00:00:00Z", null),
];

describe("DEFAULT_SORT", () => {
  it("defaults to newest first", () => {
    expect(DEFAULT_SORT).toEqual({ key: "date", direction: "desc" });
  });
});

describe("sortEvents", () => {
  it("does not mutate the input", () => {
    const input = [...EVENTS];
    sortEvents(EVENTS, DEFAULT_SORT);
    expect(EVENTS).toEqual(input);
  });

  it("sorts by date newest first by default", () => {
    const sorted = sortEvents(EVENTS, DEFAULT_SORT).map((e) => e.id);
    expect(sorted).toEqual(["newest", "middle", "oldest"]);
  });

  it("sorts by date oldest first", () => {
    const sort: EventSort = { key: "date", direction: "asc" };
    const sorted = sortEvents(EVENTS, sort).map((e) => e.id);
    expect(sorted).toEqual(["oldest", "middle", "newest"]);
  });

  it("sorts by area largest first, unknown areas last", () => {
    const sort: EventSort = { key: "area", direction: "desc" };
    const sorted = sortEvents(EVENTS, sort).map((e) => e.id);
    expect(sorted).toEqual(["oldest", "newest", "middle"]);
  });

  it("sorts by area smallest first, unknown areas last", () => {
    const sort: EventSort = { key: "area", direction: "asc" };
    const sorted = sortEvents(EVENTS, sort).map((e) => e.id);
    expect(sorted).toEqual(["newest", "oldest", "middle"]);
  });

  it("tie-breaks equal areas by newest first", () => {
    const tied = [event("a", "2026-07-01T00:00:00Z", 50), event("b", "2026-08-01T00:00:00Z", 50)];
    const sort: EventSort = { key: "area", direction: "asc" };
    expect(sortEvents(tied, sort).map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("places events without a start date last when sorting by date", () => {
    const missing = [event("blank", "", 10), event("dated", "2026-08-01T00:00:00Z", 10)];
    expect(sortEvents(missing, DEFAULT_SORT).map((e) => e.id)).toEqual(["dated", "blank"]);
    const asc: EventSort = { key: "date", direction: "asc" };
    expect(sortEvents(missing, asc).map((e) => e.id)).toEqual(["dated", "blank"]);
  });
});

describe("compareEvents", () => {
  it("is reflexive for identical events", () => {
    expect(compareEvents(EVENTS[0], EVENTS[0], DEFAULT_SORT)).toBe(0);
  });
});
