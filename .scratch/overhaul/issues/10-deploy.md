# 10 - Deploy to hosting target

Status: resolved
Blocked by: 01

## Answer

Vercel config via Nitro plugin (`nitro` dep, `vite.config.ts` nitro() plugin, `vercel.json` framework pin, `.gitignore` for `.vercel/`). Live deploy verified at https://10-deploy-nine.vercel.app (SSR 200, assets served; EONET server function pending data-layer merge). Committed as `feat(deploy): configure Vercel deployment with Nitro SSR` (squash-merged).

- Configure deployment for **Vercel** (chosen deliberately; TanStack Start does not list Vercel as an official partner — expect the Nitro plugin path and verify SSR + server functions work on the live deploy).
- Env/CI setup (no secrets needed — EONET needs no key; OpenFreeMap needs no key).
- Verify the live deploy serves SSR + data layer correctly and the stale-data fallback works.
