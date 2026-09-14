/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Browser → backend proxy for Gemini (never call @google/genai from the client).
 */

export type GenerateContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/**
 * Client timeout must sit above the server total budget so we do not abort mid-flight
 * and spawn a duplicate request. Server: 60s/call + 90s total budget (see generate.ts).
 */
const timeoutMs = 100_000;

function apiAuthHeaders(): Record<string, string> {
  const kioskKey = import.meta.env.VITE_KIOSK_API_KEY?.trim();
  if (!kioskKey) return {};
  return { 'X-API-Key': kioskKey };
}
/**
 * The server already retries transient Gemini statuses with backoff + jitter
 * (server/routes/generate.ts). The client only retries real transport failures
 * (TypeError / network drop) once — never HTTP statuses, never its own timeout.
 */
const maxNetworkRetries = 1;
const networkRetryDelay = 2_500;

export type GenerateImageApiOptions = {
  signal?: AbortSignal;
  /** When false, skip client transport retry (cost-sensitive paths). Default true. */
  retryNetwork?: boolean;
};

export type TransportRetryDecision = {
  timedOut: boolean;
  externallyAborted: boolean;
  isNetworkError: boolean;
};

/**
 * Pure retry gate for client transport. Own timeout is not retryable — the server
 * already spent its budget. Real network drops (TypeError) get one retry.
 */
export const shouldRetryTransport = ({
  timedOut,
  externallyAborted,
  isNetworkError,
}: TransportRetryDecision): boolean => {
  if (externallyAborted) return false;
  if (timedOut) return false;
  return isNetworkError;
};

const readApiError = async (res: Response): Promise<Error & { status?: number; retryable?: boolean }> => {
  const text = await res.text();
  try {
    const body = JSON.parse(text) as { error?: string; retryable?: boolean };
    const error = new Error(body.error || `HTTP ${res.status}`) as Error & {
      status?: number;
      retryable?: boolean;
    };
    error.status = res.status;
    error.retryable = body.retryable;
    return error;
  } catch {
    const error = new Error(text || `HTTP ${res.status}`) as Error & { status?: number };
    error.status = res.status;
    return error;
  }
};

async function postJson<T>(
  path: string,
  body: unknown,
  options?: GenerateImageApiOptions,
): Promise<T> {
  const maxRetries = options?.retryNetwork === false ? 0 : maxNetworkRetries;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const onExternalAbort = () => controller.abort();
    options?.signal?.addEventListener('abort', onExternalAbort);

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...apiAuthHeaders(),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw await readApiError(res);
      }

      return (await res.json()) as T;
    } catch (error) {
      const err = error as Error & { status?: number; name?: string };
      const externallyAborted = Boolean(options?.signal?.aborted);
      const isAbort = err.name === 'AbortError';
      // User / session cancel — never auto-retry.
      if (externallyAborted) throw error;
      // fetch network failures surface as TypeError without an HTTP status.
      const isNetworkError = err.status === undefined && error instanceof TypeError;
      const retryable =
        attempt < maxRetries &&
        shouldRetryTransport({
          timedOut: timedOut && isAbort,
          externallyAborted,
          isNetworkError,
        });
      if (!retryable) throw error;
      await new Promise((r) => setTimeout(r, networkRetryDelay));
    } finally {
      clearTimeout(timeoutId);
      options?.signal?.removeEventListener('abort', onExternalAbort);
    }
  }

  throw new Error('Unreachable');
}

export const generateImageViaApi = async (
  parts: GenerateContentPart[],
  options?: GenerateImageApiOptions,
): Promise<string> => {
  const { image } = await postJson<{ image: string }>('/api/generate', { parts }, options);
  if (!image) throw new Error('No image in response');
  return image;
};
