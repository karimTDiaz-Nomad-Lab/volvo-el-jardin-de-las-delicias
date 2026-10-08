/**
 * Public HTML served from Spaces when a visitor scans the result QR.
 * Same-origin fetch of the JPEG lets the page trigger a download / share sheet
 * so the photo can land in the device gallery.
 */

export const SHARE_DOWNLOAD_FILENAME = 'volvo-el-jardin.jpg';

export type ShareSavePageInput = {
  imageUrl: string;
  filename?: string;
  title?: string;
  saveLabel?: string;
  hint?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** JSON string safe to embed inside a <script> tag (no raw </script>). */
function escapeJsForScript(value: string): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export function buildShareSavePage(input: ShareSavePageInput): string {
  const imageUrl = input.imageUrl.trim();
  const filename = input.filename?.trim() || SHARE_DOWNLOAD_FILENAME;
  const title = input.title?.trim() || 'Tu retrato Volvo';
  const saveLabel = input.saveLabel?.trim() || 'Guardar en galería';
  const hint =
    input.hint?.trim() ||
    'Si no se guarda sola, pulsa el botón o mantén pulsada la foto.';

  const imageAttr = escapeHtml(imageUrl);
  const filenameAttr = escapeHtml(filename);
  const titleAttr = escapeHtml(title);
  const saveAttr = escapeHtml(saveLabel);
  const hintAttr = escapeHtml(hint);
  const imageJs = escapeJsForScript(imageUrl);
  const filenameJs = escapeJsForScript(filename);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#111111" />
    <title>${titleAttr}</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: #111;
        color: #fff;
        font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      }
      body {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
      }
      .photo {
        width: min(100%, 24rem);
        aspect-ratio: 2 / 3;
        object-fit: cover;
        border-radius: 1rem;
        background: #000;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      }
      .save {
        display: block;
        width: min(100%, 24rem);
        margin-top: 1.15rem;
        padding: 0.95rem 1.2rem;
        border: 0;
        border-radius: 999px;
        background: #a3863a;
        color: #111;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
      }
      .hint {
        width: min(100%, 24rem);
        margin: 0.85rem 0 0;
        text-align: center;
        font-size: 0.78rem;
        line-height: 1.4;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, 0.72);
      }
    </style>
  </head>
  <body>
    <img class="photo" id="photo" src="${imageAttr}" alt="${titleAttr}" />
    <a class="save" id="save" href="${imageAttr}" download="${filenameAttr}">${saveAttr}</a>
    <p class="hint">${hintAttr}</p>
    <script>
      const PHOTO = ${imageJs};
      const FILENAME = ${filenameJs};

      function isLikelyIOS() {
        return /iP(hone|ad|od)/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      }

      async function portraitFile() {
        const res = await fetch(PHOTO, { cache: 'force-cache' });
        if (!res.ok) throw new Error('Could not fetch portrait');
        const blob = await res.blob();
        return new File([blob], FILENAME, { type: 'image/jpeg' });
      }

      async function downloadFile(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = FILENAME;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
      }

      async function saveToGallery() {
        const file = await portraitFile();
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: FILENAME });
            return;
          } catch (err) {
            if (err && err.name === 'AbortError') return;
          }
        }
        await downloadFile(file);
      }

      document.getElementById('save').addEventListener('click', function (event) {
        event.preventDefault();
        saveToGallery().catch(function () {
          window.location.href = PHOTO;
        });
      });

      window.addEventListener('load', function () {
        if (isLikelyIOS()) return;
        portraitFile().then(downloadFile).catch(function () {});
      });
    </script>
  </body>
</html>
`;
}
