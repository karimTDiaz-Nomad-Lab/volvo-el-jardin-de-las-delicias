/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef, useState } from 'react';
import {
  type CameraError,
  parseUserMediaError,
  requestCameraStream,
  stopCameraStream,
} from '@/shared/lib/camera';

export type CameraStreamStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Max wait (ms) before treating the camera request as hung. */
const CAMERA_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new DOMException(`${label}: timed out after ${ms / 1000}s`, 'TimeoutError')),
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export function useCameraStream() {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStreamStatus>('idle');
  const [error, setError] = useState<CameraError | null>(null);

  const release = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setStatus('idle');
    setError(null);
  }, []);

  const prepare = useCallback(async (): Promise<
    { status: 'ready' } | { status: 'error'; error: CameraError }
  > => {
    if (streamRef.current) {
      setStream(streamRef.current);
      setStatus('ready');
      setError(null);
      return { status: 'ready' };
    }

    setStatus('loading');
    setError(null);

    try {
      const mediaStream = await withTimeout(
        requestCameraStream(),
        CAMERA_TIMEOUT_MS,
        'Camera access',
      );
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus('ready');
      return { status: 'ready' };
    } catch (err) {
      const parsed =
        typeof err === 'object' &&
        err !== null &&
        'kind' in err &&
        'message' in err
          ? (err as CameraError)
          : parseUserMediaError(err);
      stopCameraStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
      setError(parsed);
      setStatus('error');
      return { status: 'error', error: parsed };
    }
  }, []);

  return { stream, status, error, prepare, release };
}
