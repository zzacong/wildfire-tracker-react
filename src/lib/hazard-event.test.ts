import { describe, expect, it } from "vitest";

import {
  HECTARES_TO_ACRES,
  MAX_HAZARD_EVENTS,
  capHazardEvents,
  deriveStatus,
  normalizeArea,
  normalizeEvent,
  normalizeHazardEvents,
  normalizeKind,
  toGeometry,
  type HazardEvent,
  type RawEonetEvent,
} from "./hazard-event";

function rawEvent(overrides: Partial<RawEonetEvent> = {}): RawEonetEvent {
  return {
    id: "EONET_1",
    title: "Test Fire",
    description: "A test fire.",
    link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_1",
    closed: null,
    categories: [{ id: "wildfires", title: "Wildfires" }],
    sources: [{ id: "IRWIN", url: "https://example.com/irwin" }],
    geometry: [
      {
        date: "2026-08-01T12:00:00Z",
        type: "Point",
        coordinates: [-120.5, 40.2],
        magnitudeValue: 250,
        magnitudeUnit: "acres",
      },
    ],
    ...overrides,
  };
}

describe("normalizeKind", () => {
  it("maps EONET category ids to domain Kinds", () => {
    expect(normalizeKind("wildfires")).toBe("wildfire");
    expect(normalizeKind("floods")).toBe("flood");
    expect(normalizeKind("earthquakes")).toBe("earthquake");
    expect(normalizeKind("volcanoes")).toBe("volcano");
    expect(normalizeKind("severeStorms")).toBe("severeStorm");
    expect(normalizeKind("seaLakeIce")).toBe("seaLakeIce");
    expect(normalizeKind("droughts")).toBe("drought");
    expect(normalizeKind("landslides")).toBe("landslide");
    expect(normalizeKind("snow")).toBe("snow");
  });

  it("falls back to other for unknown or missing categories", () => {
    expect(normalizeKind("manmade")).toBe("other");
    expect(normalizeKind(undefined)).toBe("other");
  });
});

describe("deriveStatus", () => {
  it("treats a missing close date as open", () => {
    expect(deriveStatus(null)).toBe("open");
    expect(deriveStatus(undefined)).toBe("open");
  });

  it("treats a close date as closed", () => {
    expect(deriveStatus("2026-08-05T18:00:00Z")).toBe("closed");
  });

  it("treats an empty-string close date as open", () => {
    expect(deriveStatus("")).toBe("open");
  });
});

describe("normalizeArea", () => {
  it("keeps acres as-is and records the source unit", () => {
    expect(normalizeArea(400, "acres")).toEqual({
      value: 400,
      sourceUnit: "acres",
    });
  });

  it("converts hectares to acres and records the source unit", () => {
    const area = normalizeArea(100, "hectares");
    expect(area?.value).toBeCloseTo(100 * HECTARES_TO_ACRES);
    expect(area?.sourceUnit).toBe("hectares");
  });

  it("returns null for non-area units", () => {
    expect(normalizeArea(35, "kts")).toBeNull();
  });

  it("returns null when magnitude is missing or not a positive number", () => {
    expect(normalizeArea(undefined, "acres")).toBeNull();
    expect(normalizeArea(null, "acres")).toBeNull();
    expect(normalizeArea(0, "acres")).toBeNull();
    expect(normalizeArea(-5, "acres")).toBeNull();
  });

  it("returns null for non-finite magnitudes", () => {
    expect(normalizeArea(Number.POSITIVE_INFINITY, "acres")).toBeNull();
    expect(normalizeArea(Number.NaN, "acres")).toBeNull();
  });

  it("returns null for unknown, empty, or missing units", () => {
    expect(normalizeArea(35, "km2")).toBeNull();
    expect(normalizeArea(35, "")).toBeNull();
    expect(normalizeArea(35, undefined)).toBeNull();
    expect(normalizeArea(35, null)).toBeNull();
  });

  it("converts 100 hectares to the documented 247.105 acres", () => {
    expect(normalizeArea(100, "hectares")?.value).toBeCloseTo(247.105);
  });
});

