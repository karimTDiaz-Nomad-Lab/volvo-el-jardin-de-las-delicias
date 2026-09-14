# Guía de personalización de cliente (white-label)

Pasos para adaptar **textos, logo, colores y armario** sin tocar el código de producto. Cada despliegue es un **client pack** en `config/clients/<id>/` más assets en `public/`.

Referencias: [TEMPLATE_BLUEPRINT.md](./TEMPLATE_BLUEPRINT.md) · [STYLING.md](./STYLING.md) · [CLIENT_SMOKE.md](./CLIENT_SMOKE.md) · [deploy.md](./deploy.md)

---

## 1. Qué se puede customizar

| Campo / recurso | Archivo(s) | Dónde aparece en pantalla |
|-----------------|------------|---------------------------|
| **Textos landing** (`copy.landing.*`) | `config/clients/<id>/copy.ts` | Pantalla inicial: eyebrow, título en dos líneas, subtítulo, nota de privacidad, micro-líneas decorativas, frases rotativas de estado, CTA y CTA ocupado (`StartScreen` + `BrandMasthead`) |
| **Textos generación** (`copy.generating.*`) | `copy.ts` | Tras capturar foto: eyebrow, título, subtítulo, líneas de progreso rotativas, textos de error y botón reintentar |
| **Pie** (`copy.footer.line`) | `copy.ts` | `Footer` en landing (soporta `{year}` → año actual) |
| **Logo** (`brand.logoSrc`, `brand.logoAlt`) | `config/clients/<id>/manifest.ts` + `public/brand/<id>/logo.png` | Logo en hero de landing (`BrandMasthead`); marca compacta en estudio (`App.tsx`) |
| **Nombre de producto** (`brand.productName`) | `manifest.ts` | Contrato del pack y tests; no se muestra hoy en UI principal |
| **Powered by** (`brand.poweredBy`, opcional) | `manifest.ts` | Reservado en manifest; el pie usa `copy.footer.line` |
| **Colores / superficies** (`theme`) | `manifest.ts` → `src/styles/themes/<theme>.css` | `<html data-theme="...">` vía `initAppTheme()` — fondos, acento, rail, tipografía semántica en toda la app |
| **Modo pantalla** (`display.defaultMode`) | `manifest.ts` (override `VITE_DISPLAY` en `.env.local`) | `mupi` (espejo retail) vs `desktop` — layout, footer, tipografía MUPI |
| **Features** (`videoLoop`, `wardrobeFeed`, `kioskIdle`) | `manifest.ts` (+ `VITE_WARDROBE_FEED`) | Bucle de vídeo en canvas; mezcla tops remotos demo; reinicio por inactividad en MUPI |
| **Armario** (`wardrobe[]`) | `config/clients/<id>/wardrobe.ts` + `public/garments/<id>/` | Rail de prendas: miniaturas, nombre bajo tile, categorías tops/bottoms/kits/hats (`WardrobePanel`, `LookStack`) |
| **Identificador** (`clientId`) | `manifest.ts` | Rutas de assets (`/brand/<id>/`, `/garments/<id>/`) |

Los nombres de categoría del rail (**Tops**, **Bottoms**, etc.) están en código (`WardrobePanel`), no en `copy.ts`. El título del rail **"Your look"** está en `App.tsx` (inglés fijo hasta nueva feature de producto).

---

## 2. Qué NO tocar

| Área | Motivo |
|------|--------|
| `src/app/App.tsx` | Shell de estudio, flujo captura → rail; no es capa de marca |
| `src/features/**` | Flujos de cámara, generación Gemini, canvas, try-on |
| `server/**` | Proxy Gemini y auth `/api/*` — solo si añades producto nuevo |
| `src/core/**` | Lógica de dominio sin React |
| `tooling/**` (salvo scripts documentados) | Pipeline de build; usar `npm run new-client`, no editar a mano salvo excepción |
| `integrations/**` | Adaptadores opcionales; no importar desde `App.tsx` sin flag en manifest |

**Regla:** cadenas visibles al usuario van a `copy.ts` o `manifest.brand`, nunca hardcodeadas en TSX.

---

## 3. Setup de desarrollo (una sola vez)

Objetivo: iterar con **hot reload**, sin ciclo `build` por cada cambio de texto o color.

1. **Dependencias**
   ```bash
   npm install
   cp .env.example .env.local
   ```

