import { describe, expect, it } from 'vitest';
import {
  classifyImageGenMessage,
  isCaptureFallbackEligible,
  isImageOtherFailure,
  messageForFinishReason,
} from './imageGenErrors';

describe('classifyImageGenMessage', () => {
  it('treats IMAGE_OTHER as intermittent, not safety', () => {
    expect(
      classifyImageGenMessage(
        'Image generation stopped unexpectedly. Reason: IMAGE_OTHER. This often relates to safety settings.',
      ),
    ).toBe('image_other');
  });

  it('classifies safety / blocked finish reasons', () => {
    expect(classifyImageGenMessage('Reason: IMAGE_SAFETY.')).toBe('safety');
    expect(classifyImageGenMessage('Request was blocked. Reason: OTHER.')).toBe('blocked');
    expect(classifyImageGenMessage('Reason: PROHIBITED_CONTENT.')).toBe('safety');
  });

  it('classifies recitation', () => {
    expect(classifyImageGenMessage('Reason: IMAGE_RECITATION')).toBe('recitation');
  });
});

describe('messageForFinishReason', () => {
  it('does not blame safety settings for IMAGE_OTHER', () => {
    const msg = messageForFinishReason('IMAGE_OTHER');
    expect(msg).toMatch(/IMAGE_OTHER/);
    expect(msg).toMatch(/intermittent|lighting|temporary/i);
    expect(msg).not.toMatch(/safety settings/i);
  });

  it('uses a clear safety message for IMAGE_SAFETY', () => {
    const msg = messageForFinishReason('IMAGE_SAFETY');
    expect(msg).toMatch(/safety filters|content safety/i);
  });
});

describe('fallback eligibility', () => {
  it('allows capture fallback for IMAGE_OTHER', () => {
    expect(isImageOtherFailure(new Error('Reason: IMAGE_OTHER'))).toBe(true);
    expect(isCaptureFallbackEligible(new Error('Reason: IMAGE_OTHER'))).toBe(true);
  });

  it('does not fall back on hard safety blocks', () => {
    expect(isCaptureFallbackEligible(new Error('Reason: IMAGE_SAFETY'))).toBe(false);
    expect(isCaptureFallbackEligible(new Error('Request was blocked. Reason: OTHER'))).toBe(
      false,
    );
  });
});
