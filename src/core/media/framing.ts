/**
 * Deterministic portrait framing utilities used before and after generation.
 * Session FramingProfile locks crop/scale so subject placement stays stable
 * across compose iterations instead of re-inferring from each Gemini output.
 */

const DEFAULT_FRAME_ASPECT_RATIO = 4 / 5; // Volvo editorial portrait (width / height).
/**
 * Subject occupancy targets are PROMPT parameters: they feed
 * buildLockedFramingPromptSuffix so Gemini renders the person at ~60% of the
 * photo height surrounded by studio background. The canvas itself stays
 * full-bleed cover — the generated photo always fills the frame.
 */
const DEFAULT_SUBJECT_HEIGHT_TARGET = 0.6;
const DEFAULT_SUBJECT_TOP_MARGIN_TARGET = 0.1;
const DEFAULT_MAX_OUTPUT_WIDTH = 1536;
const DEFAULT_MAX_OUTPUT_HEIGHT = 2048;
const DEFAULT_JPEG_QUALITY = 0.9;
const DEFAULT_BACKGROUND_COLOR = '#f5f5f7';
const EPSILON = 0.0001;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const parsePositiveNumber = (
  value: string | undefined,
  fallback: number,
  { min, max }: { min: number; max: number }
): number => {
  if (!value) return fallback;
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
};

const parseAspectRatio = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const trimmed = value.trim();
  const separator = trimmed.includes(':') ? ':' : trimmed.includes('/') ? '/' : null;
  if (separator) {
    const [widthToken, heightToken] = trimmed.split(separator);
    const width = Number(widthToken);
    const height = Number(heightToken);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return width / height;
    }
    return fallback;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const roundEven = (value: number): number => {
  const rounded = Math.max(2, Math.round(value));
  return rounded % 2 === 0 ? rounded : rounded + 1;
};

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not decode image for framing normalization.'));
    image.src = dataUrl;
  });

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unexpected FileReader result while loading portrait.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read portrait file.'));
    reader.readAsDataURL(file);
  });

const canvasToDataUrl = (canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<string> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed during framing normalization.'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result !== 'string') {
            reject(new Error('Unexpected FileReader result after framing normalization.'));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('FileReader failed after framing normalization.'));
        reader.readAsDataURL(blob);
      },
      mimeType,
      quality
    );
  });

export const FRAME_ASPECT_RATIO = parseAspectRatio(
  import.meta.env.VITE_FRAME_ASPECT_RATIO,
  DEFAULT_FRAME_ASPECT_RATIO
);

export const SUBJECT_HEIGHT_TARGET = parsePositiveNumber(
  import.meta.env.VITE_SUBJECT_HEIGHT_TARGET,
  DEFAULT_SUBJECT_HEIGHT_TARGET,
  { min: 0.5, max: 0.95 }
);

export const SUBJECT_TOP_MARGIN_TARGET = parsePositiveNumber(
  import.meta.env.VITE_SUBJECT_TOP_MARGIN_TARGET,
  DEFAULT_SUBJECT_TOP_MARGIN_TARGET,
  { min: 0, max: 0.25 }
);

/**
 * Gemini accepts ratio tokens like 3:4 or 9:16. Keep deterministic default
 * and only switch when env maps cleanly to known camera-safe portrait ratios.
 */
export const GEMINI_FRAME_ASPECT_RATIO = (() => {
  const ratio = FRAME_ASPECT_RATIO;
  if (Math.abs(ratio - 4 / 5) < 0.01) return '4:5';
  if (Math.abs(ratio - 3 / 4) < 0.01) return '3:4';
  if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16';
  if (Math.abs(ratio - 2 / 3) < 0.01) return '2:3';
  return '4:5';
})();

export interface FramingOptions {
  frameAspectRatio?: number;
  subjectHeightTarget?: number;
  subjectTopMarginTarget?: number;
  maxOutputWidth?: number;
  maxOutputHeight?: number;
  mimeType?: string;
  quality?: number;
  backgroundColor?: string;
}

/**
 * Optical / eyewear bust lock — single source of truth for prompt strings and
 * session FramingProfile occupancy targets (prompt-only; canvas stays full-bleed).
 *
 * Landmark fractions are of frame height, top → bottom:
 *   headroom → eyes (upper third) → chin (mid / start of lower third) → shoulders
 */
