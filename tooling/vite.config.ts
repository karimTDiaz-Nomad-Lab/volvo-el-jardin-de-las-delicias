import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { REGISTERED_CLIENT_IDS } from '../config/registry';

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolingDir, '..');

const registeredClients = new Set(REGISTERED_CLIENT_IDS);
const requestedClient = process.env.VITE_CLIENT_ID?.trim() || 'volvo';

if (!registeredClients.has(requestedClient)) {
  const known = [...registeredClients].sort().join(', ');
  throw new Error(
    `[vite] Unknown VITE_CLIENT_ID "${requestedClient}". Registered clients: ${known}. ` +
      'Set VITE_CLIENT_ID to a client in config/registry.ts before building.',
  );
}

const buildClientId = requestedClient;

export default defineConfig({
  root,
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
      '@config': path.join(root, 'config'),
      '@client-manifest': path.join(root, `config/clients/${buildClientId}/manifest.ts`),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'config/**/*.test.ts', 'server/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
