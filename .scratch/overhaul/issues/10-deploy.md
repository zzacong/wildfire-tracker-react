# 10 - Deploy to hosting target

Status: ready-for-agent
Blocked by: 01

- Configure deployment for **Vercel** (chosen deliberately; TanStack Start does not list Vercel as an official partner — expect the Nitro plugin path and verify SSR + server functions work on the live deploy).
- Env/CI setup (no secrets needed — EONET needs no key; OpenFreeMap needs no key).
- Verify the live deploy serves SSR + data layer correctly and the stale-data fallback works.