export const FACE_SUBJECT_HEIGHT_TARGET = 0.84;
export const FACE_SUBJECT_TOP_MARGIN_TARGET = 0.07;
/** Eyes sit on the classic upper-third line. */
export const FACE_EYES_FROM_TOP = 0.33;
/** Chin near mid-frame / start of lower third for a lookbook bust. */
export const FACE_CHIN_FROM_TOP = 0.55;

export const FACE_FRAMING_OPTIONS: FramingOptions = {
  subjectHeightTarget: FACE_SUBJECT_HEIGHT_TARGET,
  subjectTopMarginTarget: FACE_SUBJECT_TOP_MARGIN_TARGET,
};

const pct = (fraction: number): number => Math.round(fraction * 100);

/**
 * Quantitative frontal bust rules shared by model-image + compose lock prompts
 * so Gemini places head/shoulders the same way regardless of capture crop.
 */
export const formatFaceBustFramingLock = (
  subjectHeightTarget: number = FACE_SUBJECT_HEIGHT_TARGET,
  subjectTopMarginTarget: number = FACE_SUBJECT_TOP_MARGIN_TARGET,
): string => {
  const headroomPct = pct(subjectTopMarginTarget);
  const subjectPct = pct(subjectHeightTarget);
  const shouldersPct = pct(
    clamp(subjectTopMarginTarget + subjectHeightTarget, 0.85, 0.96),
  );
  const eyesPct = pct(FACE_EYES_FROM_TOP);
  const chinPct = pct(FACE_CHIN_FROM_TOP);
  return (
    `Quantitative bust lock (frame height %): top of head ~${headroomPct}% from top; ` +
    `eyes near upper-third (~${eyesPct}%); chin around mid-lower third (~${chinPct}%); ` +
    `shoulders near bottom edge (~${shouldersPct}%); ` +
    `head and shoulders occupy ~${subjectPct}% of frame height with ~${headroomPct}% headroom. ` +
    `Forbid a floating head with empty chest below the shoulders, and forbid cropping through the forehead or hairline. ` +
    `Ignore how tight or loose the input photo was — always recompose to this same frontal optical lookbook bust.`
  );
};

/** Locked session anchor — same rect on every generation in a studio session. */
export interface FramingProfile {
  frameWidth: number;
  frameHeight: number;
  /** Pixel rect where subject content is placed on the session canvas. */
  subjectRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameAspectRatio: number;
  subjectHeightTarget: number;
  subjectTopMarginTarget: number;
  backgroundColor: string;
  mimeType: string;
  quality: number;
}

export interface FramingResult {
  dataUrl: string;
  profile: FramingProfile;
}

const resolveTargetSize = (
  frameAspectRatio: number,
  maxOutputWidth: number,
  maxOutputHeight: number
): { width: number; height: number } => {
  if (frameAspectRatio <= 1) {
    const height = roundEven(maxOutputHeight);
    const width = roundEven(height * frameAspectRatio);
    if (width <= maxOutputWidth) return { width, height };
    const adjustedWidth = roundEven(maxOutputWidth);
    return { width: adjustedWidth, height: roundEven(adjustedWidth / frameAspectRatio) };
  }
  const width = roundEven(maxOutputWidth);
  const height = roundEven(width / frameAspectRatio);
  if (height <= maxOutputHeight) return { width, height };
  const adjustedHeight = roundEven(maxOutputHeight);
  return { width: roundEven(adjustedHeight * frameAspectRatio), height: adjustedHeight };
};

const resolveFramingParams = (options: FramingOptions = {}) => {
  const frameAspectRatio = options.frameAspectRatio ?? FRAME_ASPECT_RATIO;
  const subjectHeightTarget = clamp(
    options.subjectHeightTarget ?? SUBJECT_HEIGHT_TARGET,
    0.5,
    0.95
  );
  const subjectTopMarginTarget = clamp(
    options.subjectTopMarginTarget ?? SUBJECT_TOP_MARGIN_TARGET,
    0,
    0.25
  );
  const maxOutputWidth = Math.max(128, Math.round(options.maxOutputWidth ?? DEFAULT_MAX_OUTPUT_WIDTH));
  const maxOutputHeight = Math.max(128, Math.round(options.maxOutputHeight ?? DEFAULT_MAX_OUTPUT_HEIGHT));
  const mimeType = options.mimeType ?? 'image/jpeg';
  const quality = clamp(options.quality ?? DEFAULT_JPEG_QUALITY, 0.7, 1);
  const backgroundColor = options.backgroundColor ?? DEFAULT_BACKGROUND_COLOR;
  const { width: frameWidth, height: frameHeight } = resolveTargetSize(
    frameAspectRatio,
    maxOutputWidth,
    maxOutputHeight
  );

  return {
    frameAspectRatio,
    subjectHeightTarget,
    subjectTopMarginTarget,
    mimeType,
    quality,
    backgroundColor,
    frameWidth,
    frameHeight,
  };
};

