/**
 * Lightweight capture quality heuristics (no CV deps).
 * Extreme-only gates: warn on very dark or extremely soft frames.
 */

export type CaptureQualityIssue = 'too_dark' | 'too_blurry';

export interface CaptureQualityMetrics {
  meanLuminance: number;
  /** Sample variance of grayscale — low values correlate with heavy blur / flat frames. */
  luminanceVariance: number;
}

export interface CaptureQualityAssessment {
  metrics: CaptureQualityMetrics;
  issue: CaptureQualityIssue | null;
}

/** Mean luminance below this (0–255) is treated as extremely dark. */
export const CAPTURE_TOO_DARK_MEAN = 28;
/** Variance below this on a downscaled sample is treated as extremely soft/blurry. */
export const CAPTURE_TOO_BLURRY_VARIANCE = 18;

const SAMPLE_MAX_SIDE = 96;

export function assessCaptureQuality(metrics: CaptureQualityMetrics): CaptureQualityIssue | null {
  if (metrics.meanLuminance < CAPTURE_TOO_DARK_MEAN) return 'too_dark';
  if (metrics.luminanceVariance < CAPTURE_TOO_BLURRY_VARIANCE) return 'too_blurry';
  return null;
}

export function assessCaptureQualityFromMetrics(
  metrics: CaptureQualityMetrics,
): CaptureQualityAssessment {
  return { metrics, issue: assessCaptureQuality(metrics) };
}

/**
 * Downscale + sample ImageData for mean / variance.
 * Pure enough for unit tests when ImageData is constructed manually.
 */
export function metricsFromImageData(imageData: ImageData): CaptureQualityMetrics {
  const { data } = imageData;
  const pixelCount = data.length / 4;
  if (pixelCount <= 0) {
    return { meanLuminance: 0, luminanceVariance: 0 };
  }

  let sum = 0;
  const luminances = new Float64Array(pixelCount);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    // Rec. 601 luma
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    luminances[p] = y;
    sum += y;
  }

  const mean = sum / pixelCount;
  let varSum = 0;
  for (let p = 0; p < pixelCount; p += 1) {
    const d = luminances[p] - mean;
    varSum += d * d;
  }

  return {
    meanLuminance: mean,
    luminanceVariance: varSum / pixelCount,
  };
}

export async function measureCaptureQuality(dataUrl: string): Promise<CaptureQualityAssessment> {
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, SAMPLE_MAX_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { metrics: { meanLuminance: 128, luminanceVariance: 1000 }, issue: null };
  }
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return assessCaptureQualityFromMetrics(metricsFromImageData(imageData));
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not decode capture for quality check.'));
    image.src = dataUrl;
  });
}
