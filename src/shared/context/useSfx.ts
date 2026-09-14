/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useContext } from 'react';

export type SfxState = {
  /** Background music off — does not mute UI / interaction SFX. */
  musicMuted: boolean;
  toggleMusicMuted: () => void;
  setMusicMuted: (muted: boolean) => void;
  prefersReducedMotion: boolean;
  audioUnlocked: boolean;
  unlock: () => void;
};

export const SfxContext = createContext<SfxState | null>(null);

export function useSfx(): SfxState {
  const ctx = useContext(SfxContext);
  if (!ctx) {
    throw new Error('useSfx must be used within SfxProvider');
  }
  return ctx;
}
