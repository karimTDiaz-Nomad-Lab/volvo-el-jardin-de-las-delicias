import type { PlatformTheme } from '@config/types';

export const APP_THEME = 'volvo' as const;

/** Sets document root theme skin from client manifest. */
export function initAppTheme(theme: PlatformTheme = APP_THEME): void {
  document.documentElement.dataset.theme = theme;
}
