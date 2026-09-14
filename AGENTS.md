# AGENTS.md — El jardín de las delicias

Photo booth MUPI Volvo: elegir naturaleza → capturar retrato → Gemini aplica el prompt de esa naturaleza.

## Flujo

1. `NatureSelect` — 5 naturalezas (`config/clients/volvo/natures.ts`)
2. `CameraCapture` — foto de 1 a 4 personas
3. `generateNaturePortrait` — una llamada a `/api/generate` con el prompt indexado
4. `ResultScreen` — resultado a pantalla completa + QR (Spaces CDN)

## Dónde editar

| Área | Regla |
|------|--------|
| `config/clients/volvo/` | Copy, naturalezas y prompts. No hardcodear textos en TSX. |
| `src/features/` | UI de las 3 fases (`natures`, `capture`, `result`, `session`) |
| `src/services/` | Una generación: foto + prompt. Share QR via `/api/share`. |
| `server/` | Proxy Gemini + subida a DigitalOcean Spaces. Las claves no salen del servidor. |
| `public/referencias_tarjetas/` | Miniaturas de las 5 tarjetas + fondo de selección |

No reintroducir wardrobe, eyewear, vídeo Veo ni beacon.

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run eslint
npm test
npm run verify-clients
npm run test:e2e
```
