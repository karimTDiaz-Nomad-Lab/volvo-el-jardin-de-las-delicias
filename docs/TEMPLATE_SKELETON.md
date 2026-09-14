# template-skeleton branch

Greenfield export of virtualFit **without Nomad retail assets**, for new products or agencies.

## Branch `template-skeleton`

Maintained on this repo (from `refactor/platform-modularization`): Nomad retail assets removed; `nomad` stays in CI on main template for regression — skeleton forks may drop it from the matrix.

To refresh locally:

```bash
git checkout template-skeleton   # or create from refactor branch per steps below
```

### Create or refresh (maintainers)

From `refactor/platform-modularization` (or `master` after merge):

```bash
git checkout -b template-skeleton
git rm -r public/garments/nomad public/brand/nomad
# Keep: config/clients/_template, config/clients/nomad (or remove nomad on skeleton-only forks)
git commit -m "chore(template): skeleton export without Nomad assets"
git push -u origin template-skeleton
```

Update root README intro to point at `npm run new-client` and `_template`.

## What stays

- Full `src/`, `server/`, `tooling/`, `config/` factory
- `config/clients/_template/` stubs for `npm run new-client`

## What goes

- `public/garments/nomad/**`
- `public/brand/nomad/logo.png`
- Optional: remove `nomad` from CI matrix on skeleton-only forks (keep in main template repo for regression)

## Clone workflow for a new product

```bash
git clone <repo> -b template-skeleton my-brand-fit
cd my-brand-fit
npm install
npm run new-client my-brand
# add logo + garments, then VITE_CLIENT_ID=my-brand npm run dev
```
