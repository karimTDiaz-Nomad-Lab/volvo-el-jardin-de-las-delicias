import { describe, expect, it } from 'vitest';
import { REGISTERED_CLIENT_IDS, resolveManifestForClient } from './registry';

const NATURE_IDS = [
  'responsable',
  'eficiente',
  'cuidadosa',
  'respetuosa',
  'consciente',
] as const;

describe('client pack isolation', () => {
  it('registers the Volvo photo booth pack', () => {
    expect(REGISTERED_CLIENT_IDS).toEqual(['volvo']);
  });

  it('indexes five natures with prompts and card assets', () => {
    const manifest = resolveManifestForClient('volvo');
    expect(manifest.theme).toBe('volvo');
    expect(manifest.natures.map((nature) => nature.id)).toEqual([...NATURE_IDS]);
    for (const nature of manifest.natures) {
      expect(nature.title.length).toBeGreaterThan(0);
      expect(nature.tagline.length).toBeGreaterThan(0);
      expect(nature.thumbSrc).toBe(`/referencias_tarjetas/${nature.id}.jpg`);
      expect(nature.prompt).toContain('CRITICAL INTEGRATION RULE');
      expect(nature.prompt.length).toBeGreaterThan(200);
      expect(nature.styleRefs.individual).toMatch(/^\/referencia_producto_final\//);
      if (nature.id === 'cuidadosa') {
        expect(nature.styleRefs.group).toBeUndefined();
      } else {
        expect(nature.styleRefs.group).toMatch(/^\/referencia_producto_final\//);
      }
    }
    expect(manifest.natures.map((nature) => nature.overlayInk)).toEqual([
      'black',
      'black',
      'black',
      'white',
      'white',
    ]);
    expect(manifest.brand.selectBackgroundSrc).toBe('/ui/fondo_journey.png');
    expect(manifest.brand.logoSrc).toBe('/ui/volvo_logo_negro.svg?v=3');
    expect(manifest.brand.logoOnDarkSrc).toBe('/ui/volvo_logo_blanco.svg');
  });
});
