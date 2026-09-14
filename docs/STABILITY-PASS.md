# Stability Pass — Bug Inventory & Fix Plan

> **Historical document** — snapshot from **2026-05-13**. Paths refer to pre-`src/` layout (`components/`, `hooks/`).  
> Do **not** treat file/line references as current. For today’s structure see [ARCHITECTURE.md](./ARCHITECTURE.md) and [PROJECT.md](./PROJECT.md).

> **Date**: 2026-05-13  
> **Objective**: Fix all layout, sizing, and stability issues in one clean pass. No scope creep.

---

## Bugs Found

### BUG-1: Canvas image container has conflicting width classes (CRITICAL)

**File**: `components/Canvas.tsx` line 29  
**Symptom**: After garment swap, the generated image appears off-center or incorrectly sized. The Gemini API can return images at different aspect ratios than 3:4 — the container must handle this gracefully.

**Root cause**: The image container div has conflicting Tailwind classes:

```
class="relative w-full h-full flex items-center justify-center max-h-full w-auto aspect-[3/4] ..."
```

- `w-full` and `w-auto` are both present — `w-auto` wins (later in string) but fights with `h-full` + `aspect-[3/4]`. On tall viewports the container grows to full height, the aspect ratio then forces a width wider than the available space, and the image clips or overflows.
- The `<img>` uses `object-cover` which crops the image to fill the container, but Gemini images may not always be exactly 3:4 — this means the edges get cut off.

**Fix**: Use `object-contain` on the image so it always fits fully visible. Constrain the container with `max-h-full max-w-full` and let the aspect ratio hint come from the image itself, not a forced container ratio.

### BUG-2: Outer canvas wrapper doubles padding and flex centering

**File**: `components/Canvas.tsx` line 19  
**Detail**: The canvas wrapper has `p-4` and the parent in `App.tsx` line 151 also has `p-3 sm:p-4`. This double-padding wastes space, especially on smaller screens.

**Fix**: Remove padding from the Canvas wrapper — let App.tsx own the spacing.

### BUG-3: Footer gets pushed off-screen when main content uses flex-1

**File**: `App.tsx` lines 141-196  
**Detail**: The `motion.div[key=main-app]` has `flex-1` which fills remaining space. If the `<main>` inside also uses `flex-1`, the footer gets pushed past the viewport bottom.

**Fix**: The footer is outside the AnimatePresence/motion container. The outer shell `div` uses `min-h-screen flex flex-col`. On the start screen view the `motion.div` takes `h-screen`, which already overshoots. The Footer then sits below the fold. Fix by ensuring the start-screen wrapper doesn't exceed `100vh` with the footer accounted for.

### BUG-4: Start screen takes full `h-screen`, Footer sits below fold

**File**: `App.tsx` line 131  
**Detail**: `w-screen h-screen` on the start screen wrapper means the footer is always invisible on the landing page (requires scrolling).

**Fix**: Change to `flex-1` so it shares the column with the footer.

### BUG-5: `isOnDressingScreen` prop unused in Footer

**File**: `components/Footer.tsx` line 11  
**Detail**: The `FooterProps` interface declares `isOnDressingScreen?` but the component never reads it. Dead prop.

**Fix**: Remove the prop from interface and call site.

### BUG-6: OutfitStack has a redundant `<h2>` heading inside a parent `<h3>` context

**File**: `components/OutfitStack.tsx` line 18, `App.tsx` line 174  
**Detail**: App.tsx already renders `<h3>Your outfit</h3>` before OutfitStack. Then OutfitStack internally renders its own `<h2>Your outfit</h2>`. This creates a double heading and breaks heading hierarchy.

**Fix**: Remove the internal `<h2>` from OutfitStack — the parent owns the section heading.

### BUG-7: No empty-state for garment swap errors — error only shown in sidebar

**File**: `App.tsx` line 164  
**Detail**: If garment generation fails, the error only appears in the sidebar panel. On narrow screens the sidebar may not be fully visible. The Canvas should also indicate something went wrong (instead of just staying on the old image silently).

**Fix**: Pass error state to Canvas so it can show a subtle inline indicator.

---

## Stability Improvements (non-bug)

### STAB-1: Wardrobe items reuse same 2 image URLs across all products

**File**: `config/wardrobe.ts`  
**Detail**: Every item alternates between just 2 URLs (`gemini-sweat-2.png` and `Gemini-tee.png`). This means items like "Matchday Shorts" or "Compression Leggings" show a sweatshirt image — confusing UX.

**Fix**: Not a code fix — flag for product owner to supply real garment images. No code change needed now.

### STAB-2: PROJECT.md references stale Gemini config

**File**: `PROJECT.md` lines 106-111  
**Detail**: Still says model is `gemini-3.1-flash-image-preview` with `imageConfig` and `thinkingConfig`. This was reverted in the speed fix.

**Fix**: Update PROJECT.md to match current `geminiService.ts`.

---

## Fix Execution Order

1. **Canvas image sizing** (BUG-1 + BUG-2) — most visible user issue
2. **Heading duplication** (BUG-6) — quick semantic fix
3. **Footer visibility** (BUG-3 + BUG-4) — layout correctness
4. **Dead props** (BUG-5) — cleanup
5. **Error passthrough to Canvas** (BUG-7) — resilience
6. **Update PROJECT.md** (STAB-2) — keep docs accurate