describe("toGeometry", () => {
  it("returns the latest point geometry as lon/lat", () => {
    const geometry = toGeometry([
      {
        date: "2026-08-01T06:00:00Z",
        type: "Point",
        coordinates: [-120.5, 40.1],
      },
      {
        date: "2026-08-01T12:00:00Z",
        type: "Point",
        coordinates: [-120.6, 40.2],
      },
    ]);
    expect(geometry).toEqual({ lon: -120.6, lat: 40.2 });
  });

  it("returns null when there is no point geometry", () => {
    expect(
      toGeometry([{ date: "2026-08-01T12:00:00Z", type: "Polygon", coordinates: [] }]),
    ).toBeNull();
    expect(toGeometry([])).toBeNull();
  });
});

describe("normalizeEvent", () => {
  it("normalizes a full wildfire event into the domain shape", () => {
    const event = normalizeEvent(rawEvent());
    expect(event).toEqual({
      id: "EONET_1",
      title: "Test Fire",
      kind: "wildfire",
      status: "open",
      geometry: { lon: -120.5, lat: 40.2 },
      area: { value: 250, sourceUnit: "acres" },
      dates: { start: "2026-08-01T12:00:00Z", closed: null },
      description: "A test fire.",
      sources: [{ id: "IRWIN", url: "https://example.com/irwin" }],
      link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_1",
    });
  });

  it("derives a closed status from the close date", () => {
    const event = normalizeEvent(rawEvent({ closed: "2026-08-05T18:00:00Z" }));
    expect(event?.status).toBe("closed");
    expect(event?.dates.closed).toBe("2026-08-05T18:00:00Z");
  });

  it("treats an empty-string close date as open with no close date", () => {
    const event = normalizeEvent(rawEvent({ closed: "" }));
    expect(event?.status).toBe("open");
    expect(event?.dates.closed).toBeNull();
  });

  it("maps the first category to a Kind", () => {
    const event = normalizeEvent(
      rawEvent({
        categories: [
          { id: "severeStorms", title: "Severe Storms" },
          { id: "wildfires", title: "Wildfires" },
        ],
      }),
    );
    expect(event?.kind).toBe("severeStorm");
  });

  it("uses the earliest point date as the event start", () => {
    const event = normalizeEvent(
      rawEvent({
        geometry: [
          {
            date: "2026-08-01T06:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.1],
          },
          {
            date: "2026-08-02T12:00:00Z",
            type: "Point",
            coordinates: [-120.6, 40.2],
          },
        ],
      }),
    );
    expect(event?.dates.start).toBe("2026-08-01T06:00:00Z");
  });

  it("takes area from the latest geometry carrying a magnitude", () => {
    const event = normalizeEvent(
      rawEvent({
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.2],
            magnitudeValue: 100,
            magnitudeUnit: "acres",
          },
          {
            date: "2026-08-02T12:00:00Z",
            type: "Point",
            coordinates: [-120.6, 40.3],
            magnitudeValue: 500,
            magnitudeUnit: "acres",
          },
        ],
      }),
    );
    expect(event?.area).toEqual({ value: 500, sourceUnit: "acres" });
  });

  it("normalizes hectares reported by GDACS into acres", () => {
    const event = normalizeEvent(
      rawEvent({
        sources: [{ id: "GDACS", url: "https://gdacs.org" }],
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.2],
            magnitudeValue: 50,
            magnitudeUnit: "hectares",
          },
        ],
      }),
    );
    expect(event?.area?.value).toBeCloseTo(50 * HECTARES_TO_ACRES);
    expect(event?.area?.sourceUnit).toBe("hectares");
  });

  it("drops events without a usable point geometry", () => {
    expect(
      normalizeEvent(
        rawEvent({
          geometry: [
            {
              date: "2026-08-01T12:00:00Z",
              type: "Polygon",
              coordinates: [
                [
                  [-120.5, 40.2],
                  [-120.4, 40.2],
                ],
              ],
            },
          ],
        }),
      ),
    ).toBeNull();
    expect(normalizeEvent(rawEvent({ geometry: [] }))).toBeNull();
  });

  it("keeps a 3-element point coordinate as lon/lat", () => {
    const event = normalizeEvent(
      rawEvent({
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.2, 1200],
          },
        ],
      }),
    );
    expect(event?.geometry).toEqual({ lon: -120.5, lat: 40.2 });
  });

  it("drops events whose point coordinates are not numeric", () => {
    expect(
      normalizeEvent(
        rawEvent({
          geometry: [
            {
              date: "2026-08-01T12:00:00Z",
              type: "Point",
              coordinates: ["-120.5", "40.2"],
            },
          ],
        }),
      ),
    ).toBeNull();
    expect(
      normalizeEvent(
        rawEvent({
          geometry: [
            {
              date: "2026-08-01T12:00:00Z",
              type: "Point",
              coordinates: [-120.5],
            },
          ],
        }),
      ),
    ).toBeNull();
  });

  it("leaves area null when no geometry carries a magnitude", () => {
    const event = normalizeEvent(
      rawEvent({
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.2],
          },
        ],
      }),
    );
    expect(event?.area).toBeNull();
  });

  it("ignores magnitudes reported in non-area units", () => {
    const event = normalizeEvent(
      rawEvent({
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Point",
            coordinates: [-120.5, 40.2],
            magnitudeValue: 35,
            magnitudeUnit: "kts",
          },
        ],
      }),
    );
    expect(event?.area).toBeNull();
  });

  it("falls back to null description and empty sources", () => {
    const event = normalizeEvent(rawEvent({ description: null, sources: [] }));
    expect(event?.description).toBeNull();
    expect(event?.sources).toEqual([]);
  });
});

