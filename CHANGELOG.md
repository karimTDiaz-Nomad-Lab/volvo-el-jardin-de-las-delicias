# Changelog

## 0.2.0 — 2026-05-29 (template maturity M1–M4)

### M1 — Client pack

- Per-client `wardrobe` and `copy` on `PlatformManifest`
- Garments under `public/garments/<clientId>/`
- Reference client: `nomad`
- `getWardrobe()`, `getCopy()`; StartScreen/Footer wired to manifest

### M2 — Factory

- `npm run new-client <id>` scaffold CLI
- `npm run verify-clients`
- CI matrix build per registered client

### M3 — Production gate

- `/api/*` auth (`API_KEY`, `KIOSK_TOKENS`) + rate limiting
- `VITE_KIOSK_API_KEY` for kiosk builds
- [docs/deploy.md](docs/deploy.md), [docs/OPS_CHECKLIST.md](docs/OPS_CHECKLIST.md)
- Playwright E2E smoke in CI

### M4 — Platform

- `AGENTS.md`, expanded `integrations/README.md`
- [docs/TEMPLATE_SKELETON.md](docs/TEMPLATE_SKELETON.md)

## 0.1.0

- Platform modularization baseline (features, config manifests, Phase 2 CSS modules)
