import type { NextFunction, Request, Response } from 'express';

function collectAllowedKeys(): Set<string> {
  const keys = new Set<string>();
  const primary = process.env.API_KEY?.trim();
  if (primary) keys.add(primary);
  const kioskTokens = process.env.KIOSK_TOKENS?.split(',') ?? [];
  for (const token of kioskTokens) {
    const trimmed = token.trim();
    if (trimmed) keys.add(trimmed);
  }
  return keys;
}

function readRequestToken(req: Request): string | undefined {
  const headerKey = req.headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();

  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return undefined;
}

/** Fail fast in production when no API credentials are configured. */
export function assertProductionApiAuthConfigured(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (collectAllowedKeys().size > 0) return;
  console.error(
    '[server] NODE_ENV=production requires API_KEY and/or KIOSK_TOKENS. ' +
      'Refusing to start an unauthenticated /api surface.',
  );
  process.exit(1);
}

/** Protect `/api/*` when `API_KEY` or `KIOSK_TOKENS` is configured. */
export function apiAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowed = collectAllowedKeys();
  if (allowed.size === 0) {
    next();
    return;
  }

  const token = readRequestToken(req);
  if (!token) {
    res.status(401).json({ error: 'API key required', retryable: false });
    return;
  }
  if (!allowed.has(token)) {
    res.status(403).json({ error: 'Invalid API key', retryable: false });
    return;
  }
  next();
}