/**
 * Bootstrap transform used once to derive the session anchor from the first
 * normalized studio portrait (full image treated as subject box).
 *
 * Canvas placement is always full-bleed cover into the session frame.
 * `subjectHeightTarget` / `subjectTopMarginTarget` are prompt-only signals
 * (see buildLockedFramingPromptSuffix) — using them to shrink subjectRect
 * caused letterbox bands when Gemini drifted aspect between rounds.
 */
export const computeBootstrapSubjectRect = (
  sourceWidth: number,
  sourceHeight: number,
  frameWidth: number,
  frameHeight: number,
  _subjectHeightTarget?: number,
  _subjectTopMarginTarget?: number
): FramingProfile['subjectRect'] => {
  const scale = Math.max(
    EPSILON,
    Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight),
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (frameWidth - width) / 2,
    y: (frameHeight - height) / 2,
    width,
    height,
  };
};

const renderFramedImage = async (
  image: HTMLImageElement,
  profile: FramingProfile
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = profile.frameWidth;
  canvas.height = profile.frameHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas context for framing normalization.');
  }

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error('Invalid source dimensions for framing normalization.');
  }

  ctx.fillStyle = profile.backgroundColor;
  ctx.fillRect(0, 0, profile.frameWidth, profile.frameHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (sourceWidth === profile.frameWidth && sourceHeight === profile.frameHeight) {
    ctx.drawImage(image, 0, 0, sourceWidth, sourceHeight);
    return canvasToDataUrl(canvas, profile.mimeType, profile.quality);
  }

  const { x, y, width, height } = profile.subjectRect;
  // Keep render full-bleed inside the locked slot.
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvasToDataUrl(canvas, profile.mimeType, profile.quality);
};

/**
 * Create the session framing anchor from the first normalized base portrait.
 * Same input dimensions and options always produce the same profile.
 */
export const createFramingProfileFromDataUrl = async (
  dataUrl: string,
  options: FramingOptions = {}
): Promise<FramingResult> => {
  const params = resolveFramingParams(options);
  const image = await loadImage(dataUrl);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error('Invalid source dimensions for framing normalization.');
  }

  const subjectRect = computeBootstrapSubjectRect(
    sourceWidth,
    sourceHeight,
    params.frameWidth,
    params.frameHeight,
    params.subjectHeightTarget,
    params.subjectTopMarginTarget
  );

  const profile: FramingProfile = {
    frameWidth: params.frameWidth,
    frameHeight: params.frameHeight,
    subjectRect,
    frameAspectRatio: params.frameAspectRatio,
    subjectHeightTarget: params.subjectHeightTarget,
    subjectTopMarginTarget: params.subjectTopMarginTarget,
    backgroundColor: params.backgroundColor,
    mimeType: params.mimeType,
    quality: params.quality,
  };

  const normalized = await renderFramedImage(image, profile);
  return { dataUrl: normalized, profile };
};

export interface ApplyFramingOptions {
  /**
   * Anti-ratchet: when the source already matches the locked frame dimensions
   * (i.e. it is a previous round's pipeline output), skip the redundant
   * redraw + JPEG re-encode and return the input untouched.
   */
  skipReencodeIfFrameSized?: boolean;
}

/**
 * Re-apply the locked session profile — never re-infer scale from the source.
 */
export const applyFramingProfileToDataUrl = async (
  dataUrl: string,
  profile: FramingProfile,
  options: ApplyFramingOptions = {}
): Promise<string> => {
  const image = await loadImage(dataUrl);
  if (
    options.skipReencodeIfFrameSized &&
    image.naturalWidth === profile.frameWidth &&
    image.naturalHeight === profile.frameHeight
  ) {
    return dataUrl;
  }
  return renderFramedImage(image, profile);
};

/**
 * Fallback strategy when no robust subject detector exists:
 * - Treat full source as subject box
 * - Deterministic cover fit to keep output edge-to-edge
 * - Stable centering with bounded headroom when available
 */
export const normalizePortraitFramingDataUrl = async (
  dataUrl: string,
  options: FramingOptions = {}
): Promise<string> => {
  const { dataUrl: normalized } = await createFramingProfileFromDataUrl(dataUrl, options);
  return normalized;
};

