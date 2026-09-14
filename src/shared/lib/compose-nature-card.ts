/**
 * Bake the 4:5 Nature Collection card (portrait + Volvo overlay) into a JPEG.
 * Print and QR both use this file so the physical print matches the download.
 *
 * Output is 1600×2000 (4:5) — 400 dpi on 4×5 in paper.
 */

export const CARD_PRINT_WIDTH = 1600;
export const CARD_PRINT_HEIGHT = 2000;
export const CARD_PRINT_ASPECT = CARD_PRINT_WIDTH / CARD_PRINT_HEIGHT;

/** Logo SVG viewBox 524.06 × 45.51 */
const LOGO_ASPECT = 524.06 / 45.51;

export type OverlayInk = 'black' | 'white';

export interface NatureCardLayout {
  width: number;
  height: number;
  padX: number;
  padTop: number;
  padBottom: number;
  rightX: number;
  logoWidth: number;
  logoHeight: number;
  logoX: number;
  logoY: number;
  eyebrowSize: number;
  nameSize: number;
  taglineSize: number;
  footerSize: number;
  taglineMaxWidth: number;
}

export function getNatureCardLayout(
  width = CARD_PRINT_WIDTH,
  height = CARD_PRINT_HEIGHT,
): NatureCardLayout {
  const padX = width * 0.07;
  const padTop = height * 0.08;
  const padBottom = height * 0.06;
  const logoWidth = width * 0.28;
  const logoHeight = logoWidth / LOGO_ASPECT;
  return {
    width,
    height,
    padX,
    padTop,
    padBottom,
    rightX: width - padX,
    logoWidth,
    logoHeight,
    logoX: width - padX - logoWidth,
    logoY: padTop,
    eyebrowSize: width * 0.0132,
    nameSize: width * 0.05,
    taglineSize: width * 0.02,
    footerSize: width * 0.012,
    taglineMaxWidth: width * 0.7,
  };
}

export interface ComposeNatureCardInput {
  portraitUrl: string;
  title: string;
  tagline: string;
  overlayInk: OverlayInk;
  eyebrow: string;
  footer: string;
  logoSrc: string;
}

const FONT = '"Volvo Centum", sans-serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

async function waitForOverlayFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`400 24px ${FONT}`),
    document.fonts.load(`600 80px ${FONT}`),
    document.fonts.ready,
  ]);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dw: number,
  dh: number,
): void {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;
  if (sourceRatio > targetRatio) {
    sw = sh * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = sw / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
}

function fillRightSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  letterSpacing: number,
): void {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) +
    letterSpacing * Math.max(0, chars.length - 1);
  let x = rightX - total;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += widths[i] + letterSpacing;
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode the nature card JPEG.'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result !== 'string') {
            reject(new Error('Unexpected FileReader result after composing the card.'));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('FileReader failed after composing the card.'));
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

export async function composeNatureCard(input: ComposeNatureCardInput): Promise<string> {
  await waitForOverlayFonts();
  const [portrait, logo] = await Promise.all([
    loadImage(input.portraitUrl),
    loadImage(input.logoSrc),
  ]);

  const layout = getNatureCardLayout();
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create composition canvas.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawCover(ctx, portrait, layout.width, layout.height);

  const ink = input.overlayInk === 'white' ? '#ffffff' : '#111111';
  ctx.fillStyle = ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.save();
  if (input.overlayInk === 'white') {
    ctx.filter = 'invert(1)';
  }
  ctx.drawImage(logo, layout.logoX, layout.logoY, layout.logoWidth, layout.logoHeight);
  ctx.restore();

  let y = layout.logoY + layout.logoHeight + layout.height * 0.008;
  const eyebrow = input.eyebrow.toUpperCase();
  ctx.font = `400 ${layout.eyebrowSize}px ${FONT}`;
  fillRightSpaced(ctx, eyebrow, layout.rightX, y, layout.eyebrowSize * 0.16);
  y += layout.eyebrowSize + layout.height * 0.018;

  const title = input.title.toUpperCase();
  ctx.font = `600 ${layout.nameSize}px ${FONT}`;
  fillRightSpaced(ctx, title, layout.rightX, y, layout.nameSize * 0.08);
  y += layout.nameSize + layout.height * 0.008;

  ctx.font = `600 ${layout.taglineSize}px ${FONT}`;
  const lineHeight = layout.taglineSize * 1.25;
  for (const line of input.tagline.toUpperCase().split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    fillRightSpaced(ctx, trimmed, layout.rightX, y, 0);
    y += lineHeight;
  }

  const footer = input.footer.toUpperCase();
  ctx.font = `400 ${layout.footerSize}px ${FONT}`;
  const footerY = layout.height - layout.padBottom - layout.footerSize;
  fillRightSpaced(ctx, footer, layout.rightX, footerY, layout.footerSize * 0.12);

  return canvasToJpeg(canvas, 0.92);
}
