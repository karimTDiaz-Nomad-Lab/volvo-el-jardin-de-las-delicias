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

export function pickVideoDeviceId(
  devices: Array<Pick<MediaDeviceInfo, 'kind' | 'deviceId' | 'label'>>,
  hint: string,
): string | undefined {
  const needle = hint.trim().toLowerCase();
  if (!needle) return undefined;
  return devices.find(
    (device) =>
      device.kind === 'videoinput' && device.label.toLowerCase().includes(needle),
  )?.deviceId;
}

export function videoConstraintsForDevice(deviceId?: string): MediaTrackConstraints {
  if (!deviceId) return { ...CAMERA_VIDEO_CONSTRAINTS };
  return {
    ...CAMERA_VIDEO_CONSTRAINTS,
    deviceId: { exact: deviceId },
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
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    combined.includes('permission') ||
    combined.includes('not allowed') ||
    combined.includes('denied')
  ) {
    return { kind: 'permission', message: getPermissionMessage() };
  }

  return { kind: 'generic', message: getPermissionMessage() };
}

export function getUnavailableCameraError(): CameraError {
  return { kind: 'unavailable', message: getUnavailableMessage() };
}

export async function requestCameraStream(): Promise<MediaStream> {
  if (!isCameraApiAvailable()) {
    throw getUnavailableCameraError();
  }

  const hint = getCameraDeviceLabelHint();
  const bootstrap = await navigator.mediaDevices.getUserMedia({
    video: CAMERA_VIDEO_CONSTRAINTS,
    audio: false,
  });

  if (!hint) return bootstrap;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const deviceId = pickVideoDeviceId(devices, hint);
  const currentId = bootstrap.getVideoTracks()[0]?.getSettings().deviceId;
  if (!deviceId || deviceId === currentId) return bootstrap;

  stopCameraStream(bootstrap);
  return navigator.mediaDevices.getUserMedia({
    video: videoConstraintsForDevice(deviceId),
    audio: false,
  });
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