2. **Claves locales** (en `.env.local`)
   - `GOOGLE_API_KEY` o `GEMINI_API_KEY` — servidor, obligatorio para probar generación real.
   - `VITE_CLIENT_ID=<tu-cliente>` — debe existir en `config/registry.ts` (p. ej. `nomad` o el id que hayas creado con `new-client`).

3. **Arrancar dev** (Express + Vite, puerto **8080**)
   ```bash
   npm run dev
   ```
   Abre **http://localhost:8080** en Chrome o Safari (cámara en el mismo equipo).

4. **Hot reload**
   - Editar `copy.ts`, `wardrobe.ts`, `manifest.ts`, CSS de tema o assets en `public/` → la página se actualiza al guardar.
   - **No hace falta** `npm run build` mientras ajustas marca.

5. **Cambiar de cliente** (`VITE_CLIENT_ID`)
   - El alias `@client-manifest` se resuelve al **arrancar** Vite. Si cambias `VITE_CLIENT_ID` en `.env.local`, **detén y vuelve a ejecutar** `npm run dev`.
   - Alternativa puntual sin tocar `.env.local`: `VITE_CLIENT_ID=nomad npm run dev` (misma regla: reinicio al cambiar id).

6. **Overrides útiles en `.env.local`** (opcional)
   - `VITE_DISPLAY=mupi` | `desktop`
   - `VITE_WARDROBE_FEED=true` — solo si `manifest.features.wardrobeFeed` es compatible con tu pack

---

## 4. Paso a paso: marca nueva desde cero

1. **Crear el pack** (kebab-case, p. ej. `pilot-brand`)
   ```bash
   npm run new-client -- pilot-brand
   ```
   Genera: `config/clients/pilot-brand/{manifest,copy,wardrobe}.ts`, tema `src/styles/themes/pilot-brand.css`, import en `src/styles/index.css`, entrada en `config/registry.ts`, tipo en `PlatformTheme`, carpetas `public/brand/pilot-brand/` y `public/garments/pilot-brand/tops/`, y fila en la matriz CI si aplica.

2. **Logo**
   - Coloca `public/brand/pilot-brand/logo.png` (PNG recomendado, fondo transparente si aplica).
   - Comprueba en `manifest.ts`: `logoSrc: '/brand/pilot-brand/logo.png'` y `logoAlt` descriptivo.

3. **Prendas**
   - Imágenes en `public/garments/pilot-brand/<categoría>/` (`tops`, `bottoms`, `kits`, `hats`).
   - Edita `config/clients/pilot-brand/wardrobe.ts`: al menos **un** ítem con `id`, `name`, `url` (usa `garmentUrl(CLIENT_ID, category, file)` de `config/wardrobePaths.ts`), `category`.

4. **Textos**
   - Ajusta `config/clients/pilot-brand/copy.ts` (ver sección 5 para referencia campo a campo).

