import '../loadEnv';
import { Router, type Request, type Response } from 'express';
import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Modality,
  type GenerateContentConfig,
  type SafetySetting,
} from '@google/genai';
import { extractImageDataUrl } from '../../src/services/gemini-response';
import {
  isImageOtherFailure,
  isRecitationFailure,
} from '../../src/core/ai/imageGenErrors';

function resolveFrameAspectRatio(): string {
  const raw = process.env.VITE_FRAME_ASPECT_RATIO?.trim();
  let ratio = 2 / 3;
  if (raw) {
    if (raw.includes(':') || raw.includes('/')) {
      const sep = raw.includes(':') ? ':' : '/';
      const [w, h] = raw.split(sep).map(Number);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) ratio = w / h;
    } else {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) ratio = parsed;
    }
  }
  if (Math.abs(ratio - 2 / 3) < 0.01) return '2:3';
  if (Math.abs(ratio - 4 / 5) < 0.01) return '4:5';
  if (Math.abs(ratio - 3 / 4) < 0.01) return '3:4';
  if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16';
  return '2:3';
}

// Default flash-lite for interactive latency (QW7). Override via GEMINI_IMAGE_MODEL.
// Quality risk on multi-ref eyewear: try gemini-3.1-flash-image or gemini-2.5-flash-image.
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3.1-flash-lite-image';
// Per-call Gemini timeout. Keep well under the client transport timeout (100s).
const GEMINI_REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_REQUEST_TIMEOUT_MS) || 60_000;
// Hard budget for the whole /api/generate attempt (including retries). Client waits 100s.
const GEMINI_TOTAL_BUDGET_MS = Number(process.env.GEMINI_TOTAL_BUDGET_MS) || 90_000;
const FRAME_ASPECT_RATIO = resolveFrameAspectRatio();

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const imageGenerationConfig: GenerateContentConfig = {
  responseModalities: [Modality.IMAGE, Modality.TEXT],
  // Interactive path stays at 1K (do not default to 2K).
  imageConfig: { aspectRatio: FRAME_ASPECT_RATIO, imageSize: process.env.GEMINI_IMAGE_SIZE?.trim() || '1K' },
  safetySettings,
};

type InlinePart = { inlineData: { mimeType: string; data: string } };
type TextPart = { text: string };
type RequestPart = InlinePart | TextPart;

// ─── API key helpers ──────────────────────────────────────────────────

function resolvePrimaryApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
}

function primaryKeySource(): string {
  if (process.env.GOOGLE_API_KEY) return 'GOOGLE_API_KEY';
  if (process.env.GEMINI_API_KEY) return 'GEMINI_API_KEY';
  if (process.env.API_KEY) return 'API_KEY';
  return 'none';
}

// ─── Error helpers ────────────────────────────────────────────────────

function getErrorStatus(err: unknown): number | undefined {
  const e = err as { status?: number; statusCode?: number; code?: number; message?: string };
  const status = e?.status ?? e?.statusCode ?? e?.code;
  if (typeof status === 'number' && status >= 400 && status < 600) return status;
  const match = String(e?.message || '').match(/"code":\s*(\d+)/);
  if (match) return Number(match[1]);
  return undefined;
}

function is429(err: unknown): boolean {
  const msg = String((err as Error)?.message || err || '').toLowerCase();
  const status = getErrorStatus(err);
  return status === 429 || msg.includes('resource_exhausted') || msg.includes('429');
}

/**
 * RECITATION is stochastic — same request often succeeds on retry.
 * IMAGE_OTHER is a catch-all / often intermittent — allow one short retry only.
 * SAFETY / blocked stay non-retryable.
 */
function isRetryableGeminiError(err: unknown, attempt: number, maxRetries: number): boolean {
  const e = err as { blocked?: boolean; timeout?: boolean };
  if (e?.blocked || e?.timeout) return false;
  // IMAGE_OTHER: exactly one extra attempt (attempt 0 → retry once).
  if (isImageOtherFailure(err)) return attempt < 1;
  if (isRecitationFailure(err)) return attempt < maxRetries;
  if (is429(err)) return attempt < maxRetries;
  const status = getErrorStatus(err);
  if (status === 500 || status === 503 || status === 504) return attempt < maxRetries;
  return false;
}

