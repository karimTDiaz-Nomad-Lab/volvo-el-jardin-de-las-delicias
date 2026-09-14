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
      const mediaStream = await requestCameraStream();
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
