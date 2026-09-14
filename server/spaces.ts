/**
 * DigitalOcean Spaces (S3-compatible) upload for shareable portraits.
 * Credentials stay on the server. Objects are public so a phone can open the QR URL.
 */
import { PutObjectCommand, S3Client, type ObjectCannedACL } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

export type SpacesConfig = {
  bucket: string;
  endpoint: string;
  region: string;
  cdnBase: string;
  prefix: string;
  accessKeyId: string;
  secretAccessKey: string;
};

const MAX_PORTRAIT_BYTES = 12 * 1024 * 1024;

export function regionFromEndpoint(endpoint: string): string {
  try {
    const host = new URL(endpoint).hostname;
    const region = host.split('.')[0];
    return region || 'ams3';
  } catch {
    return 'ams3';
  }
}

export function readSpacesConfig(env: NodeJS.ProcessEnv = process.env): SpacesConfig | null {
  const accessKeyId = env.DO_SPACES_KEY?.trim();
  const secretAccessKey = env.DO_SPACES_SECRET?.trim();
  const bucket = env.DO_SPACES_BUCKET?.trim();
  const endpoint = env.DO_SPACES_ENDPOINT?.trim();
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;

  const region = env.DO_SPACES_REGION?.trim() || regionFromEndpoint(endpoint);
  const prefix = (env.DO_SPACES_PREFIX?.trim() || 'volvo-jardin/portraits').replace(
    /^\/+|\/+$/g,
    '',
  );
  const cdnBase = (
    env.DO_SPACES_CDN?.trim() || `https://${bucket}.${region}.cdn.digitaloceanspaces.com`
  ).replace(/\/+$/, '');

  return { bucket, endpoint, region, cdnBase, prefix, accessKeyId, secretAccessKey };
}

export function parseDataUrl(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
  extension: string;
} {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) {
    throw new Error('Expected a base64 data URL');
  }
  const contentType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) {
    throw new Error('Empty image');
  }
  if (buffer.length > MAX_PORTRAIT_BYTES) {
    throw new Error('Portrait exceeds upload size limit');
  }
  const extension = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
      ? 'webp'
      : 'jpg';
  return { buffer, contentType, extension };
}

export function buildObjectKey(
  prefix: string,
  extension: string,
  id: string = randomUUID(),
  now: Date = new Date(),
): string {
  const date = now.toISOString().slice(0, 10);
  return `${prefix}/${date}/${id}.${extension}`;
}

export function buildCdnUrl(cdnBase: string, key: string): string {
  return `${cdnBase.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

export type PutPortrait = (
  config: SpacesConfig,
  key: string,
  body: Buffer,
  contentType: string,
) => Promise<void>;

function createClient(config: SpacesConfig): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Spaces rejects AWS SDK default CRC checksum headers.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

export const putPortraitObject: PutPortrait = async (config, key, body, contentType) => {
  const client = createClient(config);
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ACL: 'public-read' as ObjectCannedACL,
        ContentType: contentType,
        CacheControl: 'public, max-age=604800',
        ContentDisposition: 'inline',
      }),
    );
  } finally {
    client.destroy();
  }
};

export async function uploadPortraitToSpaces(
  dataUrl: string,
  config: SpacesConfig | null = readSpacesConfig(),
  put: PutPortrait = putPortraitObject,
): Promise<string> {
  if (!config) {
    throw new Error('DigitalOcean Spaces is not configured');
  }
  const { buffer, contentType, extension } = parseDataUrl(dataUrl);
  const key = buildObjectKey(config.prefix, extension);
  await put(config, key, buffer, contentType);
  return buildCdnUrl(config.cdnBase, key);
}
