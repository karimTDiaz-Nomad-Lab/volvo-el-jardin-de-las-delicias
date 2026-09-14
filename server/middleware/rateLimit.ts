import type { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function resolveWindowMs(): number {
  const raw = Number(process.env.API_RATE_LIMIT_WINDOW_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 60_000;
}

function resolveMaxRequests(): number {
  const raw = Number(process.env.API_RATE_LIMIT_MAX);
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/** In-memory rate limit for generate endpoints (per IP per window). */
export function apiRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'POST') {
    next();
    return;
  }

  const windowMs = resolveWindowMs();
  const max = resolveMaxRequests();
  const key = clientKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (bucket.count >= max) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
      retryable: true,
    });
    return;
  }

  bucket.count += 1;
  next();
}
