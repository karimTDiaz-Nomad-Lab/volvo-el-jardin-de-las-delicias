# Client pack smoke checklist (≤ 15 min)

Use after M1 client-pack changes or when onboarding a new `VITE_CLIENT_ID`.

## Build isolation (G1)

```bash
VITE_CLIENT_ID=nomad npm run build
grep -rq 'brand/<other-client>\|/garments/<other-client>/' dist && echo FAIL || echo OK
```

After adding a new client, repeat with `VITE_CLIENT_ID=<new-id>` and grep for paths from other registered clients.

## Dev smoke (G2)

```bash
# Nomad — reference pack
VITE_CLIENT_ID=nomad VITE_DISPLAY=mupi npm run dev
```

1. Nomad copy and `/garments/nomad/` paths load correctly.
2. Logo loads from `/brand/nomad/logo.png`.
3. Complete capture (or mock) → studio rail shows only Nomad garment thumbnails.
4. Network tab: image URLs under `/garments/nomad/`, logo `/brand/nomad/logo.png`.

For a new client pack, repeat the same checks with `VITE_CLIENT_ID=<id>`.

## Automated

```bash
npm test
npm run lint && npm run eslint
```

`config/clientPack.test.ts` covers registry and path isolation.
