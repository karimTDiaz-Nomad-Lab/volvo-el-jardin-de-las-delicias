/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GenerateContentResponse } from '@google/genai';
import { messageForFinishReason } from '../core/ai/imageGenErrors';

export type GeminiImageFailureMeta = {
  finishReason?: string;
  finishMessage?: string;
  blockReason?: string;
  blockReasonMessage?: string;
};

export class GeminiImageFailure extends Error {
  readonly finishReason?: string;
  readonly finishMessage?: string;
  readonly blockReason?: string;
  readonly blockReasonMessage?: string;
  readonly blocked?: boolean;
  readonly noImage: boolean;

  constructor(message: string, meta: GeminiImageFailureMeta & { blocked?: boolean } = {}) {
    super(message);
    this.name = 'GeminiImageFailure';
    this.finishReason = meta.finishReason;
    this.finishMessage = meta.finishMessage;
    this.blockReason = meta.blockReason;
    this.blockReasonMessage = meta.blockReasonMessage;
    this.blocked = meta.blocked;
    this.noImage = true;
  }
}

function logImageFailure(meta: GeminiImageFailureMeta): void {
  console.warn('[gemini-image] generation produced no image', {
    finishReason: meta.finishReason ?? null,
    finishMessage: meta.finishMessage ?? null,
    blockReason: meta.blockReason ?? null,
    blockReasonMessage: meta.blockReasonMessage ?? null,
  });
}

export const extractImageDataUrl = (response: GenerateContentResponse): string => {
  if (response.promptFeedback?.blockReason) {
    const { blockReason, blockReasonMessage } = response.promptFeedback;
    const meta = {
      blockReason,
      blockReasonMessage: blockReasonMessage || undefined,
      blocked: true as const,
    };
    logImageFailure(meta);
    throw new GeminiImageFailure(
      `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`.trim(),
      meta,
    );
  }

  for (const candidate of response.candidates ?? []) {
    const imagePart = candidate.content?.parts?.find((part) => part.inlineData);
    if (imagePart?.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  const firstCandidate = response.candidates?.[0];
  const finishReason = firstCandidate?.finishReason
    ? String(firstCandidate.finishReason)
    : undefined;
  const finishMessage =
    typeof firstCandidate?.finishMessage === 'string'
      ? firstCandidate.finishMessage.trim()
      : undefined;

  if (finishReason && finishReason !== 'STOP') {
    const meta = { finishReason, finishMessage };
    logImageFailure(meta);
    throw new GeminiImageFailure(messageForFinishReason(finishReason, finishMessage), meta);
  }

  const textFeedback = response.text?.trim();
  const meta = {
    finishReason: finishReason ?? 'STOP',
    finishMessage,
  };
  logImageFailure(meta);
  throw new GeminiImageFailure(
    `The AI model did not return an image. ` +
      (textFeedback
        ? `The model responded with text: "${textFeedback}"`
        : 'This can happen due to safety filters or if the request is too complex. Please try a different image.'),
    meta,
  );
};
