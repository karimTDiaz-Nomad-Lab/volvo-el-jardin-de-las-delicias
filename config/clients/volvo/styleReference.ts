/**
 * Lighting-integration lock prepended to every nature brief.
 * No campaign look photo is attached — identity comes only from the booth capture.
 */

export function buildStyleLookInstruction(lookName: string): string {
  return `Reconstruye el retrato en el mundo de ${lookName} como UNA sola fotografía real tomada ahí, no como un recorte pegado sobre un fondo.`;
}
