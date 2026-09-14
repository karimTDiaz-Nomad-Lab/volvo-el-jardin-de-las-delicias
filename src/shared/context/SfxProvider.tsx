/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getManifest } from '@config';
import { startBackgroundMusic, stopBackgroundMusic } from '@/shared/lib/backgroundAudio';
import { getPrefersReducedMotion, getStoredSfxMuted, setStoredSfxMuted, unlockAudio } from '@/shared/lib/sfx';
import { SfxContext, type SfxState } from './useSfx';

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const backgroundAudioEnabled = getManifest().features.backgroundAudio === true;
  const [musicMuted, setMusicMutedState] = useState<boolean>(() =>
    backgroundAudioEnabled ? getStoredSfxMuted() : true,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => getPrefersReducedMotion());
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const setMusicMuted = useCallback((next: boolean) => {
    setMusicMutedState(next);
    if (backgroundAudioEnabled) setStoredSfxMuted(next);
  }, [backgroundAudioEnabled]);

  const toggleMusicMuted = useCallback(() => {
    setMusicMuted(!musicMuted);
  }, [musicMuted, setMusicMuted]);

  const unlock = useCallback(() => {
    if (!backgroundAudioEnabled) return;
    void unlockAudio().then((ok) => {
      if (ok) setAudioUnlocked(true);
    });
  }, [backgroundAudioEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!backgroundAudioEnabled || typeof window === 'undefined') return;
    const onFirstGesture = () => unlock();
    window.addEventListener('pointerdown', onFirstGesture, { passive: true, once: true });
    window.addEventListener('keydown', onFirstGesture, { passive: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, [backgroundAudioEnabled, unlock]);

  useEffect(() => {
    if (!backgroundAudioEnabled || !audioUnlocked || prefersReducedMotion || musicMuted) {
      stopBackgroundMusic();
      return;
    }
    startBackgroundMusic();
    return () => {
      stopBackgroundMusic();
    };
  }, [backgroundAudioEnabled, audioUnlocked, prefersReducedMotion, musicMuted]);

  const value = useMemo<SfxState>(
    () => ({
      musicMuted,
      toggleMusicMuted,
      setMusicMuted,
      prefersReducedMotion,
      audioUnlocked,
      unlock,
    }),
    [musicMuted, toggleMusicMuted, setMusicMuted, prefersReducedMotion, audioUnlocked, unlock]
  );

  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}
