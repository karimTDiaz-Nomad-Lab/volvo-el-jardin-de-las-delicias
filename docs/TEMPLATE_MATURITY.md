# virtualFit — Try-on white-label maturity

> **Scope:** Virtual try-on template only (capture → studio → wardrobe). **Not** multi-experience composer, photo-booth, or Iberdrola-style flows.  
> **Audience:** CTO / tech leads  
> **Score (2026-05-29):** **10/10** for repeatable white-label try-on on branch `refactor/platform-modularization`  
> **Related:** [TEMPLATE_BLUEPRINT.md](./TEMPLATE_BLUEPRINT.md) · [CLIENT_SMOKE.md](./CLIENT_SMOKE.md) · [TEMPLATE_SKELETON.md](./TEMPLATE_SKELETON.md)

---

## Definition of 10/10 (try-on only)

| Gate | Criterion | Status |
|------|-----------|--------|
| **G1 — Client pack isolated** | `VITE_CLIENT_ID=<client>` build resolves only that manifest, wardrobe, copy, theme; no silent fallback to another brand | ✅ |
| **G2 — Reference pack** | `nomad` with own logo, theme, wardrobe, copy; smoke ≤ 15 min documented | ✅ |
| **G3 — Factory** | `npm run new-client <id>` → pack + registry + theme + **CI matrix**; invalid `VITE_CLIENT_ID` **fails build**; `verify-clients` **fails** on empty wardrobe | ✅ |
| **G4 — Production** | `NODE_ENV=production` **requires** `API_KEY` or `KIOSK_TOKENS` at startup; rate limit on `/api/*`; `.do/app.yaml` documents build/runtime env | ✅ |
| **G5 — Confidence** | CI: matrix build per client; Playwright landing + API auth + **studio shell** (mocked camera + `/api/generate`) | ✅ |
| **G6 — Consumable** | `AGENTS.md`, README single onboarding path, `template-skeleton` branch for greenfield | ✅ |

**10/10 here** = another retail brand ships as **data + assets**, not app forks, with CI catching broken packs before merge.

---

## What is intentionally out of scope

| Item | Why not in 10/10 |
|------|------------------|
| Experience composer / photo-booth | Different product surface |
| Multi-tenant SaaS / runtime client switching | One `VITE_CLIENT_ID` per deploy |
| `integrations/*` implementations | Adapters optional behind manifest flags |
| Merge to `master` | Release decision, not template architecture |
| Real-camera E2E on CI | Flaky; studio path covered via mocked `getUserMedia` + API |

---

## Factory & CI (G3) — implemented

- `config/clients/<id>/{manifest,copy,wardrobe}.ts` per brand  
- `config/registry.ts` — full registry for verify/tests; Vite alias `@client-manifest` for active build only  
- `tooling/new-client.mjs` — scaffold + registry + `PlatformTheme` + theme CSS import + **`.github/workflows/ci.yml` matrix**  
- `tooling/vite.config.ts` — throws if `VITE_CLIENT_ID` ∉ registry (no silent `nomad` fallback)  
- `tooling/verify-client-pack.mjs` — exit **1** if wardrobe has zero `category:` entries  
- CI `build-clients` matrix: `nomad`

---

## Production (G4) — implemented

- `assertProductionApiAuthConfigured()` in `server/index.ts` — startup exit if production and no keys  
- `apiAuthMiddleware` + rate limit on `/api/*`  
- `.do/app.yaml`: `VITE_CLIENT_ID`, `VITE_KIOSK_API_KEY` (build), `API_KEY` (runtime)  
- [deploy.md](./deploy.md) + `.env.example`

---

## Testing (G5) — implemented

| Layer | What runs |
|-------|-----------|
| Vitest | Domain + `config/clientPack.test.ts` |
| `verify-clients` | Filesystem + wardrobe non-empty |
| Playwright | Landing copy, 401 without API key, studio rail after mocked capture |

E2E build for CI/local: `VITE_CLIENT_ID=nomad VITE_KIOSK_API_KEY=<same as API_KEY> npm run build` then `API_KEY=... npm run test:e2e`.

---

## Remaining operational blockers (not template score)

| Blocker | Owner |
|---------|--------|
| Merge `refactor/platform-modularization` → `master` when business signs off | Release |
| Per-brand production secrets (`GOOGLE_API_KEY`, `API_KEY`, `VITE_KIOSK_API_KEY`) | Ops |
| Kiosk MUPI manual smoke on target hardware | Field / QA |
| New client still needs real garments + copy review | Brand team |

These do **not** lower the template score; they are deploy/pilot checklist items.

---

## Fast path vs full path

### Fast path (~2 weeks, pilot)

M1 reduced for one `<marca>`: manual registry OK only if you skip `new-client`; auth via reverse proxy acceptable; skip Playwright locally.

### Full path (this repo today)

Factory + matrix CI + production auth + E2E + docs — **done on feature branch**. Next step is merge + first external brand deploy using README “New brand” table.

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-29 | Initial 7→10 roadmap |
| 2026-05-29 | M1–M4 on `refactor/platform-modularization` |
| 2026-05-29 | War-room hardening: vite fail-fast, verify wardrobe, CI matrix patch, prod auth startup, DO envs, studio E2E; **try-on white-label 10/10** |
