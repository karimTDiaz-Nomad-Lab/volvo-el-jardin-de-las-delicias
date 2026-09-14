import { Router, type Request, type Response } from 'express';
import { readSpacesConfig, uploadPortraitToSpaces } from '../spaces';

export function createShareRouter(): Router {
  const router = Router();
  const config = readSpacesConfig();

  if (config) {
    console.info(
      `[Spaces] Portrait share enabled bucket=${config.bucket} prefix=${config.prefix}`,
    );
  } else {
    console.info('[Spaces] Portrait share disabled — missing DO_SPACES_KEY / DO_SPACES_SECRET');
  }

  router.post('/share', async (req: Request, res: Response) => {
    if (!config) {
      return res.status(503).json({ error: 'Sharing is not configured', retryable: false });
    }

    const image = req.body?.image;
    if (typeof image !== 'string' || !image.startsWith('data:')) {
      return res.status(400).json({ error: 'Missing image', retryable: false });
    }

    try {
      const shareUrl = await uploadPortraitToSpaces(image, config);
      res.json({ shareUrl });
    } catch (err) {
      console.error('[Spaces] upload failed', err);
      res.status(502).json({ error: 'Could not upload portrait', retryable: true });
    }
  });

  return router;
}
