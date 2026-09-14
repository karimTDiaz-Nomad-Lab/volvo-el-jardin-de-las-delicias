/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const dataUrlToParts = (dataUrl: string) => {
  const arr = dataUrl.split(',');
  if (arr.length < 2) throw new Error('Invalid data URL');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch?.[1]) throw new Error('Could not parse MIME type from data URL');
  return { mimeType: mimeMatch[1], data: arr[1] };
};

export const dataUrlToPart = (dataUrl: string) => {
  const { mimeType, data } = dataUrlToParts(dataUrl);
  return { inlineData: { mimeType, data } };
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const fileToPart = async (file: File) => {
  const dataUrl = await fileToDataUrl(file);
  const { mimeType, data } = dataUrlToParts(dataUrl);
  return { inlineData: { mimeType, data } };
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const base64ToBlob = (base64Data: string, mimeType: string) => {
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the look image for local loop rendering.'));
    image.src = src;
  });

export const getSupportedRecorderMimeType = () => {
  const candidates = [
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
};
