import volvoManifest from './clients/volvo/manifest';
import type { PlatformManifest } from './types';

/**
 * Full client registry (dev tooling, tests, verify script).
 * Production bundles import only `@client-manifest` for the active VITE_CLIENT_ID.
 */
export const clientManifests: Record<string, PlatformManifest> = {
  volvo: volvoManifest,
};

export const REGISTERED_CLIENT_IDS = Object.keys(clientManifests);

export function resolveManifestForClient(clientId: string): PlatformManifest {
  const base = clientManifests[clientId];
  if (!base) {
    throw new Error(`[config] Unknown clientId "${clientId}"`);
  }
  return { ...base, clientId };
}
