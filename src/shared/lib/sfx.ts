/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Howl, Howler } from 'howler';

/** Persists background-music mute; same key as before (value = music off). */
export const SFX_MUTE_STORAGE_KEY = 'virtualfit:sfxMuted';

let hasUnlockedAudio = false;

export function getStoredSfxMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SFX_MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredSfxMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SFX_MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {
    // Ignore storage failures (kiosk modes / privacy).
  }
}

export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Attempt to unlock audio playback on iOS/Safari kiosks.
 * Safe to call repeatedly; only does work once.
 */
export async function unlockAudio(): Promise<boolean> {
  if (hasUnlockedAudio) return true;
  if (typeof window === 'undefined') return false;

  try {
    const ctx = Howler.ctx;
    if (ctx?.state === 'suspended') {
      await ctx.resume();
    }

    // "Silent" short sound to satisfy certain mobile gesture policies.
    const unlocker = new Howl({
      src: ['/sounds/_silent.mp3'],
      volume: 0,
      preload: true,
    });

    const id = unlocker.play();
    unlocker.stop(id);
    unlocker.unload();

    hasUnlockedAudio = true;
    return true;
  } catch {
    return false;
  }
}

export function hasAudioUnlocked(): boolean {
  return hasUnlockedAudio;
}

/** Shutter / capture decisive cue — singleton so capture SFX is not cut off mid-flash. */
export const SHUTTER_SRC = '/sounds/SND01_sine/swipe.wav';

let shutterHowl: Howl | null = null;

export function shutterVolume(baseVolume = 0.38): number {
  return baseVolume * 1.05;
}

export type PlayShutterSfxOptions = {
  muted?: boolean;
  /** Master UI volume before shutter boost (same as `useUiSfx` config.volume). */
  baseVolume?: number;
};

/** Physical capture only — preview confirm uses `tap` via `useUiSfx`. */
export function playShutterSfx(options: PlayShutterSfxOptions = {}): void {
  if (options.muted) return;
  if (typeof window === 'undefined') return;

  const vol = shutterVolume(options.baseVolume ?? 0.38);

  if (!shutterHowl) {
    shutterHowl = new Howl({
      src: [SHUTTER_SRC],
      volume: vol,
      preload: true,
    });
  } else {
    shutterHowl.volume(vol);
  }

  shutterHowl.stop();
  shutterHowl.play();
}

