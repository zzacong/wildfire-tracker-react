import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EonetEnvelope, EonetEvent, Fire } from '#/lib/eonet';
import {
  EONET_CACHE_TTL_MS,
  eonetUrl,
  resetEonetCache,
} from '#/lib/eonet-server';
import { handleEonetGet } from '#/routes/api/eonet';

const OPEN_URL = 'http://localhost/api/eonet?status=open';
const ALL_URL = 'http://localhost/api/eonet?status=all';

function event(overrides: Partial<EonetEvent> = {}): EonetEvent {
  return {
    id: 'EONET_1',
    title: 'Wildfire Harris, Rosebud, Montana',
    description: '30 Miles SW from Ashland, MT',
    link: '/events/EONET_1',
    closed: null,
    categories: [{ id: 'wildfires', title: 'Wildfires' }],
    sources: [
      { id: 'IRWIN', url: 'https://irwin.doi.gov/observer/incidents/1' },
    ],
    geometry: [
      {
        magnitudeValue: 924.3,
        magnitudeUnit: 'acres',
        date: '2026-08-09T16:55:00Z',
        type: 'Point',
        coordinates: [-106.634317, 45.195183],
      },
    ],
    ...overrides,
  };
}

function envelope(events: EonetEvent[]): EonetEnvelope {
  return {
    title: 'Wildfires',
    description: 'Recent wildfire events',
    link: 'https://eonet.gsfc.nasa.gov/api/v3/events',
    events,
  };
}

function stubFetch(envelope: EonetEnvelope) {
  const fn = vi.fn().mockResolvedValue(Response.json(envelope));
  vi.stubGlobal('fetch', fn);
  return fn;
}

async function getBody(response: Response) {
  return (await response.json()) as {
    status: string;
    fires: Fire[];
    fetchedAt: string;
    stale: boolean;
  };
}