5. **Colores**
   - Edita `src/styles/themes/pilot-brand.css` (tokens `--vf-*`). Detalle en [STYLING.md](./STYLING.md#client-skin-manifest-driven).
   - Confirma `theme: 'pilot-brand'` en `manifest.ts`.

6. **Marca en manifest**
   - `brand.productName`, `logoSrc`, `logoAlt`; `display.defaultMode` (`mupi` o `desktop`); `features` según kiosk.

7. **Dev con tu cliente**
   ```bash
   # En .env.local: VITE_CLIENT_ID=pilot-brand
   npm run dev
   ```
   Revisa landing, generación (si hay API key) y rail.

8. **Verificación automática**
   ```bash
   npm run verify-clients
   ```
   Falla si falta logo, módulos del pack o armario vacío.

9. **Tests rápidos**
   ```bash
   npm test
   npm run lint
   ```

10. **Build de entrega** (cuando el pack esté listo, no en cada iteración de copy/CSS)
    ```bash
    VITE_CLIENT_ID=pilot-brand npm run build
    ```
    Un `VITE_CLIENT_ID` desconocido **rompe el build** a propósito (sin fallback silencioso a otra marca).

Plantilla manual alternativa: copiar `config/clients/_template/` → `config/clients/<id>/` y registrar en `config/registry.ts` (preferir `new-client`).

---

## 5. Paso a paso: tunear marca existente

### 5.1 Textos — `copy.ts` (tipo `PlatformCopy`)

Archivo: `config/clients/<id>/copy.ts`. Se lee en runtime con `getCopy()`.

#### `landing`

| Campo | Uso en UI |
|-------|-----------|
| `eyebrow` | Línea superior pequeña sobre el título (p. ej. «In-store fitting») |
| `titleLine1` | Primera línea del título principal (hero) |
| `titleLine2` | Segunda línea del título (salto de línea automático) |
| `subtitle` | Párrafo bajo el título |
| `privacyNote` | Texto legal breve bajo subtítulo |
| `microEdition` | Micro-copy decorativo (esquina landing, `aria-hidden`) |
| `microIssue` | Idem |
| `microRail` | Idem |
| `statusLines` | Array: frases que rotan bajo el hero (landing); conviene 3–4 líneas cortas |
| `ctaLabel` | Botón principal «Start try-on» |
| `ctaBusyLabel` | Mismo botón mientras abre cámara |

#### `generating`

| Campo | Uso en UI |
|-------|-----------|
| `statusLines` | Array: frases rotativas durante generación del modelo |
| `eyebrow` | Etiqueta superior en pantalla de espera |
| `eyebrowError` | Etiqueta si falla la generación |
| `title` | Título principal en espera |
| `titleError` | Título en error |
| `subtitle` | Tiempo estimado u orientación (solo sin error) |
| `retryLabel` | Botón para volver a capturar |

#### `footer`

| Campo | Uso en UI |
|-------|-----------|
| `line` | Pie en landing; `formatFooterLine()` sustituye `{year}` por el año actual |

Ejemplo de pie: `'Powered by Mi Marca © {year}'`.

### 5.2 Logo

1. Sustituye el archivo en `public/brand/<id>/logo.png` (mismo nombre y ruta).
2. Si cambia la ruta, actualiza `manifest.ts`:
   - `brand.logoSrc` — URL pública, p. ej. `/brand/nomad/logo.png`
   - `brand.logoAlt` — texto para lectores de pantalla
3. Recarga el navegador; no requiere build.

### 5.3 Colores y tema

1. `manifest.ts` → `theme: '<nombre>'` debe coincidir con un CSS en `src/styles/themes/<nombre>.css` importado en `src/styles/index.css`.
2. Edita variables `--vf-bg-0`, `--vf-accent`, `--vf-rail`, etc. Ver tabla completa en [STYLING.md](./STYLING.md#client-skin-manifest-driven).
3. Temas existentes de referencia: `lifestyle-sport` (Nomad), `default`, `dark`.
4. El landing usa tema oscuro **solo** dentro de `KioskShell` (`data-theme='dark'`); el resto de la app sigue el tema del manifest.

### 5.4 Armario — `wardrobe.ts`

Cada ítem (`WardrobeItem`):

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador único estable (try-on y estado de sesión) |
| `name` | Etiqueta visible en el tile del rail |
| `url` | Ruta pública; usar `garmentUrl(clientId, category, 'archivo.jpg')` |
| `category` | `'tops'` \| `'bottoms'` \| `'kits'` \| `'hats'` |

Flujo recomendado: añadir imagen en `public/garments/<id>/<category>/` → nueva entrada en el array → guardar → comprobar miniatura en dev.

Opcional: `manifest.features.wardrobeFeed: true` + `VITE_WARDROBE_FEED=true` mezcla tops demo remotos (plantilla; no usar en retail sin validar).

### 5.5 Manifest — otros campos (`PlatformBrand`, features, display)

| Campo | Archivo | Notas |
|-------|---------|-------|
| `clientId` | `manifest.ts` | Debe coincidir con carpeta y rutas de assets |
| `theme` | `manifest.ts` | Ver §5.3 |
| `features.videoLoop` | `manifest.ts` | Vídeo ambiental en canvas de estudio |
| `features.wardrobeFeed` | `manifest.ts` | Feed remoto demo |
| `features.kioskIdle` | `manifest.ts` | Reinicio tras inactividad en MUPI con modelo activo |
| `display.defaultMode` | `manifest.ts` | `mupi` \| `desktop`; override con `VITE_DISPLAY` |
| `brand.productName` | `manifest.ts` | Metadata del pack |
| `brand.poweredBy` | `manifest.ts` | Opcional; no sustituye `copy.footer` hoy |

---

## 6. Paso a paso: checklist pre-demo (10–15 min)

Manual, con `VITE_CLIENT_ID=<id>` en `.env.local` y `npm run dev`.

1. **Landing**
   - [ ] Título, subtítulo y CTA coinciden con `copy.ts`
   - [ ] Logo carga (`/brand/<id>/logo.png`, sin 404 en red)
   - [ ] Micro-líneas y frase de estado rotan (o primera línea si reduced motion)
   - [ ] Pie correcto (marca ajena no aparece)

2. **MUPI vs desktop** (si aplica al evento)
   - [ ] `VITE_DISPLAY=mupi` o `desktop` según hardware
   - [ ] Footer visible en desktop dev; en MUPI prod el pie puede ocultarse (comportamiento esperado)

3. **Captura y generación** (con API key válida)
   - [ ] Cámara abre; CTA muestra `ctaBusyLabel` al pulsar
   - [ ] Pantalla de generación: textos y rotación de `generating.statusLines`
   - [ ] Error simulado o real: `titleError`, `eyebrowError`, `retryLabel`

4. **Estudio**
   - [ ] Logo compacto en estudio
   - [ ] Rail solo muestra prendas de `/garments/<id>/`
   - [ ] Nombres de prendas legibles; cambio de categoría funciona
   - [ ] Try-on de al menos una prenda (si Gemini responde)

5. **Tema**
   - [ ] Colores de acento/fondo coherentes con el brief (no tema de otro cliente)

6. **Aislamiento** (antes de entregar build)
   ```bash
   VITE_CLIENT_ID=<id> npm run build
   grep -rq 'brand/nomad\|/garments/nomad/' dist && echo FAIL || echo OK
   ```
   Sustituye rutas de otras marcas de referencia según [CLIENT_SMOKE.md](./CLIENT_SMOKE.md).

7. **Automático**
   ```bash
   npm run verify-clients
   npm test
   ```

---

## 7. Build y deploy

### Cuándo hacer `build`

- Al cerrar el pack para **staging/producción**, CI o entrega al cliente.
- **No** en cada cambio de `copy.ts` o CSS — usa `npm run dev` hasta el checklist §6.

```bash
VITE_CLIENT_ID=<id> npm run build
npm run start   # sirve dist/ + /api en local
```

### Variables clave

| Variable | Cuándo | Propósito |
|----------|--------|-----------|
| `VITE_CLIENT_ID` | **Build** | Empaqueta un solo manifest + armario + copy |
| `VITE_DISPLAY` | Build (opcional) | Fija `mupi` o `desktop` en el bundle |
| `VITE_KIOSK_API_KEY` | **Build** | Token que el navegador envía en `X-API-Key` a `/api/*` |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | **Runtime** (servidor) | Gemini; nunca en el bundle del cliente |
| `API_KEY` | **Runtime** | Debe **coincidir** con `VITE_KIOSK_API_KEY` si la auth está activa |
| `KIOSK_TOKENS` | Runtime | Tokens adicionales válidos (lista separada por comas) |

En local, si `API_KEY` y `KIOSK_TOKENS` no están definidos, `/api` no exige auth (solo desarrollo).

### Emparejamiento de claves (producción)

1. Genera un secreto de kiosk (p. ej. `API_KEY` en el servidor).
2. En el **mismo** build que despliegas:
   ```bash
   VITE_CLIENT_ID=<id> VITE_KIOSK_API_KEY=<mismo-secreto> npm run build
   ```
3. En runtime (App Platform, etc.): `API_KEY=<mismo-secreto>` y clave Gemini en servidor.

Sin paridad, la app carga pero `/api/generate` responde **401**.

### Smoke local de producción

```bash
VITE_CLIENT_ID=nomad VITE_KIOSK_API_KEY=local-dev-key npm run build
API_KEY=local-dev-key GOOGLE_API_KEY=<tu-clave> npm run start
```

Detalle de plataforma: [deploy.md](./deploy.md). Checklist operativo: [OPS_CHECKLIST.md](./OPS_CHECKLIST.md).

---

## Resumen de rutas por cliente

```
config/clients/<id>/
  manifest.ts   # theme, brand, features, display, imports
  copy.ts       # PlatformCopy
  wardrobe.ts   # catálogo
public/brand/<id>/logo.png
public/garments/<id>/<category>/*.jpg
src/styles/themes/<theme>.css
```

Comando único de fábrica: `npm run new-client -- <id>`. Ver también la tabla «New brand» en [README.md](../README.md).
