import activeManifest from '@client-manifest';
import type {
  DisplayMode,
  NatureTheme,
  PlatformCopy,
  PlatformFeatures,
  PlatformManifest,
} from './types';

export type {
  DisplayMode,
  NatureId,
  NatureStyleRefs,
  NatureTheme,
  PlatformBrand,
  PlatformCopy,
  PlatformDisplay,
  PlatformFeatures,
  PlatformManifest,
  PlatformTheme,
} from './types';

export { REGISTERED_CLIENT_IDS, resolveManifestForClient } from './registry';

function resolveDisplayMode(value: string | undefined, fallback: DisplayMode): DisplayMode {
  const trimmed = value?.trim();
  if (trimmed === 'mupi' || trimmed === 'desktop') return trimmed;
  return fallback;
}

let _resolved: PlatformManifest | null = null;

/** Resolved manifest for this build (active client pack + `VITE_*` overrides). */
export function getManifest(): PlatformManifest {
  if (_resolved) return _resolved;

  const clientId = import.meta.env.VITE_CLIENT_ID?.trim() || activeManifest.clientId;

  const resolved: PlatformManifest = {
    ...activeManifest,
    clientId,
    display: {
      ...activeManifest.display,
      defaultMode: resolveDisplayMode(
        import.meta.env.VITE_DISPLAY,
        activeManifest.display.defaultMode,
      ),
    },
  };

  _resolved = resolved;
  return resolved;
}

export function getNatures(): NatureTheme[] {
  return getManifest().natures;
}

export function getCopy(): PlatformCopy {
  return getManifest().copy;
}

export function getDefaultDisplayMode(): DisplayMode {
  return getManifest().display.defaultMode;
}

export function isFeatureEnabled(feature: keyof PlatformFeatures): boolean {
  return Boolean(getManifest().features[feature]);
}

/** @internal Reset cached manifest (unit tests only). */
export function __resetManifestCacheForTests(): void {
  _resolved = null;
}
