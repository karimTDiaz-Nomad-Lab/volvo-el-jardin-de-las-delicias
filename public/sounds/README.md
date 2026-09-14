# UI SFX assets

Short UI sound effects for virtualFit.

**Pack:** [SND01 — Sine](https://snd.dev) by Yasuhiro Tsuchiya ([SND Terms of Use](https://snd.dev)).

## Wired in app (KEEP)

| File | Consumer |
|------|----------|
| `SND01_sine/tap_01.wav` | `hooks/useUiSfx.ts` → `tap` |
| `SND01_sine/select.wav` | `useUiSfx` → `select`, `cta` |
| `SND01_sine/celebration.wav` | `useUiSfx` → `success` |
| `SND01_sine/caution.wav` | `useUiSfx` → `error` |
| `SND01_sine/transition_up.wav` | `useUiSfx` → `transitionOpen` |
| `SND01_sine/transition_down.wav` | `useUiSfx` → `transitionClose` |
| `SND01_sine/swipe.wav` | `lib/sfx.ts` → shutter |
| `audio-track.mp3` | `lib/backgroundAudio.ts` |
| `_silent.mp3` | `lib/sfx.ts` → autoplay unlock |

## Reserved, not wired (KEEP in repo)

These files stay in `SND01_sine/` for future UX (random tap/swipe variants, toggles, typing, loops). Do not delete without product sign-off.

`button.wav`, `disabled.wav`, `notification.wav`, `progress_loop.wav`, `ringtone_loop.wav`, `swipe_01`–`swipe_05`, `tap_02`–`tap_05`, `toggle_off.wav`, `toggle_on.wav`, `type_01`–`type_05`

Per [snd.dev](https://snd.dev): use **Tap** variants for high-frequency taps; **Swipe** for pager moves; avoid looping **Progress** on long tasks.

## Removed legacy (2026-05-27)

Kenney-style placeholders with no runtime references: `tap.mp3`, `cta.mp3`, `shutter.mp3`, `success.mp3`, `error.mp3`, `ui-sprite.mp3`.

## Kiosk unlock

`lib/sfx.ts` plays `_silent.mp3` at volume 0 after the first gesture for autoplay policies.
