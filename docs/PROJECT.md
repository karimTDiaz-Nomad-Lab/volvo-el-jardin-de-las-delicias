# El jardín de las delicias

Photo booth MUPI Volvo en 3 fases.

1. **Selección** — `src/features/natures/NatureSelect.tsx`  
   Cinco naturalezas en `config/clients/volvo/natures.ts`. Cada una lleva su prompt indexado.
2. **Captura** — `src/features/capture/CameraCapture.tsx`  
   1 a 4 personas. Confirmación y aviso de calidad.
3. **Resultado** — `generateNaturePortrait` → `ResultScreen`  
   Una llamada a `/api/generate` con la foto + el prompt de la naturaleza elegida.

Estado: `src/features/session/usePhotoBoothSession.ts`.  
Claves Gemini solo en servidor. Aspecto de salida: 2:3 (4×6 Kodak).
