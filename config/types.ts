/**
 * Photo booth manifest — Volvo El jardín de las delicias.
 */

export type DisplayMode = 'mupi' | 'desktop';

export type PlatformTheme = 'default' | 'dark' | 'volvo';

export type NatureId =
  | 'responsable'
  | 'eficiente'
  | 'cuidadosa'
  | 'respetuosa'
  | 'consciente';

export interface NatureStyleRefs {
  /** Campaign look for a single person. */
  individual: string;
  /** Campaign look for 2–4 people. Omit when only an individual look exists. */
  group?: string;
}

export interface NatureTheme {
  id: NatureId;
  title: string;
  tagline: string;
  thumbSrc: string;
  prompt: string;
  styleRefs: NatureStyleRefs;
  /** Overlay copy on the finished 4×6 portrait. */
  overlayInk: 'black' | 'white';
}

export interface PlatformFeatures {
  kioskIdle: boolean;
  /** Background music. Off unless explicitly enabled. */
  backgroundAudio?: boolean;
}

export interface PlatformBrand {
  productName: string;
  logoSrc: string;
  /** White Volvo wordmark for dark / light-on-photo overlays. */
  logoOnDarkSrc: string;
  logoAlt: string;
  /** Full-bleed plate behind journey screens. */
  selectBackgroundSrc: string;
}

export interface PlatformDisplay {
  defaultMode: DisplayMode;
}

export interface PlatformCopy {
  brand: {
    collection: string;
    cardEyebrow: string;
    cardFooter: string;
  };
  landing: {
    title: string;
    ctaLabel: string;
  };
  select: {
    title: string;
  };
  prepare: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    hints?: string[];
  };
  capture: {
    hint: string;
    closeAria: string;
    captureAria: string;
    confirmPrompt: string;
    confirm: string;
    retake: string;
    retry: string;
    timerOff: string;
  };
  generating: {
    statusLines: string[];
    eyebrow: string;
    eyebrowError: string;
    title: string;
    titleError: string;
    subtitle: string;
    printing: string;
    retryLabel: string;
  };
  result: {
    againLabel: string;
    recaptureLabel: string;
    qrHint: string;
    qrAria: string;
  };
  captureQuality: {
    darkWarn: string;
    blurWarn: string;
    continueLabel: string;
    recaptureLabel: string;
  };
}

export interface PlatformManifest {
  clientId: string;
  theme: PlatformTheme;
  features: PlatformFeatures;
  brand: PlatformBrand;
  display: PlatformDisplay;
  natures: NatureTheme[];
  copy: PlatformCopy;
}
