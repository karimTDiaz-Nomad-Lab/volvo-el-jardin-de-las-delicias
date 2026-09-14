import { describe, expect, it } from 'vitest';
import { shouldRetryTransport } from './gemini-api';

describe('shouldRetryTransport', () => {
  it('retries real network drops', () => {
    expect(
      shouldRetryTransport({
        timedOut: false,
        externallyAborted: false,
        isNetworkError: true,
      }),
    ).toBe(true);
  });

  it('does not retry the client own timeout', () => {
    expect(
      shouldRetryTransport({
        timedOut: true,
        externallyAborted: false,
        isNetworkError: false,
      }),
    ).toBe(false);
  });

  it('does not retry user / session abort', () => {
    expect(
      shouldRetryTransport({
        timedOut: false,
        externallyAborted: true,
        isNetworkError: true,
      }),
    ).toBe(false);
  });

  it('does not retry non-network errors', () => {
    expect(
      shouldRetryTransport({
        timedOut: false,
        externallyAborted: false,
        isNetworkError: false,
      }),
    ).toBe(false);
  });
});
