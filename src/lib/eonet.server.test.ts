import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RawEonetEvent, RawEonetResponse } from "./hazard-event";
import { MAX_HAZARD_EVENTS } from "./hazard-event";

const BASE_TIME = new Date("2026-08-14T00:00:00.000Z");
const TTL_MS = 15 * 60 * 1000;

type FetchMock = ReturnType<typeof vi.fn>;

function rawEvent(id: number, start: string): RawEonetEvent {
  return {
    id: `EONET_${id}`,
    title: `Fire ${id}`,
    description: null,
    link: `https://eonet.gsfc.nasa.gov/api/v3/events/EONET_${id}`,
    closed: null,
    categories: [{ id: "wildfires", title: "Wildfires" }],
    sources: [{ id: "IRWIN", url: "https://example.com/irwin" }],
    geometry: [
      {
        date: start,
        type: "Point",
        coordinates: [-120.5 + id, 40.2],
        magnitudeValue: 100 + id,
        magnitudeUnit: "acres",
      },
    ],
  };
}

function jsonResponse(events: RawEonetEvent[]): RawEonetResponse {
  return { events };
}

function okFetch(events: RawEonetEvent[]): FetchMock {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(jsonResponse(events)),
    }),
  );
}

function failingFetch(): FetchMock {
  return vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    }),
  );
}

let getHazardEventsResult: typeof import("./eonet.server").getHazardEventsResult;

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"], now: BASE_TIME });
  vi.resetModules();
  ({ getHazardEventsResult } = await import("./eonet.server"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("getHazardEventsResult", () => {
  it("fetches and normalizes events on the first call", async () => {
    const fetch = okFetch([rawEvent(1, "2026-08-13T12:00:00Z")]);
    vi.stubGlobal("fetch", fetch);

    const result = await getHazardEventsResult();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("fresh");
    expect(result.isStale).toBe(false);
    expect(result.fetchedAt).toBe(BASE_TIME.getTime());
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      id: "EONET_1",
      kind: "wildfire",
      status: "open",
      geometry: { lon: -119.5, lat: 40.2 },
      area: { value: 101, sourceUnit: "acres" },
    });
  });

  it("serves from cache within the TTL without refetching", async () => {
    const fetch = okFetch([rawEvent(1, "2026-08-13T12:00:00Z")]);
    vi.stubGlobal("fetch", fetch);

    const first = await getHazardEventsResult();
    const second = await getHazardEventsResult();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second.status).toBe("fresh");
    expect(second.isStale).toBe(false);
    expect(second.fetchedAt).toBe(first.fetchedAt);
  });

  it("caps the payload to 1000 events end to end", async () => {
    const events = Array.from({ length: 1500 }, (_, index) =>
      rawEvent(index, new Date(BASE_TIME.getTime() - index * 60_000).toISOString()),
    );
    vi.stubGlobal("fetch", okFetch(events));

    const result = await getHazardEventsResult();

    expect(result.events).toHaveLength(MAX_HAZARD_EVENTS);
    expect(result.events[0].id).toBe("EONET_0");
  });

  it("returns an error result when the first fetch fails", async () => {
    vi.stubGlobal("fetch", failingFetch());

    const result = await getHazardEventsResult();

    expect(result.status).toBe("error");
    expect(result.isStale).toBe(true);
    expect(result.events).toEqual([]);
  });

  it("serves last-known data as stale when a refetch fails after the TTL", async () => {
    vi.stubGlobal("fetch", okFetch([rawEvent(1, "2026-08-13T12:00:00Z")]));
    await getHazardEventsResult();

    vi.setSystemTime(new Date(BASE_TIME.getTime() + TTL_MS + 60_000));
    vi.stubGlobal("fetch", failingFetch());

    const stale = await getHazardEventsResult();

    expect(stale.status).toBe("stale");
    expect(stale.isStale).toBe(true);
    expect(stale.events).toHaveLength(1);
    expect(stale.events[0].id).toBe("EONET_1");
  });

  it("revalidates in the background and serves fresh data on the next call", async () => {
    vi.stubGlobal("fetch", okFetch([rawEvent(1, "2026-08-13T12:00:00Z")]));
    await getHazardEventsResult();

    vi.setSystemTime(new Date(BASE_TIME.getTime() + TTL_MS + 60_000));
    vi.stubGlobal("fetch", okFetch([rawEvent(2, "2026-08-14T00:30:00Z")]));

    const stale = await getHazardEventsResult();
    expect(stale.status).toBe("stale");
    expect(stale.events[0].id).toBe("EONET_1");

    await new Promise((resolve) => setTimeout(resolve, 0));

    const fresh = await getHazardEventsResult();
    expect(fresh.status).toBe("fresh");
    expect(fresh.isStale).toBe(false);
    expect(fresh.events[0].id).toBe("EONET_2");
  });
});
