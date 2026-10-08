import { describe, expect, it } from 'vitest';
import {
  buildCdnUrl,
  buildObjectKey,
  buildShareId,
  buildSharePageKey,
  parseDataUrl,
  readSpacesConfig,
  regionFromEndpoint,
  uploadPortraitToSpaces,
} from './spaces';

const TINY_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wAAAAD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAFH/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPwB//9k=';

describe('DigitalOcean Spaces portrait upload', () => {
  it('reads region from the Spaces endpoint host', () => {
    expect(regionFromEndpoint('https://ams3.digitaloceanspaces.com')).toBe('ams3');
  });

  it('returns null when Spaces credentials are missing', () => {
    expect(
      readSpacesConfig({
        DO_SPACES_BUCKET: 'no-madproject',
        DO_SPACES_ENDPOINT: 'https://ams3.digitaloceanspaces.com',
      }),
    ).toBeNull();
  });

  it('builds config and CDN base from the summit-booth env shape', () => {
    const config = readSpacesConfig({
      DO_SPACES_KEY: 'key',
      DO_SPACES_SECRET: 'secret',
      DO_SPACES_BUCKET: 'no-madproject',
      DO_SPACES_ENDPOINT: 'https://ams3.digitaloceanspaces.com',
    });
    expect(config).toMatchObject({
      bucket: 'no-madproject',
      region: 'ams3',
      prefix: 'volvo-jardin/portraits',
      cdnBase: 'https://no-madproject.ams3.cdn.digitaloceanspaces.com',
    });
  });

  it('parses a JPEG data URL', () => {
    const parsed = parseDataUrl(TINY_JPEG);
    expect(parsed.contentType).toBe('image/jpeg');
    expect(parsed.extension).toBe('jpg');
    expect(parsed.buffer.length).toBeGreaterThan(0);
  });

  it('keeps portraits off the Space root so the static site is not overwritten', () => {
    expect(buildObjectKey('volvo-jardin/portraits', 'jpg', 'abc', new Date('2026-09-08T12:00:00Z'))).toBe(
      'volvo-jardin/portraits/2026-09-08/abc.jpg',
    );
  });

  it('builds a short QR page key beside the portrait prefix', () => {
    expect(buildSharePageKey('volvo-jardin/portraits', 'a1b2c3d4e5')).toBe('volvo-jardin/q/a1b2c3d4e5');
    expect(buildSharePageKey('portraits', 'abc')).toBe('portraits/q/abc');
  });

  it('builds a 10-character hex share id', () => {
    expect(buildShareId()).toMatch(/^[0-9a-f]{10}$/);
  });

  it('builds the CDN URL used by the QR', () => {
    expect(
      buildCdnUrl(
        'https://no-madproject.ams3.cdn.digitaloceanspaces.com',
        'volvo-jardin/portraits/2026-09-08/abc.jpg',
      ),
    ).toBe(
      'https://no-madproject.ams3.cdn.digitaloceanspaces.com/volvo-jardin/portraits/2026-09-08/abc.jpg',
    );
  });

  it('uploads the 4×6 JPEG and a save page, then returns the HTML QR URL', async () => {
    const config = readSpacesConfig({
      DO_SPACES_KEY: 'key',
      DO_SPACES_SECRET: 'secret',
      DO_SPACES_BUCKET: 'no-madproject',
      DO_SPACES_ENDPOINT: 'https://ams3.digitaloceanspaces.com',
    });
    if (!config) throw new Error('expected Spaces config in test');
    const puts: Array<{ key: string; contentType: string; body: Buffer }> = [];
    const put = async (
      _config: typeof config,
      key: string,
      body: Buffer,
      contentType: string,
    ) => {
      puts.push({ key, contentType, body });
    };
    const url = await uploadPortraitToSpaces(TINY_JPEG, config, put);
    expect(puts).toHaveLength(2);
    expect(puts[0]?.key).toMatch(/volvo-jardin\/portraits\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{10}\.jpg$/);
    expect(puts[0]?.contentType).toBe('image/jpeg');
    expect(puts[1]?.key).toMatch(/^volvo-jardin\/q\/[0-9a-f]{10}$/);
    expect(puts[1]?.contentType).toBe('text/html; charset=utf-8');
    expect(puts[1]?.body.toString('utf8')).toContain('.jpg');
    expect(puts[1]?.body.toString('utf8')).toContain('Guardar en galería');
    expect(url).toMatch(
      /^https:\/\/no-madproject\.ams3\.cdn\.digitaloceanspaces\.com\/volvo-jardin\/q\/[0-9a-f]{10}$/,
    );
    const jpgId = puts[0]?.key.match(/([0-9a-f]{10})\.jpg$/)?.[1];
    const htmlId = puts[1]?.key.match(/\/q\/([0-9a-f]{10})$/)?.[1];
    expect(htmlId).toBe(jpgId);
  });
});
