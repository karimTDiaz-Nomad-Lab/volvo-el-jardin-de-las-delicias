/**
 * Upload the finished portrait so the result screen can show a QR to the CDN URL.
 * Failures return null — the kiosk still shows the photo.
 */

function apiAuthHeaders(): Record<string, string> {
  const kioskKey = import.meta.env.VITE_KIOSK_API_KEY?.trim();
  if (!kioskKey) return {};
  return { 'X-API-Key': kioskKey };
}

const SHARE_TIMEOUT_MS = 10_000;

export async function sharePortrait(dataUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHARE_TIMEOUT_MS);

  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiAuthHeaders(),
      },
      body: JSON.stringify({ image: dataUrl }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { shareUrl?: unknown };
    if (typeof body.shareUrl !== 'string' || !body.shareUrl.startsWith('https://')) {
      return null;
    }
    return body.shareUrl;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
