import { describe, expect, it } from 'vitest';
import { buildNatureGenerationParts } from './gemini-image.service';

const inline = (label: string) => ({
  inlineData: { mimeType: 'image/jpeg', data: label },
});

describe('buildNatureGenerationParts', () => {
  it('sends only the user photo and the nature prompt', () => {
    const parts = buildNatureGenerationParts({
      userPart: inline('user'),
      prompt: 'NATURE BRIEF',
    });

    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual(inline('user'));
    expect(parts[1]).toEqual({ text: 'NATURE BRIEF' });
  });
});
