# Styling architecture

How to style virtualFit so layouts stay fast in Tailwind and brand surfaces stay **editable in CSS files** (not trapped in long `className` strings).

See also: [ARCHITECTURE.md](./ARCHITECTURE.md), [TEMPLATE_BLUEPRINT.md](./TEMPLATE_BLUEPRINT.md), [ROADMAP.md](./ROADMAP.md).

## Import chain

```
src/main.tsx
  └── src/app/globals.css
        ├── src/styles/index.css   ← tokens, themes, kiosk/studio globals
        └── @tailwind base/components/utilities
```

Do not import token files from components directly — go through `globals.css` / `index.css`.

## Layers (who owns what)

| Layer | Location | Use for |
|-------|----------|---------|
| **Tokens** | `src/styles/tokens/` | Brand primitives (`--vf-*`) and semantic aliases (`--color-*`, `--text-*`) |
| **Themes** | `src/styles/themes/` | Per-client skin via `manifest.theme` → `data-theme` on `<html>` |
| **CSS Modules** | `*.module.css` next to components | Surfaces, typography, states — **edit these files** |
| **Tailwind** | JSX `className` | Layout only: `flex`, `gap`, `min-h-0`, `absolute` |
| **App shell** | `src/app/App.module.css` | Studio 70/30 grid, rail glass, canvas pane |
| **Display globals** | `kiosk-display.css`, `studio-mupi.css` | MUPI scale, landing insets, footer, brand mark |

## Typography utilities (Tailwind)

Prefer semantic size utilities (backed by CSS variables) over `text-[var(--fs-body)]`:

| Utility | Token |
|---------|--------|
| `text-vf-label` | `--fs-label` |
| `text-vf-body` | `--fs-body` |
| `text-vf-title-sm` | `--fs-title-sm` |
| `text-vf-title` | `--fs-title` |
| `text-vf-hero` | `--fs-hero` |

## Feature → module map

| Area | TSX | Module | Global hooks allowed |
|------|-----|--------|----------------------|
| App studio shell | `app/App.tsx` | `app/App.module.css` | Footer/brand: `studio-mupi.css` |
| Capture landing | `features/capture/StartScreen.tsx` | `StartScreen.module.css` | `app-start--mupi`, landing insets |
| Capture camera | `features/capture/CameraCapture.tsx` | `CameraCapture.module.css` + `CaptureFrame.module.css` | `capture-*` in `kiosk-display.css` (touch targets) |
| Studio canvas | `features/studio/Canvas.tsx` | `Canvas.module.css` | — |
| Look stack | `features/studio/LookStack.tsx` | `LookStack.module.css` | MUPI type via `:global([data-display='mupi'])` in module |
| Wardrobe rail | `WardrobePanel` + `ProductRail` | `ProductRail.module.css`, `GarmentTile.module.css` | — |
| Rail title | `App.tsx` | `SectionHeader.module.css` `.railTitle` | — |
| Footer | `shared/components/Footer.tsx` | `Footer.module.css` | `app-footer--*` in `studio-mupi.css` |
| Buttons / glass | `shared/ui/Button.tsx` | `Button.module.css` | — |

MUPI typography overrides live **inside the owning module** using:

```css
:global([data-display='mupi']) .label { font-size: clamp(...); }
```

Do not add new `.product-name` / `.rail-title` global string hooks in TSX.

## Rules for new UI

1. **Brand color / shadow / radius** → token or Tailwind `bg-accent`, `text-muted`, etc.
2. **Component look & feel** → `ComponentName.module.css`.
3. **Layout** → Tailwind or module `display`/`flex` — not both for the same concern.
4. **Avoid** arbitrary color in JSX (ESLint warns on `#` and `rgba(` in `className`).
5. **Safe-area** on `App.tsx` rail/main — inline `env()` is OK.

## Client skin (manifest-driven)

1. Add `src/styles/themes/<name>.css` with `[data-theme='<name>'] { --vf-*: ... }`.
2. Import the file in `src/styles/index.css`.
3. Set `theme: '<name>'` in `config/clients/<client>/manifest.ts`.
4. Register client in `config/index.ts`.
5. Build: `VITE_CLIENT_ID=<client> npm run build`.

Example: Nomad uses `themes/lifestyle-sport.css`. New clients get `themes/<clientId>.css` via `npm run new-client`.

Landing video chrome stays `data-theme='dark'` inside `KioskShell` only.

## Add an editable overlay (recipe)

1. Add class in the feature `.module.css` (e.g. `.loadingVeil` in `Canvas.module.css`).
2. Use tokens: `background: rgba(var(--vf-overlay), 0.56);` and `backdrop-filter: blur(12px);`.
3. In TSX: `<div className={styles.loadingVeil}>` — layout children with flex in module, not Tailwind arbitrary colors.
4. MUPI sizing: add `:global([data-display='mupi']) .loadingMessage { font-size: clamp(...); }` in the same module file.

## Examples

**Good — module + tokens**

```tsx
<p className={styles.loadingMessage}>{loadingMessage}</p>
```

```css
.loadingMessage {
  font-size: var(--fs-body);
  color: rgba(255, 255, 255, 0.9);
}
```

**Good — Tailwind layout only**

```tsx
<main className="flex-1 min-h-0 relative overflow-hidden bg-bg0">
```

**Avoid**

```tsx
<div className="bg-gradient-to-b from-black/38 via-transparent to-black/46" />
```

Use a named class in a module instead.
