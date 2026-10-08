import { describe, expect, it, vi } from 'vitest';
import {
  getCameraRotationDeg,
  pickVideoDeviceId,
  usesMupiCameraRotation,
} from './camera';

describe('getCameraRotationDeg', () => {
  it('defaults to -90 for a portrait MUPI camera when env unset', () => {
    vi.stubEnv('VITE_CAMERA_ROTATION_DEG', undefined);
    expect(getCameraRotationDeg()).toBe(-90);
    expect(usesMupiCameraRotation()).toBe(true);
  });

  it('uses the configured angle', () => {
    vi.stubEnv('VITE_CAMERA_ROTATION_DEG', '90');
    expect(getCameraRotationDeg()).toBe(90);
    expect(usesMupiCameraRotation()).toBe(true);
  });

  it('disables rotation when env is 0 (laptop cam)', () => {
    vi.stubEnv('VITE_CAMERA_ROTATION_DEG', '0');
    expect(getCameraRotationDeg()).toBe(0);
    expect(usesMupiCameraRotation()).toBe(false);
  });
});

describe('pickVideoDeviceId', () => {
  const devices = [
    { kind: 'audioinput' as const, deviceId: 'mic', label: 'Mic' },
    { kind: 'videoinput' as const, deviceId: 'laptop', label: 'Integrated Camera' },
    { kind: 'videoinput' as const, deviceId: 'canon', label: 'EOS Webcam Utility' },
  ];

  it('picks a camera whose label or id matches the hint', () => {
    expect(pickVideoDeviceId(devices, 'canon')).toBe('canon');
    expect(pickVideoDeviceId(devices, 'EOS')).toBe('canon');
  });

  it('prefers the laptop webcam over Canon EOS Webcam Utility', () => {
    expect(pickVideoDeviceId(devices, '')).toBe('laptop');
    expect(pickVideoDeviceId(devices, 'logitech')).toBe('laptop');
  });

  it('uses the only video camera when nothing else is plugged in', () => {
    expect(
      pickVideoDeviceId(
        [{ kind: 'videoinput', deviceId: 'laptop', label: 'Integrated Camera' }],
        '',
      ),
    ).toBe('laptop');
  });

  it('returns undefined when there is no video camera', () => {
    expect(
      pickVideoDeviceId([{ kind: 'audioinput', deviceId: 'mic', label: 'Mic' }], ''),
    ).toBeUndefined();
  });
});
