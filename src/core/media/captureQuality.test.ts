import { describe, expect, it } from 'vitest';
import {
  CAPTURE_TOO_BLURRY_VARIANCE,
  CAPTURE_TOO_DARK_MEAN,
  assessCaptureQuality,
  metricsFromImageData,
} from './captureQuality';

function makeImageData(fill: (i: number) => [number, number, number, number], size = 4): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const [r, g, b, a] = fill(i);
    const o = i * 4;
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = a;
  }
  return { data, width: size, height: size, colorSpace: 'srgb' } as ImageData;
}

describe('assessCaptureQuality', () => {
  it('flags extremely dark frames', () => {
    const metrics = metricsFromImageData(makeImageData(() => [8, 8, 8, 255]));
    expect(metrics.meanLuminance).toBeLessThan(CAPTURE_TOO_DARK_MEAN);
    expect(assessCaptureQuality(metrics)).toBe('too_dark');
  });

  it('flags extremely flat / soft frames', () => {
    const metrics = metricsFromImageData(makeImageData(() => [120, 120, 120, 255]));
    expect(metrics.luminanceVariance).toBeLessThan(CAPTURE_TOO_BLURRY_VARIANCE);
    expect(assessCaptureQuality(metrics)).toBe('too_blurry');
  });

  it('passes a normally lit varied frame', () => {
    const metrics = metricsFromImageData(
      makeImageData((i) => {
        const v = (i * 37) % 220;
        return [v, v + 10, v + 20, 255];
      }),
    );
    expect(metrics.meanLuminance).toBeGreaterThan(CAPTURE_TOO_DARK_MEAN);
    expect(metrics.luminanceVariance).toBeGreaterThan(CAPTURE_TOO_BLURRY_VARIANCE);
    expect(assessCaptureQuality(metrics)).toBeNull();
  });
});
