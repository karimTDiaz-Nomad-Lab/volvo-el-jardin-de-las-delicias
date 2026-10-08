/**
 * Shared camera constraints, errors, and capture helpers.
 */

/** Landscape sensor — MUPI mounts the cam sideways and CSS/canvas rotate it upright. */
export const CAMERA_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

/** Portrait MUPI default. Set `VITE_CAMERA_ROTATION_DEG=0` for an upright laptop webcam. */
const MUPI_CAMERA_ROTATION_DEG = -90;

export function getCameraRotationDeg(): number {
  const raw = import.meta.env.VITE_CAMERA_ROTATION_DEG?.trim();
  if (raw === undefined || raw === '') return MUPI_CAMERA_ROTATION_DEG;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : MUPI_CAMERA_ROTATION_DEG;
}

export function usesMupiCameraRotation(): boolean {
  return getCameraRotationDeg() !== 0;
}

export function getCameraDeviceLabelHint(): string {
  return import.meta.env.VITE_CAMERA_DEVICE_LABEL?.trim() ?? '';
}

function isVirtualOrTetheredWebcam(label: string): boolean {
  return /(eos webcam utility|canon eos|\beos\b|elgato|obs virtual|iriun|epoccam)/i.test(
    label,
  );
}

function isBuiltinWebcam(label: string): boolean {
  if (isVirtualOrTetheredWebcam(label)) return false;
  return /(integrated|internal|built-?in|facetime|laptop)/i.test(label);
}

export function pickVideoDeviceId(
  devices: Array<Pick<MediaDeviceInfo, 'kind' | 'deviceId' | 'label'>>,
  hint: string,
): string | undefined {
  const videos = devices.filter((device) => device.kind === 'videoinput' && device.deviceId);
  if (videos.length === 0) return undefined;

  const needle = hint.trim().toLowerCase();
  if (needle) {
    const hinted = videos.find(
      (device) =>
        device.label.toLowerCase().includes(needle) ||
        device.deviceId.toLowerCase().includes(needle),
    );
    if (hinted) return hinted.deviceId;
  }

  const builtin = videos.find((device) => isBuiltinWebcam(device.label));
  if (builtin) return builtin.deviceId;

  const notTethered = videos.find((device) => !isVirtualOrTetheredWebcam(device.label));
  if (notTethered) return notTethered.deviceId;

  return videos[0]?.deviceId;
}

export function videoConstraintsForDevice(deviceId?: string): MediaTrackConstraints {
  if (!deviceId) return { ...CAMERA_VIDEO_CONSTRAINTS };
  return {
    ...CAMERA_VIDEO_CONSTRAINTS,
    deviceId: { ideal: deviceId },
  };
}

function isQuarterTurn(deg: number): boolean {
  return Math.abs(deg) % 180 === 90;
}

// Dev/start server listens on 8080 by default (server/index.ts).
const LOCAL_CAMERA_URL = 'http://localhost:8080';

export type CameraErrorKind = 'unavailable' | 'permission' | 'generic';

export type CameraError = {
  kind: CameraErrorKind;
  message: string;
};

export function isCameraApiAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

function isLocalCameraHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  );
}

function isEmbeddedPreview(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function getUnavailableMessage(): string {
  if (typeof window !== 'undefined') {
    if (isEmbeddedPreview()) {
      return `The embedded preview cannot access your camera. Open ${LOCAL_CAMERA_URL} directly in Chrome and allow camera access when prompted.`;
    }
    if (!window.isSecureContext && !isLocalCameraHost(window.location.hostname)) {
      return `Camera access is blocked on ${window.location.origin}. Chrome only allows camera on HTTPS or localhost, so open ${LOCAL_CAMERA_URL} directly.`;
    }
  }
  return `This browser context does not expose the camera API. Open ${LOCAL_CAMERA_URL} directly in Chrome and allow camera access when prompted.`;
}

function getPermissionMessage(): string {
  return 'Camera access was blocked. Allow camera permission in your browser settings for this site, then tap Try again.';
}

export function parseUserMediaError(err: string | DOMException | unknown): CameraError {
  const name =
    typeof err === 'object' && err !== null && 'name' in err ? String((err as DOMException).name) : '';
  const message =
    typeof err === 'string' ? err : err instanceof Error ? err.message : '';
  const combined = `${name} ${message}`.toLowerCase();

  if (
    !isCameraApiAvailable() ||
    combined.includes('not implemented') ||
    combined.includes('notsupported')
  ) {
    return { kind: 'unavailable', message: getUnavailableMessage() };
  }

  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'OverconstrainedError' ||
    combined.includes('requested device not found')
  ) {
    return {
      kind: 'unavailable',
      message: 'No camera was found. Connect a camera and tap Try again.',
    };
  }

  if (
    name === 'NotReadableError' ||
    name === 'TrackStartError' ||
    combined.includes('could not start video source')
  ) {
    return {
      kind: 'generic',
      message: 'The camera is already in use by another app. Close it and tap Try again.',
    };
  }

  if (
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    combined.includes('permission') ||
    combined.includes('not allowed') ||
    combined.includes('denied')
  ) {
    return { kind: 'permission', message: getPermissionMessage() };
  }

  return {
    kind: 'generic',
    message: 'Could not open a camera. Check that one is connected and tap Try again.',
  };
}

export function getUnavailableCameraError(): CameraError {
  return { kind: 'unavailable', message: getUnavailableMessage() };
}

const VIDEO_CONSTRAINT_FALLBACKS: Array<boolean | MediaTrackConstraints> = [
  { facingMode: { ideal: 'user' } },
  true,
  CAMERA_VIDEO_CONSTRAINTS,
  { width: { ideal: 1280 }, height: { ideal: 720 } },
];

async function openVideoStream(
  video: boolean | MediaTrackConstraints,
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video, audio: false });
}

export async function requestCameraStream(): Promise<MediaStream> {
  if (!isCameraApiAvailable()) {
    throw getUnavailableCameraError();
  }

  let lastError: unknown;
  let stream: MediaStream | null = null;

  for (const video of VIDEO_CONSTRAINT_FALLBACKS) {
    try {
      stream = await openVideoStream(video);
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!stream) {
    throw parseUserMediaError(lastError);
  }

  let devices: MediaDeviceInfo[] = [];
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch {
    return stream;
  }

  const preferredId = pickVideoDeviceId(devices, getCameraDeviceLabelHint());
  const currentId = stream.getVideoTracks()[0]?.getSettings().deviceId;
  if (!preferredId || preferredId === currentId) {
    return stream;
  }

  try {
    const next = await openVideoStream(videoConstraintsForDevice(preferredId));
    stopCameraStream(stream);
    return next;
  } catch {
    return stream;
  }
}

export function stopCameraStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Canvas capture — same rotation + mirror as the live MUPI preview. */
export function captureVideoFrame(video: HTMLVideoElement, quality = 0.92): string | null {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight) return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rotationDeg = getCameraRotationDeg();
  if (rotationDeg === 0) {
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    return canvas.toDataURL('image/jpeg', quality);
  }

  const swap = isQuarterTurn(rotationDeg);
  canvas.width = swap ? videoHeight : videoWidth;
  canvas.height = swap ? videoWidth : videoHeight;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(-1, 1);
  ctx.drawImage(video, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);

  return canvas.toDataURL('image/jpeg', quality);
}
