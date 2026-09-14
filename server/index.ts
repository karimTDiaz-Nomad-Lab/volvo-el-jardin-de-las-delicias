import './loadEnv';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { apiAuthMiddleware, assertProductionApiAuthConfigured } from './middleware/auth';
import { apiRateLimitMiddleware } from './middleware/rateLimit';
import { createGenerateRouter } from './routes/generate';
import { createShareRouter } from './routes/share';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function getLocalIP(): string | null {
  try {
    const nets = os.networkInterfaces();
    if (!nets) return null;
    for (const name of Object.keys(nets)) {
      const net = nets[name];
      if (!net) continue;
      for (const iface of net) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function startServer() {
  assertProductionApiAuthConfigured();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  app.use(express.json({ limit: '50mb' }));

  app.use(
    '/api',
    apiAuthMiddleware,
    apiRateLimitMiddleware,
    createGenerateRouter(),
    createShareRouter(),
  );

  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    // Only resolve Vite in development. In production DO prunes devDependencies.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: projectRoot,
      server: {
        middlewareMode: true,
        hmr: { server: httpServer, port: PORT, clientPort: PORT },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`\n  Local:   http://localhost:${PORT}`);
    if (ip) console.log(`  Network: http://${ip}:${PORT}\n`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
