/**
 * Shared Framer Motion presets for full-screen flow transitions.
 */

export const screenEase = [0.22, 1, 0.36, 1] as const;

export const screenTransition = {
  duration: 0.45,
  ease: screenEase,
} as const;

export const screenVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

/** Generating mirror — no enter fade so sponsor dock is visible from frame 0. */
export const generatingScreenVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: screenVariants.exit,
};

export const generatingScreenTransition = {
  duration: 0.35,
  ease: screenEase,
} as const;

export const viewportFadeTransition = {
  duration: 0.45,
  ease: screenEase,
} as const;

export const webcamRevealTransition = {
  duration: 0.5,
  ease: screenEase,
} as const;
