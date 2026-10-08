import { describe, expect, it, vi, afterEach } from 'vitest';
import { sharePortrait } from './share-portrait';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sharePortrait', () => {
  it('returns the CDN URL on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          shareUrl:
            'https://no-madproject.ams3.cdn.digitaloceanspaces.com/volvo-jardin/portraits/a.html',
        }),
      }),
    );

    await expect(sharePortrait('data:image/jpeg;base64,abc')).resolves.toBe(
      'https://no-madproject.ams3.cdn.digitaloceanspaces.com/volvo-jardin/portraits/a.html',
    );
  });

  it('returns null when sharing is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Sharing is not configured' }),
      }),
    );

    await expect(sharePortrait('data:image/jpeg;base64,abc')).resolves.toBeNull();
  });
});
