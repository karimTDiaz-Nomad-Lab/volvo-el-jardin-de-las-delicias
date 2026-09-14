# Deploy virtualFit (App Platform)

Production uses a **Node server** (`npm start`) that serves the Vite build and proxies Gemini. Do not deploy as a static-only site if you need try-on or video generation.

## Build-time vs runtime

| Variable | When | Purpose |
|----------|------|---------|
| `VITE_CLIENT_ID` | **Build** | Client manifest + wardrobe + copy |
| `VITE_DISPLAY` | Build | `mupi` \| `desktop` override |
| `VITE_KIOSK_API_KEY` | Build | Sent as `X-API-Key` on `/api/*` from browser |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | **Runtime** | Server Gemini auth |
| `API_KEY` | Runtime | Validates kiosk/browser calls to `/api/*` |
| `KIOSK_TOKENS` | Runtime | Comma-separated extra valid tokens |
| `API_RATE_LIMIT_MAX` | Runtime | POST `/api/*` per IP per window (default 10) |
| `API_RATE_LIMIT_WINDOW_MS` | Runtime | Window ms (default 60000) |
| `PORT` | Runtime | HTTP port (default 8080) |

If `API_KEY` and `KIOSK_TOKENS` are unset, `/api` auth is disabled (local dev only).

## DigitalOcean App Platform

1. Connect your repo in App Platform.
2. Use the spec in [`.do/app.yaml`](../.do/app.yaml) (region `ams`, port `8080`, `npm start`).
3. Set **runtime** secrets:
   - `GOOGLE_API_KEY` or `GEMINI_API_KEY`
   - `API_KEY` (must match `VITE_KIOSK_API_KEY` in the build component)
   - Optional: `GEMINI_API_KEY_BACKUP`, `API_RATE_LIMIT_MAX`, `API_RATE_LIMIT_WINDOW_MS`
4. Set **build** env on the static/build step:
   - `VITE_CLIENT_ID=nomad` (or target client)
   - `VITE_KIOSK_API_KEY` = same value as runtime `API_KEY`
5. Restrict the Gemini key in [Google AI Studio](https://aistudio.google.com/app/apikey): Gemini-only, server use.

## Local production smoke

```bash
npm install
cp .env.example .env.local
# Set GOOGLE_API_KEY, API_KEY, VITE_KIOSK_API_KEY (same value for local prod test)
VITE_CLIENT_ID=nomad VITE_KIOSK_API_KEY=local-dev-key npm run build
API_KEY=local-dev-key npm start
# open http://localhost:8080
```

Without a valid Gemini key, the app loads but generation fails. Without matching API keys when `API_KEY` is set, `/api/generate` returns 401.

## Rollback

- App Platform: promote previous deployment revision.
- Document client build id (`VITE_CLIENT_ID` + git SHA) in release notes.

See [OPS_CHECKLIST.md](./OPS_CHECKLIST.md) for pre/post deploy steps.

## Vercel / Netlify / static CDN

Static hosts cannot run `/api/generate`. Image and Veo video features require App Platform (or another Node backend).

**Security:** Never put `GEMINI_API_KEY` in Vite `define` or public `VITE_*` vars except `VITE_KIOSK_API_KEY` (kiosk gate, not Gemini). All Gemini traffic goes through `server/`.
