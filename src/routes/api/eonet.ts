import { createFileRoute } from '@tanstack/react-router';

import type { WildfireStatus } from '#/lib/eonet';
import { getWildfires } from '#/lib/eonet-server';

export async function handleEonetGet(request: Request): Promise<Response> {
  const status = parseStatus(new URL(request.url).searchParams.get('status'));
  if (!status) {
    return new Response('status must be "open" or "all"', { status: 400 });
  }
  try {
    const payload = await getWildfires(status);
    return Response.json(payload);
  } catch {
    return new Response('Failed to load wildfires from the EONET feed', {
      status: 502,
    });
  }
}

export const Route = createFileRoute('/api/eonet')({
  server: {
    handlers: {
      GET: ({ request }) => handleEonetGet(request),
    },
  },
});

function parseStatus(value: string | null): WildfireStatus | null {
  return value === 'open' || value === 'all' ? value : null;
}
