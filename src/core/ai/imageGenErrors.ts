/**
 * Classify Gemini image-generation failures for retries, UX, and telemetry.
 * finishReason IMAGE_OTHER is a catch-all — often intermittent, not "safety settings".
 */

export type ImageGenFailureKind =
  | 'blocked'
  | 'safety'
  | 'image_other'
  | 'recitation'
  | 'no_image'
  | 'unknown';

const SAFETY_FINISH = /\b(IMAGE_SAFETY|SAFETY|PROHIBITED(?:_CONTENT)?|BLOCKLIST)\b/i;
const OTHER_FINISH = /\bIMAGE_OTHER\b/i;
const RECITATION_FINISH = /\b(IMAGE_)?RECITATION\b/i;
const BLOCKED_REQUEST = /request was blocked|promptFeedback|blockReason/i;

export function classifyImageGenMessage(message: string): ImageGenFailureKind {
  const text = message.trim();
  if (!text) return 'unknown';
  if (OTHER_FINISH.test(text)) return 'image_other';
  if (RECITATION_FINISH.test(text)) return 'recitation';
  if (BLOCKED_REQUEST.test(text)) return 'blocked';
  if (SAFETY_FINISH.test(text) || /content safety|safety filters/i.test(text)) return 'safety';
  if (/did not return an image|no candidates|no image/i.test(text)) return 'no_image';
  return 'unknown';
}

export function classifyImageGenFailure(err: unknown): ImageGenFailureKind {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : String(err ?? '');
  return classifyImageGenMessage(message);
}

/**
 * True when a failed studio enhance should stay quiet on capture-primary
 * (capture already is the session base; soft notice only).
 */
export function isCaptureFallbackEligible(err: unknown): boolean {
  const kind = classifyImageGenFailure(err);
  return kind === 'image_other' || kind === 'no_image';
}

export function isImageOtherFailure(err: unknown): boolean {
  return classifyImageGenFailure(err) === 'image_other';
}

export function isRecitationFailure(err: unknown): boolean {
  return classifyImageGenFailure(err) === 'recitation';
}

export function messageForFinishReason(
  finishReason: string,
  finishMessage?: string | null,
): string {
  const reason = finishReason.trim();
  const detail = finishMessage?.trim();
  const upper = reason.toUpperCase();

  if (upper === 'IMAGE_OTHER' || upper === 'OTHER') {
    return (
      `Image generation stopped unexpectedly. Reason: ${reason}. ` +
      (detail ||
        'This is often an intermittent generation issue — retry with better lighting. It is usually not a safety-settings problem.')
    );
  }

  if (
    upper === 'IMAGE_SAFETY' ||
    upper === 'SAFETY' ||
    upper.includes('PROHIBITED') ||
    upper.includes('BLOCK')
  ) {
    return (
      `Image generation was blocked by content safety filters. Reason: ${reason}. ` +
      (detail || 'Try a clearer, well-lit portrait facing the camera.')
    );
  }

  if (RECITATION_FINISH.test(reason)) {
    return (
      `Image generation stopped unexpectedly. Reason: ${reason}. ` +
      (detail || 'This can happen with catalog references — a retry often succeeds.')
    );
  }

  return (
    `Image generation stopped unexpectedly. Reason: ${reason}. ` +
    (detail || 'Please retry. If it keeps failing, recapture with better lighting.')
  );
}
