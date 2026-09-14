# Auditoria profunda de arquitectura y composicion - virtualFit

## Auditoria: fidelidad de prenda vs "textura" (solo lectura, 2026-05-27)

Sintoma reportado: el try-on a veces **aplica textura/estilo** de la referencia en lugar de **copiar la prenda** (silueta, color, logo, patron) de forma fiel.

Evidencia revisada: [`services/gemini-image.service.ts`](../services/gemini-image.service.ts), [`lib/garmentFile.ts`](../lib/garmentFile.ts), [`lib/framing.ts`](../lib/framing.ts), [`hooks/useTryOnSession.ts`](../hooks/useTryOnSession.ts), [`config/wardrobe.ts`](../config/wardrobe.ts).

---

### P0 — Prompt de try-on orientado a "realismo de tela", no a transferencia de producto

**Hallazgo:** `generateVirtualTryOnImage` usa lenguaje generativo y de material, no de copia exacta de SKU.

Fragmento actual (`gemini-image.service.ts`):
- "Generate one realistic incremental virtual try-on"
- "Keep garment realism with accurate **fabric behavior, folds, and shadows**"
- Slot rules del tipo "Apply only the top garment area" (zona, no objeto de catalogo)

**Efecto:** el modelo tiende a **reinterpretar** la prenda (color/patron aproximado) en vez de transferir el diseno del asset.

**Recomendacion (prompt):**
- Sustituir "apply/fabric behavior" por instrucciones explicitas: copiar **silueta, corte, color, logos, graficos, costuras** del segundo input.
- Anadir: "Do not overlay texture only; render the actual garment design worn on the model."
- Anadir: "Treat the second image as a **product catalog reference**; reproduce the garment, not the photo style."

---

### P0 — Referencia de prenda sin preprocesado (mockup con fondo)

**Hallazgo:** [`lib/garmentFile.ts`](lib/garmentFile.ts) envia el JPG/PNG del wardrobe **tal cual** (canvas full frame). No hay:
- recorte de prenda,
- eliminacion de fondo,
- normalizacion de encuadre del producto.

**Contexto de assets:** [`config/wardrobe.ts`](../config/wardrobe.ts) + `public/garments/` — mockups con fondos/gradientes de catálogo.

**Efecto:** Gemini puede **confundir fondo del mockup con patron de tela** o "texturizar" la zona del cuerpo con colores del card.

**Recomendacion (no codigo aun):**
- Preprocesar garment input (mask/alpha o crop tight) antes de `fileToPart`.
- En prompt: "Ignore backdrop, shadows, and presentation surface of the product photo; use only the garment pixels."

---

### P1 — Pipeline secuencial acumula deriva visual

**Hallazgo:** [`hooks/useTryOnSession.ts`](hooks/useTryOnSession.ts) compone en cadena: cada capa usa la **salida IA anterior** como modelo (`composedImage` → siguiente `generateVirtualTryOnImage`).

**Efecto:** en `top → bottom → hat`, errores tempranos (top aproximado) se **refuerzan** en capas siguientes; hats/tops pueden verse como "parche de textura" sobre una base ya degradada.

**Recomendacion:**
- Evaluar composicion desde **base model + plan completo** (o re-aplicar desde base con estado de slots en prompt).
- Mantener cache por firma, pero invalidar si el prompt/capa cambia reglas de fidelidad.

---

### P1 — Post-procesado de framing despues de cada generacion

**Hallazgo:** cada salida pasa por `applyFramingProfileToDataUrl` ([`lib/framing.ts`](lib/framing.ts)): reescala con cover, fondo `#f5f5f7`, JPEG ~0.97.

**Efecto:** no explica solo el bug de "textura", pero puede **suavizar detalle** de logos/bordes y hacer que la prenda parezca "pintada" tras varias iteraciones.

**Recomendacion:**
- Separar framing estricto del modelo base vs capas de ropa (o reducir recompression en pasos intermedios).
- Validar si framing post cada capa es necesario o solo al final.

---

### P1 — Conflicto de prioridades en el prompt (framing vs prenda)

**Hallazgo:** el suffix `buildLockedFramingPromptSuffix` es largo y dominante (~figura, canvas, headroom, camera). Las reglas de prenda compiten por atencion con restricciones de encuadre.

**Efecto:** el modelo prioriza **pose/escala/estudio** sobre fidelidad de producto.

**Recomendacion:**
- Bloque 1 (product fidelity), bloque 2 (framing lock), bloque 3 (preserve other layers).
- Acortar framing a 1-2 lineas en try-on si el perfil ya esta aplicado en imagen.

---

### P2 — Instrucciones por slot incompletas para "copiar objeto"

| Slot | Gap |
|------|-----|
| `tops` / `bottoms` | Dice "garment area", no "exact shirt/pants from reference" |
| `kits` | "Coordinated outfit layer" invita a **outfit generico**, no kit exacto del mockup |
| `hats` | Preserva otras capas (bien) pero no exige forma/color exactos del hat |

**Recomendacion:** plantilla por slot con checklist: shape, color, branding, placement, occlusion rules.

---

### P2 — Config del modelo

**Hallazgo:** [`services/gemini-client.ts`](services/gemini-client.ts) — `responseModalities: [IMAGE, TEXT]` en try-on.

**Efecto:** bajo riesgo directo, pero aumenta variabilidad vs imagen-only.

**Recomendacion:** probar `IMAGE`-only en benchmark si la API lo permite para edicion.

---

### P2 — Documentacion desalineada

**Hallazgo:** [`PROJECT.md`](PROJECT.md) aun menciona `lib/imageResize.ts` en el contrato Gemini; runtime usa `lib/framing.ts`.

**Efecto:** decisiones de equipo basadas en docs incorrectos.

---

## Prompts (historial A/B)

- El A/B de prompts (variantes `a`/`b` + `VITE_TRYON_PROMPT_VARIANT`) se cerró: la variante B (product-fidelity) ganó y vive como archivo único en [`src/services/gemini-image.prompts.ts`](../src/services/gemini-image.prompts.ts), combinada con el lock cuantitativo de encuadre (`buildLockedFramingPromptSuffix`).

## Checklist ejecutable (pendiente)

- [x] Primer draft en variante **B** — validado y promovido a prompt único (product-fidelity + framing lock).
- [ ] Anadir reglas explicitas: ignorar fondo del mockup; copiar silueta/color/logo/patron.
- [ ] Refinar prompts por slot (`tops`, `bottoms`, `kits`, `hats`) con vocabulario de catalogo.
- [ ] Evaluar preprocesado de garment reference (crop/mask) antes de enviar a Gemini.
- [ ] Evaluar deriva del pipeline secuencial (recompose desde base vs cadena sobre salida previa).
- [ ] Revisar si `applyFramingProfileToDataUrl` debe correr en cada capa o solo al final.
- [ ] Benchmark A/B de prompts en flujo: `top -> bottom -> hat` y `hat -> top -> bottom`.
- [ ] Actualizar `PROJECT.md` contrato Gemini (framing vs imageResize).
