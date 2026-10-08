import { describe, expect, it } from 'vitest';
import { SHARE_DOWNLOAD_FILENAME, buildShareSavePage } from './share-page';

describe('buildShareSavePage', () => {
  it('embeds the 4×6 JPEG and a gallery save action', () => {
    const html = buildShareSavePage({
      imageUrl: 'https://cdn.example/volvo-jardin/portraits/2026-09-15/abc.jpg',
    });
    expect(html).toContain('aspect-ratio: 2 / 3');
    expect(html).toContain(SHARE_DOWNLOAD_FILENAME);
    expect(html).toContain('https://cdn.example/volvo-jardin/portraits/2026-09-15/abc.jpg');
    expect(html).toContain('Guardar en galería');
    expect(html).toContain('navigator.share');
    expect(html).toContain('download');
  });

  it('escapes untrusted URL characters in attributes', () => {
    const html = buildShareSavePage({
      imageUrl: 'https://cdn.example/photo.jpg?x="><script>alert(1)</script>',
    });
    expect(html).toContain('&quot;');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toMatch(/<script>alert\(1\)<\/script>/);
  });
});
