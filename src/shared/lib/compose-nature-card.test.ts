import { describe, expect, it } from 'vitest';
import {
  CARD_PRINT_ASPECT,
  CARD_PRINT_HEIGHT,
  CARD_PRINT_INCHES,
  CARD_PRINT_WIDTH,
  getNatureCardLayout,
} from './compose-nature-card';

describe('getNatureCardLayout', () => {
  it('is a 2:3 print canvas (400 dpi on Kodak 4×6 in)', () => {
    expect(CARD_PRINT_WIDTH / 4).toBe(400);
    expect(CARD_PRINT_HEIGHT / 6).toBe(400);
    expect(CARD_PRINT_ASPECT).toBeCloseTo(2 / 3);
    expect(CARD_PRINT_INCHES).toEqual({ width: 4, height: 6 });
  });

  it('mirrors the on-card overlay insets (7% sides, 8% top, 6% bottom)', () => {
    const layout = getNatureCardLayout();
    expect(layout.width).toBe(1600);
    expect(layout.height).toBe(2400);
    expect(layout.padX).toBeCloseTo(112);
    expect(layout.padTop).toBe(192);
    expect(layout.padBottom).toBe(144);
    expect(layout.logoWidth / layout.width).toBeCloseTo(0.28);
    expect(layout.rightX).toBe(layout.width - layout.padX);
  });
});
