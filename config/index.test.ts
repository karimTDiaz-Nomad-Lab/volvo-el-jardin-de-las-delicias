import { describe, expect, it } from 'vitest';
import { getManifest, getNatures, isFeatureEnabled } from './index';

describe('manifest resolution', () => {
  it('resolves volvo as the active client', () => {
    const manifest = getManifest();
    expect(manifest.clientId).toBe('volvo');
    expect(getNatures()).toHaveLength(5);
    expect(manifest.copy.select.title).toBeTruthy();
  });

  it('resolves theme from client manifest', () => {
    expect(getManifest().theme).toBe('volvo');
  });

  it('provides kiosk idle for MUPI reset', () => {
    expect(getManifest().features.kioskIdle).toBe(true);
    expect(isFeatureEnabled('kioskIdle')).toBe(true);
  });
});
