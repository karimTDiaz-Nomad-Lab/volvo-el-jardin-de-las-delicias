# ADR 0001: State and style boundaries

**Status:** Accepted  
**Date:** 2026-05-27

## Context

virtualFit mixes kiosk layout, session orchestration, Gemini media pipelines, and a hybrid styling stack (tokens + global CSS + CSS Modules + Tailwind). Without explicit boundaries, changes in one layer leak into others and regressions become expensive.

## Decision

### Session and UI state

| Concern | Owner | Notes |
|--------|--------|--------|
| Try-on session (model, slots, compose, video) | `hooks/useTryOnSession.ts` | Single orchestrator; refs/tokens for concurrency live here |
| Display mode / kiosk idle | `lib/useDisplayMode.ts`, `lib/useKioskIdle.ts` | Wired from `App.tsx` only |
| Layout and view switching | `App.tsx` | No business rules; passes hook API to children |
| Slot rules and render plan | `lib/lookComposition.ts` | Pure domain; tested without React |
| Gemini I/O | `services/geminiService.ts` (façade) | Image/video split in `gemini-*.service.ts`, `video-fallback.service.ts` |

**Rule:** New try-on behavior goes into `lookComposition` (rules) or `useTryOnSession` (orchestration), not into presentational components.

### Styling

| Layer | Use for | Avoid |
|-------|---------|--------|
| `styles/tokens/*` | Semantic colors, spacing, typography | Component-specific hacks |
| Global shell (`kiosk-display.css`, `studio-mupi.css`) | Layout shell, MUPI scale, safe areas | Per-component layout that belongs in modules |
| CSS Modules (`*.module.css`) | Component-local layout and states | Cross-importing module class names |
| Tailwind utilities | Small one-off layout in TSX | Duplicating token values inline |

**Rule:** Do not rely on global string bridges (`rail-label`, `product-name`, `layer-name`) for new features; prefer module classes or shared token variables.

### Audio

| Layer | Owner |
|-------|--------|
| Unlock + shutter singleton | `lib/sfx.ts` |
| Background music | `lib/backgroundAudio.ts` |
| UX sound map | `hooks/useUiSfx.ts` |
| Provider lifecycle | `context/SfxProvider.tsx` |
| Hook consumer API | `context/useSfx.ts` |

## Consequences

- `App.tsx` stays thin; session complexity is discoverable in one hook.
- Gemini refactors stay behind `geminiService` exports.
- Style regressions are reduced by keeping overrides local to modules.
- New features should add domain tests in `lib/lookComposition.test.ts` when touching slots.

## Out of scope (later)

- Backend proxy for Gemini API key (see `../PROJECT.md`).
- Full `features/` folder split (capture / composition / media / audio).
