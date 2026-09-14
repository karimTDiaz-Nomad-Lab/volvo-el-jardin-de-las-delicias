import { describe, expect, it } from 'vitest';
import {
  buildCdnUrl,
  buildObjectKey,
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

  it('uploads and returns the public CDN URL', async () => {
    const config = readSpacesConfig({
      DO_SPACES_KEY: 'key',
      DO_SPACES_SECRET: 'secret',
      DO_SPACES_BUCKET: 'no-madproject',
      DO_SPACES_ENDPOINT: 'https://ams3.digitaloceanspaces.com',
    });
    const put = async () => undefined;
    const url = await uploadPortraitToSpaces(TINY_JPEG, config, put);
    expect(url).toMatch(
      /^https:\/\/no-madproject\.ams3\.cdn\.digitaloceanspaces\.com\/volvo-jardin\/portraits\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]+\.jpg$/,
    );
  });
});
