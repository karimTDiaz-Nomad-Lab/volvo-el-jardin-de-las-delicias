# virtualFit platform layout

Concise map for client deployments ("churreras") and future AI-platform templating.

> **Full migration spec:** [`docs/TEMPLATE_BLUEPRINT.md`](./TEMPLATE_BLUEPRINT.md)  
> **Styling rules:** [`docs/STYLING.md`](./STYLING.md) (tokens, CSS modules, Tailwind boundaries)

## Repository layout (root)

```
virtualFit/
├── index.html              # Vite HTML entry
├── package.json
├── server.ts               # Thin entry → server/index.ts
├── server/                 # Node API (Express + Vite middleware)
│   ├── index.ts
│   └── routes/generate.ts
├── tooling/                # Build config (Vite, TS, Tailwind, ESLint, PostCSS)
├── config/                 # Product manifests + wardrobe data
│   ├── types.ts
│   ├── index.ts            # getManifest() — resolves via VITE_CLIENT_ID
│   ├── wardrobe.ts
│   └── clients/            # Per-client folders (manifest, wardrobe, copy)
│       ├── _template/
│       └── nomad/
├── src/                    # All client-side application code
│   ├── main.tsx
│   ├── app/                # App shell + global styles
│   ├── features/           # Feature modules (capture, studio)
│   ├── core/               # Domain logic (look composition, media)
│   ├── services/           # External API adapters (Gemini)
│   ├── shared/             # Cross-feature UI, hooks, lib, context, types
│   └── styles/             # CSS tokens, themes, kiosk layouts
├── public/
│   ├── brand/{clientId}/   # Client logos
│   └── garments/           # Product images
├── integrations/           # Future optional adapters
└── docs/                   # Architecture, blueprint, deploy, audits
```

## Path aliases

| Alias | Resolves to | Usage |
|-------|-------------|-------|
| `@/` | `src/` | All application code: `@/shared/lib/utils` |
| `@config/` | `config/` | Manifest + wardrobe: `@config/types` |

## Dependency rules

- Features (`src/features/*`) import shared + core + services, **never** each other.
- `src/core/` contains pure domain logic — no React, no UI imports.
- `src/shared/ui/` is the design system layer — zero feature-specific logic.
- `config/` is read-only data; any module may import it.
- `server/` runs in Node — may import `src/services/gemini-response.ts` only.

## Manifest features

| Flag | Default | Description |
|------|---------|-------------|
| `videoLoop` | `true` | Motion loop generation in studio |
| `wardrobeFeed` | `false` | Merge remote demo tops (`VITE_WARDROBE_FEED=true`) |
| `kioskIdle` | `true` | MUPI idle timeout → start over |

Sponsored loading moments (former native ad docks) are deferred to `integrations/creative-loader/` when the creative loader API is available.

## Display mode

Resolution order: `VITE_DISPLAY` → `localStorage` (`vf-display`) → manifest `display.defaultMode`.

- `mupi` — portrait kiosk / MUPI layout
- `desktop` — laptop dev layout

## New client

```bash
npm run new-client -- <client-id>
# Add logo + garments, then:
VITE_CLIENT_ID=<client-id> npm run build
```