describe("normalizeHazardEvents", () => {
  it("normalizes usable events and drops the rest", () => {
    const rawEvents: RawEonetEvent[] = [
      rawEvent({ id: "EONET_1" }),
      rawEvent({
        id: "EONET_2",
        geometry: [
          {
            date: "2026-08-01T12:00:00Z",
            type: "Polygon",
            coordinates: [],
          },
        ],
      }),
      rawEvent({ id: "EONET_3", geometry: [] }),
    ];

    const events = normalizeHazardEvents(rawEvents);
    expect(events.map((event) => event.id)).toEqual(["EONET_1"]);
  });

  it("returns an empty list for an empty payload", () => {
    expect(normalizeHazardEvents([])).toEqual([]);
  });
});

describe("capHazardEvents", () => {
  it("leaves events below the cap untouched", () => {
    const events = [hazardEvent("a"), hazardEvent("b")];
    expect(capHazardEvents(events, 5)).toBe(events);
  });

  it("leaves exactly-cap-sized lists untouched", () => {
    const events = [hazardEvent("a"), hazardEvent("b")];
    expect(capHazardEvents(events, 2)).toBe(events);
  });

  it("does not mutate the input when capping", () => {
    const events = [
      hazardEvent("a", "2026-01-01T00:00:00Z"),
      hazardEvent("b", "2026-06-01T00:00:00Z"),
      hazardEvent("c", "2026-08-01T00:00:00Z"),
    ];
    const before = [...events];

    capHazardEvents(events, 2);

    expect(events).toEqual(before);
  });

  it("drops the oldest events beyond the cap, keeping the newest", () => {
    const events = [
      hazardEvent("oldest", "2026-01-01T00:00:00Z"),
      hazardEvent("middle", "2026-06-01T00:00:00Z"),
      hazardEvent("newest", "2026-08-01T00:00:00Z"),
    ];

    const capped = capHazardEvents(events, 2);
    expect(capped.map((event) => event.id)).toEqual(["newest", "middle"]);
  });

  it("defaults to the 1000-event cap", () => {
    const events = Array.from({ length: 1500 }, (_, index) =>
      hazardEvent(`event-${index}`, new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString()),
    );

    const capped = capHazardEvents(events);
    expect(capped).toHaveLength(MAX_HAZARD_EVENTS);
    expect(capped[0].id).toBe("event-1499");
    expect(capped[capped.length - 1].id).toBe("event-500");
  });
});

function hazardEvent(id: string, start = "2026-08-01T00:00:00Z"): HazardEvent {
  return {
    id,
    title: id,
    kind: "wildfire",
    status: "open",
    geometry: { lon: -120.5, lat: 40.2 },
    area: null,
    dates: { start, closed: null },
    description: null,
    sources: [],
    link: `https://eonet.gsfc.nasa.gov/api/v3/events/${id}`,
  };
}
