/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import { extractImageDataUrl, GeminiImageFailure } from './gemini-response';

describe('extractImageDataUrl', () => {
  it('maps IMAGE_OTHER without blaming safety settings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() =>
      extractImageDataUrl({
        candidates: [{ finishReason: 'IMAGE_OTHER', content: { parts: [] } }],
      } as never),
    ).toThrow(GeminiImageFailure);

    try {
      extractImageDataUrl({
        candidates: [{ finishReason: 'IMAGE_OTHER', content: { parts: [] } }],
      } as never);
    } catch (err) {
      expect(err).toBeInstanceOf(GeminiImageFailure);
      const failure = err as GeminiImageFailure;
      expect(failure.finishReason).toBe('IMAGE_OTHER');
      expect(failure.message).not.toMatch(/safety settings/i);
      expect(failure.message).toMatch(/intermittent|lighting|temporary/i);
    }
    warn.mockRestore();
  });

  it('maps IMAGE_SAFETY to a content-safety message', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      extractImageDataUrl({
        candidates: [{ finishReason: 'IMAGE_SAFETY', content: { parts: [] } }],
      } as never);
    } catch (err) {
      const failure = err as GeminiImageFailure;
      expect(failure.finishReason).toBe('IMAGE_SAFETY');
      expect(failure.message).toMatch(/safety filters|content safety/i);
    }
    warn.mockRestore();
  });

  it('logs blockReason from promptFeedback', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() =>
      extractImageDataUrl({
        promptFeedback: { blockReason: 'PROHIBITED_CONTENT', blockReasonMessage: 'nope' },
      } as never),
    ).toThrow(/blocked/i);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
