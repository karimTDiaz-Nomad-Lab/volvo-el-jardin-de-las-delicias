import { getDefaultDisplayMode } from '@config';
import type { DisplayMode } from '@config/types';

export type { DisplayMode };

export const DISPLAY_STORAGE_KEY = 'vf-display';

export function isDisplayMode(value: string | null | undefined): value is DisplayMode {
  return value === 'mupi' || value === 'desktop';
}

/** Env → localStorage → manifest default. */
export function getPreferredDisplayMode(): DisplayMode {
  const fromEnv = import.meta.env.VITE_DISPLAY?.trim();
  if (isDisplayMode(fromEnv)) return fromEnv;

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(DISPLAY_STORAGE_KEY);
    if (isDisplayMode(stored)) return stored;
  }

  return getDefaultDisplayMode();
}

export function applyDisplayMode(mode: DisplayMode): void {
  document.documentElement.dataset.display = mode;
  window.localStorage.setItem(DISPLAY_STORAGE_KEY, mode);
}
