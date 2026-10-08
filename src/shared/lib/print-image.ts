import { CARD_PRINT_INCHES } from './compose-nature-card';

/**
 * Prints the baked Nature Collection card (portrait + overlay).
 *
 * Opens a hidden iframe with the image full-bleed, zero page margins, and
 * `@page { size: 4in 6in }` to match Kodak Dock Plus Retro (PD460) media,
 * then calls `window.print()` on that document. Does not print the kiosk UI.
 *
 * Silent printing requires the host Chrome/Edge kiosk flag `--kiosk-printing`
 * and a default printer loaded with 4×6 media. Otherwise the browser print
 * dialog is shown. The iframe is removed as soon as print() returns; that
 * does not wait for the physical job to finish.
 *
 * @param imageUrl - Data URL of the composed 2:3 JPEG (1600×2400).
 * @returns Resolves after print() is invoked (or immediately if the image
 *   was already loaded). Rejects if the iframe document or `<img>` cannot
 *   be created.
 */

const PRINT_PAGE = `${CARD_PRINT_INCHES.width}in ${CARD_PRINT_INCHES.height}in`;

export function printImage(imageUrl: string): Promise<void> {
  // In dev mode, open the composed card in a new tab for visual inspection.
  if (import.meta.env.DEV) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!doctype html>
  <html>
    <head>
      <title>Print preview — 4×6 Kodak card</title>
      <style>
        html, body {
          margin: 0;
          background: #222;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        img {
          max-height: 95vh;
          max-width: 95vw;
          object-fit: contain;
          border: 1px solid #555;
        }
      </style>
    </head>
    <body>
      <img src="${imageUrl}" alt="Print preview" />
    </body>
  </html>`);
      win.document.close();
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      iframe.remove();
      reject(new Error('No print document'));
      return;
    }
    doc.open();
    doc.write(`<!doctype html>
  <html>
    <head>
      <style>
        @page { size: ${PRINT_PAGE}; margin: 0; }
        html, body {
          margin: 0;
          width: ${CARD_PRINT_INCHES.width}in;
          height: ${CARD_PRINT_INCHES.height}in;
          background: #000;
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      <img src="${imageUrl}" alt="" />
    </body>
  </html>`);
    doc.close();
    const img = doc.querySelector('img');
    if (!img) {
      iframe.remove();
      reject(new Error('No print image'));
      return;
    }
    const print = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      iframe.remove();
      resolve();
    };
    if (img.complete) print();
    else img.onload = print;
  });
}
