# Tooling (`tooling/`)

Build, lint, and CSS pipeline configuration for virtualFit. **Not** product/client template settings — those live in [`config/`](../config/) (manifest, wardrobe, feature flags).

| File | Role |
|------|------|
| `vite.config.ts` | Vite root, `@/` alias, dev API proxy |
| `tsconfig.app.json` | TypeScript app compile (extended by root `tsconfig.json`) |
| `tailwind.config.js` | Tailwind content globs + theme tokens |
| `postcss.config.js` | Tailwind + Autoprefixer (points at `tailwind.config.js` here) |
| `eslint.config.js` | ESLint flat config |

## Root stubs

CLI tools (Vite, PostCSS, Tailwind, ESLint) discover config from the **repo root**. Thin re-export files sit at the root and delegate here:

- `../vite.config.ts`
- `../postcss.config.js`
- `../tailwind.config.js`
- `../eslint.config.js`
- `../tsconfig.json` → `extends ./tooling/tsconfig.app.json`

## vs other folders

| Folder | Purpose |
|--------|---------|
| `config/` | Per-deployment product manifest (`getManifest()`, wardrobe) |
| `docs/` | Architecture, deploy, editing rules |
| `docs/STYLING.md` | Tokens, CSS modules vs Tailwind |
| `tooling/` | This folder — bundler, TS, lint, CSS |
