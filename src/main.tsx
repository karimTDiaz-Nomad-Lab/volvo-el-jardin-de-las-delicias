/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';
import App from './app/App';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { applyDisplayMode, getPreferredDisplayMode } from '@/shared/lib/display';
import { initAppTheme } from '@/shared/lib/theme';
import { SfxProvider } from '@/shared/context/SfxProvider';
import { getManifest } from '@config';

const manifest = getManifest();
applyDisplayMode(getPreferredDisplayMode());
initAppTheme(manifest.theme);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SfxProvider>
        <App />
      </SfxProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
