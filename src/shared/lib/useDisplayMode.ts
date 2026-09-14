import { useEffect, useState } from 'react';
import { applyDisplayMode, getPreferredDisplayMode, type DisplayMode } from './display';

export function useDisplayMode(): DisplayMode {
  const [mode] = useState<DisplayMode>(getPreferredDisplayMode);

  useEffect(() => {
    applyDisplayMode(getPreferredDisplayMode());
  }, []);

  return mode;
}
