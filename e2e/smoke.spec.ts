import { test, expect } from '@playwright/test';

const MOCK_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function stubCamera(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#c8c8c8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const stream = canvas.captureStream(30);
    navigator.mediaDevices.getUserMedia = async () => stream;
  });
}

async function mockGenerateApi(page: import('@playwright/test').Page) {
  await page.route('**/api/generate', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ image: MOCK_IMAGE_DATA_URL }),
    });
  });
  await page.route('**/api/share', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        shareUrl:
          'https://no-madproject.ams3.cdn.digitaloceanspaces.com/volvo-jardin/portraits/e2e.jpg',
      }),
    });
  });
}

test.describe('volvo photo booth smoke', () => {
  test('landing then select screen renders five natures', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /comenzar/i })).toBeVisible();
    await page.getByRole('button', { name: /comenzar/i }).click();
    await expect(
      page.getByRole('heading', { name: /elige la naturaleza/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /responsable/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /consciente/i })).toBeVisible();
  });

  test('api rejects unauthenticated generate when API_KEY is set', async ({ request }) => {
    const res = await request.post('/api/generate', {
      data: { parts: [{ text: 'ping' }] },
    });
    expect(res.status()).toBe(401);
  });

  test('nature select → capture → mocked result', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    await stubCamera(page);
    await mockGenerateApi(page);
    await page.goto('/');

    await page.getByRole('button', { name: /comenzar/i }).click();
    await page.getByRole('button', { name: /responsable/i }).click();
    await expect(page.getByRole('button', { name: /estoy listo/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /estoy listo/i }).click();
    await expect(page.getByRole('button', { name: 'Hacer foto' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Hacer foto' }).click();
    await expect(page.getByRole('button', { name: /sí, crear mi retrato/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /sí, crear mi retrato/i }).click();

    await expect(page.getByRole('button', { name: 'FINALIZAR' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/escanea el qr/i)).toBeVisible();
  });
});
