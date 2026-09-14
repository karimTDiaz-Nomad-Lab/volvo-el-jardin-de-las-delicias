/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useMemo } from 'react';
import useSound from 'use-sound';
import { useSfx } from '@/shared/context/useSfx';
import { playShutterSfx } from '@/shared/lib/sfx';

/** Primary CTA — select / affirmative action (`select.wav`). */
const CTA_SOURCE = '/sounds/SND01_sine/select.wav';

export type UiSfxKey =
  | 'tap'
  | 'cta'
  | 'shutter'
  | 'select'
  | 'success'
  | 'error'
  | 'transitionOpen'
  | 'transitionClose';

export type TransitionKind = 'open' | 'close';

type UiSfxConfig = {
  volume?: number;
};

/**
 * SND01 (sine) — https://snd.dev
 * Taxonomy: shutter = capture only; tap = light UI touch (+ confirm photo);
 * select = secondary affirm; cta/success/error/transitions per public/sounds/README.md.
 */
const UI_SFX_SOURCES: Record<UiSfxKey, string[]> = {
  tap: ['/sounds/SND01_sine/tap_01.wav'],
  cta: [CTA_SOURCE],
  /** Physical capture only — singleton `playShutterSfx` in lib/sfx.ts. */
  shutter: [],
  select: ['/sounds/SND01_sine/select.wav'],
  success: ['/sounds/SND01_sine/celebration.wav'],
  error: ['/sounds/SND01_sine/caution.wav'],
  transitionOpen: ['/sounds/SND01_sine/transition_up.wav'],
  transitionClose: ['/sounds/SND01_sine/transition_down.wav'],
};

export type UiSfxApi = {
  enabled: boolean;
  play: (key: UiSfxKey) => void;
  playTransition: (kind: TransitionKind) => void;
  /** Unlock audio (kiosk) + `tap` — fitting rails, chips, retake, confirm photo. */
  playUiTap: () => void;
  /** @deprecated Prefer `playUiTap` — same behavior. */
  onTapClick: () => void;
  /** Unlock audio + `select` — secondary affirmatives (reset, retry, dismiss). */
  onCtaClick: () => void;
};

export function useUiSfx(config: UiSfxConfig = {}): UiSfxApi {
  const { prefersReducedMotion, unlock } = useSfx();
  const volume = config.volume ?? 0.38;
  const enabled = !prefersReducedMotion;

  const [playTap] = useSound(UI_SFX_SOURCES.tap, { volume, soundEnabled: enabled });
  const [playCta] = useSound(UI_SFX_SOURCES.cta, {
    volume: Math.min(volume * 1.1, 0.45),
    soundEnabled: enabled,
  });
  const [playSelect] = useSound(UI_SFX_SOURCES.select, { volume, soundEnabled: enabled });
  const playShutter = useCallback(() => {
    playShutterSfx({ muted: !enabled, baseVolume: volume });
  }, [enabled, volume]);
  const [playSuccess] = useSound(UI_SFX_SOURCES.success, {
    volume: volume * 0.85,
    soundEnabled: enabled,
  });
  const [playError] = useSound(UI_SFX_SOURCES.error, { volume, soundEnabled: enabled });
  const [playTransitionOpen] = useSound(UI_SFX_SOURCES.transitionOpen, {
    volume: volume * 0.92,
    soundEnabled: enabled,
  });
  const [playTransitionClose] = useSound(UI_SFX_SOURCES.transitionClose, {
    volume: volume * 0.92,
    soundEnabled: enabled,
  });

  const playMap = useMemo(
    () =>
      ({
        tap: playTap,
        cta: playCta,
        shutter: playShutter,
        select: playSelect,
        success: playSuccess,
        error: playError,
        transitionOpen: playTransitionOpen,
        transitionClose: playTransitionClose,
      }) satisfies Record<UiSfxKey, () => void>,
    [
      playTap,
      playCta,
      playShutter,
      playSelect,
      playSuccess,
      playError,
      playTransitionOpen,
      playTransitionClose,
    ]
  );

  const play = useCallback(
    (key: UiSfxKey) => {
      if (!enabled) return;
      playMap[key]();
    },
    [enabled, playMap]
  );

  const playTransition = useCallback(
    (kind: TransitionKind) => {
      play(kind === 'open' ? 'transitionOpen' : 'transitionClose');
    },
    [play]
  );

  const playUiTap = useCallback(() => {
    unlock();
    play('tap');
  }, [unlock, play]);

  const onCtaClick = useCallback(() => {
    unlock();
    play('select');
  }, [unlock, play]);

  return { enabled, play, playTransition, playUiTap, onTapClick: playUiTap, onCtaClick };
}
