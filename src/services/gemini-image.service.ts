/**
 * Single-shot nature portrait: booth photo + indexed prompt.
 */

import {
  createFramingProfileFromDataUrl,
  downscaleDataUrlForTransport,
  normalizePortraitInputFile,
} from '@/core/media/framing';
import { generateImageViaApi, type GenerateContentPart } from './gemini-client';
import { dataUrlToPart } from './media-codec';

export function buildNatureGenerationParts({
  userPart,
  prompt,
}: {
  userPart: GenerateContentPart;
  prompt: string;
}): GenerateContentPart[] {
  return [userPart, { text: prompt }];
}

export const generateNaturePortrait = async (
  userImage: File,
  prompt: string,
): Promise<string> => {
  const normalizedUserImage = await normalizePortraitInputFile(userImage);
  const transportImage = await downscaleDataUrlForTransport(normalizedUserImage);
  const raw = await generateImageViaApi(
    buildNatureGenerationParts({
      userPart: dataUrlToPart(transportImage),
      prompt,
    }),
  );
  const { dataUrl } = await createFramingProfileFromDataUrl(raw);
  return dataUrl;
};