function shortRetryDelayMs(baseMs: number): number {
  return Math.round(baseMs + Math.random() * 0.4 * baseMs);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffWithJitter(baseMs: number, attempt: number): number {
  const exp = baseMs * Math.pow(2, attempt);
  return Math.round(exp + Math.random() * 0.3 * exp);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error('Gemini request timeout') as Error & { status: number; timeout: boolean };
      err.status = 504;
      err.timeout = true;
      reject(err);
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function normalizeParts(parts: unknown): RequestPart[] {
  if (!Array.isArray(parts) || parts.length === 0) throw new Error('Missing or empty parts');
  return parts.map((part) => {
    if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
      return { text: part.text };
    }
    if (part && typeof part === 'object' && 'inlineData' in part && part.inlineData && typeof part.inlineData === 'object') {
      const { mimeType, data } = part.inlineData as { mimeType?: string; data?: string };
      if (!mimeType || !data || data.length < 100) throw new Error('Invalid inline image part');
      return { inlineData: { mimeType, data } };
    }
    throw new Error('Each part must be { text } or { inlineData }');
  });
}

function sendGeminiError(res: Response, err: unknown) {
  const e = err as Error & {
    timeout?: boolean;
    blocked?: boolean;
    noImage?: boolean;
    status?: number;
    finishReason?: string;
    finishMessage?: string;
    blockReason?: string;
  };

  const telemetry = {
    finishReason: e.finishReason,
    finishMessage: e.finishMessage,
    blockReason: e.blockReason,
  };
  if (e.finishReason || e.finishMessage || e.blockReason) {
    console.warn('[Gemini] image failure detail', telemetry);
  }

  if (e.timeout) return res.status(504).json({ error: 'Gemini request timeout', retryable: true });
  if (e.blocked) {
    return res.status(422).json({
      error: String(e.message || 'Gemini returned no candidates'),
      retryable: false,
      ...telemetry,
    });
  }
  if (e.noImage) {
    return res.status(422).json({
      error: String(e.message),
      retryable: false,
      ...telemetry,
    });
  }
  if (is429(err)) return res.status(503).json({ error: 'RATE_LIMITED', retryable: true, retryAfter: 10 });

  const message = String(e?.message || err);
  const code = Number(e?.status || getErrorStatus(err) || 500);
  const retryable = [408, 429, 500, 502, 503, 504].includes(code);
  res.status(code >= 400 && code < 600 ? code : 500).json({ error: message, retryable });
}

// ─── Router ───────────────────────────────────────────────────────────

export function createGenerateRouter(): Router {
  const router = Router();

  const primaryKey = resolvePrimaryApiKey();
  const backupKey = process.env.GEMINI_API_KEY_BACKUP;

  if (primaryKey) {
    console.info(`[Gemini] Primary key loaded from ${primaryKeySource()}`);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info(
      `[Gemini] Image config: model=${IMAGE_MODEL} size=${imageGenerationConfig.imageConfig?.imageSize ?? 'unset'} aspect=${FRAME_ASPECT_RATIO}`,
    );
  }

  const maxRetries = 2;
  // Short base: transient 5xx/429 retries shouldn't stall a kiosk session for 5s+.
  const backoffBase = 1_500;
  // Recitation is stochastic, not load-related — waiting doesn't help, so retry near-instantly.
  const recitationRetryDelayMs = 300;

  async function callGenerateContent(apiKey: string, parts: RequestPart[], timeoutMs = GEMINI_REQUEST_TIMEOUT_MS) {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts },
        config: imageGenerationConfig,
      }),
      Math.max(1_000, timeoutMs),
    );
    return extractImageDataUrl(response);
  }

  async function generateImageWithRetry(parts: RequestPart[]) {
    const budgetStartedAt = Date.now();
    const remaining = () => GEMINI_TOTAL_BUDGET_MS - (Date.now() - budgetStartedAt);
    const budgetTimeoutError = () => {
      const err = new Error('Gemini request timeout') as Error & { status: number; timeout: boolean };
      err.status = 504;
      err.timeout = true;
      return err;
    };

    if (primaryKey) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const remainingBudget = remaining();
        if (remainingBudget <= 0) throw budgetTimeoutError();
        const callTimeout = Math.min(GEMINI_REQUEST_TIMEOUT_MS, remainingBudget);
        try {
          return await callGenerateContent(primaryKey, parts, callTimeout);
        } catch (err) {
          if (isRetryableGeminiError(err, attempt, maxRetries)) {
            const delay =
              isRecitationFailure(err) || isImageOtherFailure(err)
                ? shortRetryDelayMs(recitationRetryDelayMs)
                : backoffWithJitter(backoffBase, attempt);
            if (remaining() - delay <= 0) {
              console.info(
                `[Gemini] budget exhausted before retry attempt=${attempt + 1} remainingMs=${remaining()}`,
              );
              throw err;
            }
            console.info(
              `[Gemini] retry attempt=${attempt + 1} delayMs=${delay} reason=${isImageOtherFailure(err) ? 'IMAGE_OTHER' : isRecitationFailure(err) ? 'RECITATION' : 'transient'}`,
            );
            await sleep(delay);
            continue;
          }
          if (is429(err) && backupKey) break;
          throw err;
        }
      }
    }

    if (backupKey) {
      const remainingBudget = remaining();
      if (remainingBudget <= 0) throw budgetTimeoutError();
      console.info('[FAILOVER] Using backup API key');
      return callGenerateContent(backupKey, parts, Math.min(GEMINI_REQUEST_TIMEOUT_MS, remainingBudget));
    }

    throw new Error('No API keys available');
  }

  router.post('/generate', async (req: Request, res: Response) => {
    if (!primaryKey && !backupKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_API_KEY or GEMINI_API_KEY', retryable: false });
    }
    try {
      const parts = normalizeParts(req.body?.parts);
      const image = await generateImageWithRetry(parts);
      res.json({ image });
    } catch (err) {
      console.error('Generate error:', err);
      sendGeminiError(res, err);
    }
  });

  return router;
}
