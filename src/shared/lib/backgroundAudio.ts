/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Howl } from 'howler';

export const BG_MUSIC_SRC = '/sounds/audio-track.mp3';

/** Constant session background volume — 30%. */
export const BG_MUSIC_VOLUME = 0.3;

let bgMusicHowl: Howl | null = null;
let bgMusicUnavailable = false;

export function startBackgroundMusic(): void {
  if (typeof window === 'undefined' || bgMusicUnavailable) return;

  if (!bgMusicHowl) {
    bgMusicHowl = new Howl({
      src: [BG_MUSIC_SRC],
      volume: BG_MUSIC_VOLUME,
      loop: true,
      preload: true,
      html5: true,
      onloaderror: () => {
        bgMusicUnavailable = true;
        bgMusicHowl?.unload();
        bgMusicHowl = null;
      },
      onplayerror: () => {
        bgMusicHowl?.once('unlock', () => {
          bgMusicHowl?.play();
        });
      },
    });
  }

  if (!bgMusicHowl.playing()) {
    bgMusicHowl.play();
  }
}

export function stopBackgroundMusic(): void {
  bgMusicHowl?.stop();
}
