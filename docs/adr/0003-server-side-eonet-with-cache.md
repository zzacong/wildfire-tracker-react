# 0003 - Server-side EONET fetch with TTL cache + 1000 cap

EONET v3 is CORS-open but rate-limited to ~60 requests/hour per IP. Rather than have every visitor's browser call it, a TanStack Start **server function fetches once per TTL (~15 min)** and caches; the browser only talks to our own server. On failure we serve last-known data with a "stale data" banner rather than an error page.

Rationale: fires don't change by the second, and a dead page is worse than slightly stale dots. We also **hard-cap results at 1,000 events** in this layer so a surge (e.g. floods + fires both enabled) can never overwhelm the client. Reversible, but surprising without this note — someone would "simplify" it to a client-side fetch and rediscover the rate limit.
