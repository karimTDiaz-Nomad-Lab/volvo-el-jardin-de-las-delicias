# virtualFit — Product roadmap (template branch)

> **Audience:** CTO / tech leads  
> **Branch:** `refactor/platform-modularization` (~13 commits ahead of `master` at time of writing)  
> **Related:** [TEMPLATE_BLUEPRINT.md](./TEMPLATE_BLUEPRINT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [STYLING.md](./STYLING.md)

---

## 1. Context

### Branch vs master

| | `master` | `refactor/platform-modularization` |
|---|----------|-------------------------------------|
| **Role** | Stable line for current Nomad/kiosk deployments | Template migration — structural + docs |
| **Layout** | Flat root (`components/`, `hooks/`, `lib/`) | `src/` features + `config/clients/` + `server/` + `tooling/` |
| **Risk** | Known in production | Needs PR review + smoke on real hardware before merge |

### Goal

1. **Template replicable (“churreras”)** — new retail client = manifest + brand assets + optional theme, not a fork.
2. **Master stable** — merge only after checklist, no force-push; production Nomad keeps working on `mupi` + server-side Gemini.

### Non-goals on this branch

- Full design-system rewrite in one PR.
- Re-introducing native ads or QR rewards in core (see [What NOT to do](#9-what-not-to-do)).

> **Template maturity (7→10):** [TEMPLATE_MATURITY.md](./TEMPLATE_MATURITY.md) — four milestones to full white-label readiness.

---

## 2. Done (checklist)

Use this as the merge narrative for stakeholders.

- [x] **QR rewards removed** from core (separate product/repo).
- [x] **Native ads removed** — stubs deleted; future slot `integrations/creative-loader/`.
- [x] **`src/` migration** — `app/`, `features/capture`, `features/studio`, `shared/`, `core/`, `services/`, `styles/`.
- [x] **Multi-client manifests** — `config/clients/nomad.manifest.ts`, `_template.manifest.ts`, `getManifest()` + `VITE_CLIENT_ID`.
- [x] **Server modularization** — `server/index.ts`, `server/routes/generate.ts`; keys server-side only.
- [x] **`tooling/` consolidation** — Vite, TS, Tailwind, ESLint, PostCSS; thin root stubs.
- [x] **Lean root** — brand under `public/brand/{clientId}/`, docs under `docs/`.
- [x] **Manifest feature flags** — `videoLoop`, `wardrobeFeed`, `kioskIdle` (session pipeline kept; look-loop CTA UI not shipped).
- [x] **CI** — `lint`, `eslint`, `build`, `test` (vitest: look composition + manifest smoke).
- [x] **Docs** — `TEMPLATE_BLUEPRINT`, `ARCHITECTURE`, `PROJECT` paths updated, `STYLING.md`, `ROADMAP` (this file).
- [x] **`.env.example` restored** — server + `VITE_*` documented.
- [x] **Dead code pass** — disabled look-loop button, orphan ad CSS, unused flags.
- [x] **CSS foundation** — `src/styles/index.css` import chain; styling rules in `STYLING.md`.
- [x] **Version** — `0.1.0` (template baseline).

---

## 3. Phase 1 — Pre-merge (1–2 weeks)

Target: safe PR into `master` with one Nomad regression pass on kiosk + desktop.

| Item | Owner | Effort | Acceptance criteria |
|------|-------|--------|---------------------|
| **PR to master** — single or stacked PRs with description linking blueprint | Platform / dev lead | M | PR approved; CI green; changelog for ops (port 8080, `.env.example`). |
| **Smoke test checklist** — capture → model → garment → idle reset | Dev + QA | S | Documented pass on Chrome + one MUPI viewport; no console errors on `/api/generate`. |
| **Register new clients in `config/index.ts`** — document in README (already noted) | Platform | S | Adding `acme.manifest.ts` without registry edit fails loudly or docs say required step. |
| **Demo client manifest** — e.g. `config/clients/demo.manifest.ts` + `public/brand/demo/` (fake brand) | Platform | S | `VITE_CLIENT_ID=demo npm run build` succeeds; proves template path without touching Nomad assets. |
| **Update `docs/deploy.md`** — align port, env vars, server-only keys | Platform | S | Deploy doc matches `npm run start` + `.env.example`. |
| **`.env.example`** | Platform | — | **Done** ✓ |
| **CI client matrix (optional)** — build with `VITE_CLIENT_ID=nomad` and `demo` | Platform | M | GitHub Actions matrix or second job; catches broken client registry. |
| **PROJECT.md file paths** — spot-check vs `src/` | Dev | S | No references to root `components/` as current paths. |

### PR to master checklist (copy-paste)

- [ ] `npm run lint && npm run eslint && npm run build && npm test`
- [ ] Nomad manifest unchanged in behavior (`kioskIdle`, `mupi`, logo path)
- [ ] `.env.local` / `.env.example` documented for ops
- [ ] No secrets in repo; no `GEMINI_*` in client bundle (verify build output / network tab)
- [ ] MUPI layout: start screen, studio rail, footer, idle timeout
- [ ] Rollback plan: revert merge commit on master

---

## 4. Phase 2 — CSS pass (incremental)

**Principle:** follow [STYLING.md](./STYLING.md) — **no big-bang** rewrite of all `*.module.css` files.

| Slice | Scope | Status |
|-------|--------|--------|
| **2a — Capture** | `StartScreen`, `CameraCapture` modules | Done |
| **2b — Studio** | `Canvas`, `App.module.css`, `studio-mupi.css` trim | Done |
| **2c — Shared UI** | `Footer`, Tailwind `text-vf-*`, STYLING.md | Done |
| **2d — Client skin** | `themes/demo.css` + `manifest.theme` | Done |

**Per-PR rule:** one feature folder + globals only if needed; Tailwind stays layout-only.

---

## 5. Phase 3 — Integrations (blocked on other teams)

Do **not** implement in core until adapter contract exists in `integrations/` + manifest flag.

| Integration | Owner | Blocker | Slot |
|-------------|-------|---------|------|
| **Creative loader** (sponsored moments on generate / try-on loading) | External dev / adtech | API + iframe contract | `integrations/creative-loader/` |
| **QR rewards** | Other dev / separate repo | Product decision | **Out of core** — never re-merge without explicit ADR |

**Acceptance (when unblocked):** `init(manifest)` adapter; no direct imports from `StartScreen` / `Canvas` to vendor SDKs; feature flag in manifest.

---

## 6. Phase 4 — Platform hardening

| Item | Effort | Notes |
|------|--------|-------|
| **Event bus** — session / garment / compose events for analytics | M | Thin pub/sub in `src/shared/` or `integrations/analytics/` |
| **E2E smoke** — Playwright: landing → capture mock → studio | L | CI job; camera mocked or fixture image |
| **Server auth** — API key or kiosk token on `/api/*` | M | Required before public internet deploy |
| **Rate limiting** — per-IP / per-kiosk on generate | M | Pair with auth |
| **Gemini “Phase 6”** — document as **done** for proxy; extend with edge worker / multi-region if needed | S–M | Client already uses `/api/generate`; harden ops (timeouts, backoff) |

---

## 7. Phase 5 — AI platform template

Prepare virtualFit as a **consumable template** for agents and internal scaffolding.

| Item | Effort | Outcome |
|------|--------|---------|
| **Agent metadata** — `AGENTS.md` or `.cursor/rules` with boundaries, manifest contract, test commands | S | Agents don’t edit `tooling/` for product changes |
| **Client scaffolding** — script: `pnpm vf new-client acme` → manifest + `public/brand/acme` + registry entry | M | &lt;5 min new client |
| **Template pack** — export minimal tree (no Nomad garments) for greenfield | L | Second repo or branch `template-skeleton` |
| **Feature composition docs** — how to add capture-only or studio-only experiences | M | Extends blueprint mermaid |

---

## 8. Prioritized backlog

| Rank | Task | Phase | Effort | Depends on |
|------|------|-------|--------|------------|
| 1 | PR + smoke test → merge to `master` | 1 | M | — |
| 2 | Demo client manifest + registry | 1 | S | — |
| 3 | Deploy doc + ops handoff | 1 | S | Merge |
| 4 | CSS pass: capture feature | 2 | M | Merge |
| 5 | CSS pass: studio feature | 2 | M | 2–4 |
| 6 | CI client build matrix | 1 | M | Demo client |
| 7 | Look-loop CTA UI (when product approves) | 2 | S | `features.videoLoop` |
| 8 | Creative loader adapter | 3 | L | External API |
| 9 | E2E Playwright smoke | 4 | L | Merge |
| 10 | Server auth + rate limit | 4 | M | Production exposure |
| 11 | Event bus + analytics adapter | 4 | M | — |
| 12 | Client scaffolding CLI | 5 | M | Stable manifest API |
| 13 | QR integration | — | — | **Won’t do in core** |

---

## 9. What NOT to do

- **Do not** re-add native ad components (`NativeAdMoment`, `nativeAds.ts`, `features.nativeAds`) in core — use `integrations/creative-loader/` when ready.
- **Do not** merge QR rewards into this repo without a dedicated ADR and product owner.
- **Do not** force-push `master` or merge without PR + CI + kiosk smoke.
- **Do not** put `GEMINI_API_KEY` / `GOOGLE_API_KEY` in Vite `define` or client env — server only.
- **Do not** big-bang replace all CSS modules with Tailwind in one PR — use Phase 2 slices.
- **Do not** break Nomad defaults: `clientId: nomad`, `display.defaultMode: mupi`, `public/brand/nomad/logo.png`.

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-29 | Initial roadmap on `refactor/platform-modularization` |