beforeEach(() => {
  resetEonetCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('GET /api/eonet — BFF route', () => {
  it('returns the normalized contract shape for status=open', async () => {
    const fetchMock = stubFetch(envelope([event()]));
    const response = await handleEonetGet(new Request(OPEN_URL));

    expect(response.status).toBe(200);
    const body = await getBody(response);
    expect(body.status).toBe('open');
    expect(body.stale).toBe(false);
    expect(typeof body.fetchedAt).toBe('string');
    expect(body.fires).toHaveLength(1);
    expect(body.fires[0]).toEqual({
      id: 'EONET_1',
      title: 'Wildfire Harris, Rosebud, Montana',
      description: '30 Miles SW from Ashland, MT',
      link: '/events/EONET_1',
      closed: null,
      sources: [
        { id: 'IRWIN', url: 'https://irwin.doi.gov/observer/incidents/1' },
      ],
      geometry: {
        type: 'Point',
        date: '2026-08-09T16:55:00Z',
        coordinates: [-106.634317, 45.195183],
        magnitudeValue: 924.3,
        magnitudeUnit: 'acres',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('category')).toBe('wildfires');
    expect(url.searchParams.get('status')).toBe('open');
  });

  it('routes status=all to the upstream days-bounded query', async () => {
    const fetchMock = stubFetch(envelope([event()]));
    const response = await handleEonetGet(new Request(ALL_URL));

    expect(response.status).toBe(200);
    expect((await getBody(response)).status).toBe('all');
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('category')).toBe('wildfires');
    expect(url.searchParams.get('status')).toBe('all');
    expect(url.searchParams.get('days')).toBe('30');
  });

  it('rejects an invalid or missing status with 400', async () => {
    const fetchMock = stubFetch(envelope([event()]));

    const invalid = await handleEonetGet(
      new Request('http://localhost/api/eonet?status=closed'),
    );
    expect(invalid.status).toBe(400);

    const missing = await handleEonetGet(
      new Request('http://localhost/api/eonet'),
    );
    expect(missing.status).toBe(400);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('selects the newest geometry entry as the display geometry', async () => {
    const fire = event({
      geometry: [
        {
          magnitudeValue: 100,
          magnitudeUnit: 'acres',
          date: '2026-08-01T10:00:00Z',
          type: 'Point',
          coordinates: [1, 2],
        },
        {
          magnitudeValue: 8500,
          magnitudeUnit: 'acres',
          date: '2026-08-09T16:55:00Z',
          type: 'Point',
          coordinates: [3, 4],
        },
      ],
    });
    stubFetch(envelope([fire]));

    const body = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(body.fires).toHaveLength(1);
    expect(body.fires[0].geometry).toEqual({
      type: 'Point',
      date: '2026-08-09T16:55:00Z',
      coordinates: [3, 4],
      magnitudeValue: 8500,
      magnitudeUnit: 'acres',
    });
  });

  it('falls back to the default description when description is null', async () => {
    stubFetch(envelope([event({ description: null })]));

    const body = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(body.fires[0].description).toBe('No description provided');
  });

  it('preserves a null magnitude on the newest geometry', async () => {
    stubFetch(
      envelope([
        event({
          geometry: [
            {
              magnitudeValue: null,
              magnitudeUnit: 'acres',
              date: '2026-08-09T16:55:00Z',
              type: 'Point',
              coordinates: [-106.634317, 45.195183],
            },
          ],
        }),
      ]),
    );

    const body = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(body.fires[0].geometry.magnitudeValue).toBeNull();
  });

  it('derives a marker point from a Polygon geometry (envelope center)', async () => {
    stubFetch(
      envelope([
        event({
          geometry: [
            {
              magnitudeValue: 500,
              magnitudeUnit: 'acres',
              date: '2026-08-09T16:55:00Z',
              type: 'Polygon',
              coordinates: [
                [
                  [-110, 40],
                  [-108, 40],
                  [-108, 42],
                  [-110, 42],
                  [-110, 40],
                ],
              ],
            },
          ],
        }),
      ]),
    );

    const body = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(body.fires).toHaveLength(1);
    expect(body.fires[0].geometry.coordinates).toEqual([-109, 41]);
  });

  it('drops events with zero or malformed geometry', async () => {
    stubFetch(
      envelope([
        event({ id: 'EONET_VALID' }),
        event({ id: 'EONET_EMPTY', geometry: [] }),
        event({
          id: 'EONET_BAD_DATE',
          geometry: [
            {
              date: 'not-a-date',
              type: 'Point',
              coordinates: [1, 2],
              magnitudeValue: null,
              magnitudeUnit: null,
            },
          ],
        }),
        event({
          id: 'EONET_BAD_COORDS',
          geometry: [
            {
              date: '2026-08-09T16:55:00Z',
              type: 'Point',
              coordinates: [1],
              magnitudeValue: null,
              magnitudeUnit: null,
            },
          ],
        }),
      ]),
    );

    const body = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(body.fires.map((fire) => fire.id)).toEqual(['EONET_VALID']);
  });

  it('does not call upstream within the TTL, then revalidates after it', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T00:00:00Z'));
    const fetchMock = stubFetch(envelope([event({ id: 'EONET_V1' })]));

    await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-08-10T00:01:00Z'));
    const second = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(second.fires[0].id).toBe('EONET_V1');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-08-10T00:06:00Z'));
    fetchMock.mockResolvedValue(
      Response.json(envelope([event({ id: 'EONET_V2' })])),
    );
    const stale = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(stale.stale).toBe(true);
    expect(stale.fires[0].id).toBe('EONET_V1');
    await vi.advanceTimersByTimeAsync(0);

    const refreshed = await getBody(
      await handleEonetGet(new Request(OPEN_URL)),
    );
    expect(refreshed.fires[0].id).toBe('EONET_V2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('isolates the cache by status — open never serves an all payload', async () => {
    const fetchMock = stubFetch(envelope([event({ id: 'EONET_OPEN' })]));
    const openBody = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(openBody.fires[0].id).toBe('EONET_OPEN');

    fetchMock.mockResolvedValue(
      Response.json(envelope([event({ id: 'EONET_ALL' })])),
    );
    const allBody = await getBody(await handleEonetGet(new Request(ALL_URL)));
    expect(allBody.fires[0].id).toBe('EONET_ALL');

    const openAgain = await getBody(
      await handleEonetGet(new Request(OPEN_URL)),
    );
    expect(openAgain.fires[0].id).toBe('EONET_OPEN');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces a failed first load as an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('upstream unreachable')),
    );

    const response = await handleEonetGet(new Request(OPEN_URL));
    expect(response.status).toBe(502);
  });

  it('keeps serving stale data when a background refresh fails', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T00:00:00Z'));
    const fetchMock = stubFetch(envelope([event({ id: 'EONET_V1' })]));

    await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-08-10T00:06:00Z'));
    fetchMock.mockRejectedValue(new Error('upstream unreachable'));

    const response = await handleEonetGet(new Request(OPEN_URL));
    expect(response.status).toBe(200);
    const body = await getBody(response);
    expect(body.stale).toBe(true);
    expect(body.fires[0].id).toBe('EONET_V1');
    await vi.advanceTimersByTimeAsync(0);

    const again = await getBody(await handleEonetGet(new Request(OPEN_URL)));
    expect(again.stale).toBe(true);
    expect(again.fires[0].id).toBe('EONET_V1');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('eonetUrl', () => {
  it('builds the open query', () => {
    const url = new URL(eonetUrl('open'));
    expect(url.searchParams.get('category')).toBe('wildfires');
    expect(url.searchParams.get('status')).toBe('open');
    expect(url.searchParams.has('days')).toBe(false);
  });

  it('builds the all query bounded by 30 days', () => {
    const url = new URL(eonetUrl('all'));
    expect(url.searchParams.get('status')).toBe('all');
    expect(url.searchParams.get('days')).toBe('30');
  });
});

describe('cache TTL constant', () => {
  it('is five minutes', () => {
    expect(EONET_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });
});