export const normalizePortraitInputFile = async (
  file: File,
  options: FramingOptions = {}
): Promise<string> => {
  const rawDataUrl = await readFileAsDataUrl(file);
  return normalizePortraitFramingDataUrl(rawDataUrl, options);
};

export const FRAMED_IMAGE_SIZE = (() => {
  const { width, height } = resolveTargetSize(
    FRAME_ASPECT_RATIO,
    DEFAULT_MAX_OUTPUT_WIDTH,
    DEFAULT_MAX_OUTPUT_HEIGHT
  );
  return { width, height } as const;
})();

/**
 * 1280 (not 1024): on a full-body 3:4 shot the face spans few pixels, and
 * gemini editing rounds compound any input softness into visible face blur.
 * 1280 long side gives the face ~25% more linear resolution while the payload
 * stays ~60% smaller than the full 1536x2048 session canvas.
 */
const TRANSPORT_MAX_DIMENSION = 1280;
const TRANSPORT_JPEG_QUALITY = 0.85;

export interface TransportDownscaleOptions {
  maxDimension?: number;
  quality?: number;
  backgroundColor?: string;
}

/**
 * Produce a request-only copy of an image: long side capped (default 1024px),
 * flattened onto a light background, JPEG-encoded. The session/display canvas
 * keeps its full resolution — this only shrinks the Gemini request payload.
 */
export const downscaleDataUrlForTransport = async (
  dataUrl: string,
  options: TransportDownscaleOptions = {}
): Promise<string> => {
  const maxDimension = options.maxDimension ?? TRANSPORT_MAX_DIMENSION;
  const quality = clamp(options.quality ?? TRANSPORT_JPEG_QUALITY, 0.5, 1);
  const backgroundColor = options.backgroundColor ?? DEFAULT_BACKGROUND_COLOR;

  const image = await loadImage(dataUrl);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error('Invalid source dimensions for transport downscale.');
  }

  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  if (scale >= 1 && dataUrl.startsWith('data:image/jpeg')) {
    return dataUrl;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(sourceWidth * scale));
  canvas.height = Math.max(2, Math.round(sourceHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas context for transport downscale.');
  }
  // Flatten possible PNG alpha onto a light studio-like background.
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvasToDataUrl(canvas, 'image/jpeg', quality);
};

export const buildLockedFramingPromptSuffix = (profile: FramingProfile): string => {
  const aspectLabel = GEMINI_FRAME_ASPECT_RATIO;
  const headroomPct = pct(profile.subjectTopMarginTarget);
  const subjectPct = pct(profile.subjectHeightTarget);
  const isFaceBust = profile.subjectHeightTarget >= 0.75;
  const shotLock = isFaceBust
    ? 'Keep a tight head-and-shoulders bust only — never zoom out to waist, hips, or full body. ' +
      `${formatFaceBustFramingLock(profile.subjectHeightTarget, profile.subjectTopMarginTarget)} `
    : '';
  return (
    `Locked studio framing: ${profile.frameWidth}x${profile.frameHeight}px canvas, ` +
    `${aspectLabel} aspect ratio, subject occupies ~${subjectPct}% of frame height with ~${headroomPct}% top headroom, ` +
    `centered horizontally, eye-level camera, frontal facing. ${shotLock}` +
    `Do not zoom in, zoom out, crop tighter, reframe, change aspect ratio, or alter camera distance. ` +
    `Keep identical figure scale, head size, and vertical placement as the reference image — edge-to-edge, no matte bands.`
  );
};

/**
 * Environment lifestyle variants intentionally reframe wider than the studio bust.
 * Keeps the locked canvas / aspect; drops the tight optical bust lock.
 */
export const buildEnvironmentFramingPromptSuffix = (
  profile: FramingProfile,
): string => {
  const aspectLabel = GEMINI_FRAME_ASPECT_RATIO;
  return (
    `Locked output canvas: ${profile.frameWidth}x${profile.frameHeight}px, ${aspectLabel} aspect ratio. ` +
    'Lifestyle framing: waist-up or three-quarter body (head through hips; seated café may show to knees) — ' +
    'not ultra-tight face-only, not a head-and-shoulders bust filling 80%+ of the frame. ' +
    'Subject occupies roughly 40–55% of frame height, centered horizontally, with readable environment around them. ' +
    'Camera: natural 35–50mm lifestyle, slight depth — not beauty-dish studio crop. ' +
    'Zoom out from any studio bust; pose may change for a natural on-location stance while identity, eyeglasses, and clothing design stay the same. ' +
    'Do not change aspect ratio; edge-to-edge, no matte bands.'
  );
};
