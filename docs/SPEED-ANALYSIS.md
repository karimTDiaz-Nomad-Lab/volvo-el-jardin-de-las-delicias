# VirtualFit — Speed & Generation Analysis

> **Date**: 2026-05-13  
> **Scope**: Full operational comparison between the **original project** (`/Downloads/original/`) and the **current codebase** after edits.  
> **Goal**: Identify every factor contributing to slower image generation and provide a concrete fix plan.

---

## TL;DR — Root Cause

**The #1 reason generation is slower is the model change.** I switched from `gemini-2.5-flash-image` to `gemini-3.1-flash-image-preview`. This is a **confirmed known bug** — the 3.1 Flash model is *significantly* slower than both the original 2.5 Flash and even the 3.0 Pro model. Google acknowledged and reproduced the issue on May 7, 2026 ([googleapis/js-genai#1544](https://github.com/googleapis/js-genai/issues/1544)).

Every other change I made is either neutral or adds only milliseconds of overhead. The model switch is the bottleneck.

---

## Side-by-Side Comparison

| Factor | Original | Current | Impact on Speed |
|---|---|---|---|
| **Gemini model** | `gemini-2.5-flash-image` | `gemini-3.1-flash-image-preview` | **CRITICAL — this is the problem** |
| **imageConfig** | *not set* (server defaults) | `{ aspectRatio: '3:4', imageSize: '1K' }` | Minor — 1K is the default anyway; aspect ratio adds negligible overhead |
| **thinkingConfig** | *not set* (server default) | `{ thinkingLevel: ThinkingLevel.MINIMAL }` | Neutral/slightly positive — meant to reduce latency |
| **safetySettings** | *not set* (server defaults) | 4 categories set to `BLOCK_ONLY_HIGH` | Neutral — looser safety = fewer rejections, no added latency |
| **Prompt (model prep)** | 62 words, detailed photographer instructions | 42 words, concise sports-focused | Neutral/slightly faster — shorter prompt |
| **Prompt (try-on)** | 119 words, numbered rules | 69 words, narrative style | Neutral/slightly faster — shorter prompt |
| **SDK version** | `@google/genai@^1.10.0` | `@google/genai@^1.10.0` | Identical |
| **API call pattern** | Single `generateContent` call | Single `generateContent` call | Identical |
| **Request de-dupe locks** | None | `useRef` flight locks | Neutral — prevents wasted duplicate calls |
| **Auto-advance after model gen** | Manual "Enter Mirror" button | Auto `onModelFinalized(result)` | Neutral — happens after API returns |
| **Pose generation calls** | Present (extra API calls possible) | Removed | Positive — fewer API calls total |

---

## Detailed Breakdown

### 1. Model Change — THE Root Cause

```
ORIGINAL:  const model = 'gemini-2.5-flash-image';
CURRENT:   const model = 'gemini-3.1-flash-image-preview';
```

**Why I changed it**: During the Gemini API alignment phase, I recommended `gemini-3.1-flash-image-preview` as the "current recommended model" for reliability and future-proofing, since `gemini-2.5-flash-image` is scheduled for deprecation on October 2, 2026.

**What actually happened**: The 3.1 Flash Image Preview model has a **confirmed latency bug**. Users report generation times *multiple times longer* than the 2.5 Flash model, even with identical payloads. Google's SDK team reproduced this and filed an internal bug on May 7, 2026 ([source](https://github.com/googleapis/js-genai/issues/1544)).

**Bottom line**: The 2.5 Flash model is still live, still fast, and won't be deprecated until October 2026. There is zero reason to use the slower model right now.

### 2. imageConfig — Minimal Impact

```
ORIGINAL:  config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
CURRENT:   config: { responseModalities: [...], imageConfig: { aspectRatio: '3:4', imageSize: '1K' } }
```

- `imageSize: '1K'` — this is the default output size. Explicitly setting it changes nothing.
- `aspectRatio: '3:4'` — tells the model the desired output shape. On `gemini-2.5-flash-image` this has negligible latency impact.
- **However**, on `gemini-3.1-flash-image-preview`, there's a known bug where `imageSize` is *ignored entirely* ([googleapis/js-genai#1461](https://github.com/googleapis/js-genai/issues/1461)). The parameter does nothing but the model still processes it, potentially adding overhead.

### 3. thinkingConfig — Neutral/Positive

```
CURRENT:   thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
```

This tells the model to use minimal "chain of thought" reasoning before generating the image. If anything, this should *reduce* latency by skipping deeper reasoning. On the 2.5 Flash model, this param may be ignored (it was introduced with 3.x models). Removing it won't hurt.

### 4. safetySettings — Neutral

Setting `BLOCK_ONLY_HIGH` is less restrictive than defaults, meaning *fewer* requests get blocked. This doesn't affect generation speed at all.

### 5. Prompts — Neutral/Slightly Faster

The current prompts are actually **shorter and more concise** than the originals. Prompt length has a minor effect on latency (fewer tokens to process), so if anything, the new prompts are marginally faster.

### 6. Flow Logic — No Speed Impact

| Change | Effect |
|---|---|
| `useRef` flight locks | Prevents double API calls — saves time, doesn't add it |
| Auto-advance (no "Enter Mirror" button) | Post-API-response UX change — zero API impact |
| Removed pose generation | *Eliminates* a potential extra API call — net positive |
| Simplified `OutfitLayer.imageUrl` (removed `poseImages` map) | Memory/simplicity improvement — zero API impact |

---

## Fix Plan

### Immediate Fix (restores original speed)

**Revert the model to `gemini-2.5-flash-image`**. This is the only change that matters.

```typescript
// CHANGE THIS:
const model = 'gemini-3.1-flash-image-preview';

// BACK TO:
const model = 'gemini-2.5-flash-image';
```

### Recommended Config After Revert

Keep the `generationConfig` object but simplified — the `imageConfig` and `thinkingConfig` were designed for 3.x models and may be ignored by 2.5 Flash. Safest approach:

```typescript
const model = 'gemini-2.5-flash-image';

// 2.5 Flash only needs responseModalities and safety settings.
// imageConfig/thinkingConfig are 3.x features — remove to avoid unexpected behavior.
const generationConfig: GenerateContentConfig = {
    responseModalities: [Modality.IMAGE, Modality.TEXT],
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
};
```

### Future-Proofing

When Google fixes the 3.1 Flash latency bug (tracked in the internal bug filed May 7, 2026), we can migrate back. Monitor [googleapis/js-genai#1544](https://github.com/googleapis/js-genai/issues/1544) for updates. The deprecation deadline for 2.5 Flash is **October 2, 2026** — plenty of runway.

---

## What My Edits Did NOT Break

For the record, these changes are all **net positive or neutral** and should be kept:

- Request de-dupe locks (prevents wasted API calls)
- Removal of pose generation (fewer API calls overall)
- Simplified `OutfitLayer` type (cleaner state)
- Auto-advance on model generation (faster UX feel)
- Shorter, focused prompts (marginally less token processing)
- Safety settings at `BLOCK_ONLY_HIGH` (fewer false rejections)
- `hasError` display logic (fixed the UI flicker bug)

---

## Summary

| Action | Priority | Effort |
|---|---|---|
| Revert model to `gemini-2.5-flash-image` | **P0 — do now** | 1 line |
| Remove `imageConfig` and `thinkingConfig` from generationConfig | P1 — clean up | 5 lines |
| Keep safety settings, flight locks, and UX improvements | N/A — already done | 0 |
| Monitor googleapis/js-genai#1544 for 3.1 Flash fix | P3 — future | Ongoing |
