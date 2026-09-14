# Operations checklist — virtualFit kiosk / staging

One-page runbook for deploy and rollback. See [deploy.md](./deploy.md) for platform details.

## Pre-deploy

- [ ] `npm run lint && npm run eslint && npm test && npm run verify-clients`
- [ ] CI green: matrix build for every registered client
- [ ] `VITE_CLIENT_ID=<target>` build smoke per [CLIENT_SMOKE.md](./CLIENT_SMOKE.md)
- [ ] Runtime secrets set: `GOOGLE_API_KEY` or `GEMINI_API_KEY`
- [ ] `API_KEY` set for public `/api/*` (and `VITE_KIOSK_API_KEY` matching in client build)
- [ ] `API_RATE_LIMIT_MAX` / `API_RATE_LIMIT_WINDOW_MS` reviewed for kiosk traffic
- [ ] Kiosk display: `VITE_DISPLAY=mupi` baked in build if MUPI

## Deploy

```bash
npm ci
VITE_CLIENT_ID=nomad VITE_KIOSK_API_KEY=<secret> npm run build
NODE_ENV=production API_KEY=<secret> npm start
```

- [ ] Health: `GET /` returns SPA (200)
- [ ] Auth: `POST /api/generate` without key → 401
- [ ] Rate limit: burst over limit → 429 with `Retry-After`

## Post-deploy smoke (MUPI)

- [ ] Landing copy matches client manifest
- [ ] Optional logo matches the client pack when configured
- [ ] Camera permission → capture → generating → studio rail
- [ ] Garment thumb URLs under `/garments/<clientId>/`
- [ ] Footer copy from manifest

## Rollback

1. Redeploy previous App Platform revision or prior container image tag.
2. If only client pack broke: rebuild with last known good `VITE_CLIENT_ID` + assets commit.
3. Verify Nomad regression on `VITE_CLIENT_ID=nomad` before re-opening kiosk.

## Incident notes

- **429 from Gemini:** check quota; optional `GEMINI_API_KEY_BACKUP`.
- **401/403 on try-on:** mismatch between `API_KEY` (server) and `VITE_KIOSK_API_KEY` (build).
- **Empty wardrobe:** run `npm run verify-clients`; check `config/clients/<id>.wardrobe.ts`.
