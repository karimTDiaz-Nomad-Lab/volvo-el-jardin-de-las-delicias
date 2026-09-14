import { describe, expect, it } from 'vitest';
import {
  FACE_FRAMING_OPTIONS,
  FACE_SUBJECT_HEIGHT_TARGET,
  FACE_SUBJECT_TOP_MARGIN_TARGET,
  computeBootstrapSubjectRect,
  formatFaceBustFramingLock,
} from './framing';

describe('computeBootstrapSubjectRect', () => {
  it('full-bleeds a matching 3:4 source into the session frame', () => {
    const rect = computeBootstrapSubjectRect(768, 1024, 1536, 2048, 0.82, 0.08);
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(1536);
    expect(rect.height).toBe(2048);
  });

  it('covers the frame when Gemini returns a wider face crop (no letterbox slot)', () => {
    const frameW = 1536;
    const frameH = 2048;
    // Wider than 3:4 — height after width-fit would undershoot the frame.
    const rect = computeBootstrapSubjectRect(1200, 1200, frameW, frameH, 0.82, 0.08);
    expect(rect.width).toBeGreaterThanOrEqual(frameW);
    expect(rect.height).toBeGreaterThanOrEqual(frameH);
    expect(rect.x).toBeLessThanOrEqual(0);
    expect(rect.y).toBeLessThanOrEqual(0);
  });

  it('ignores occupancy targets for canvas placement', () => {
    const a = computeBootstrapSubjectRect(800, 1000, 1536, 2048, 0.6, 0.1);
    const b = computeBootstrapSubjectRect(800, 1000, 1536, 2048, 0.95, 0.0);
    expect(a).toEqual(b);
  });
});

describe('FACE_FRAMING_OPTIONS / formatFaceBustFramingLock', () => {
  it('keeps options and lock text on one set of occupancy targets', () => {
    expect(FACE_FRAMING_OPTIONS.subjectHeightTarget).toBe(FACE_SUBJECT_HEIGHT_TARGET);
    expect(FACE_FRAMING_OPTIONS.subjectTopMarginTarget).toBe(FACE_SUBJECT_TOP_MARGIN_TARGET);

    const lock = formatFaceBustFramingLock();
    expect(lock).toContain(`~${Math.round(FACE_SUBJECT_TOP_MARGIN_TARGET * 100)}%`);
    expect(lock).toContain(`~${Math.round(FACE_SUBJECT_HEIGHT_TARGET * 100)}%`);
    expect(lock).toMatch(/shoulders near bottom edge/i);
  });
});
