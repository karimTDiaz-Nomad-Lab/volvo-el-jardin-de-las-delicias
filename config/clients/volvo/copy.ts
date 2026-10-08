import type { PlatformCopy } from '../../types';

const copy: PlatformCopy = {
  brand: {
    collection: 'NATURE COLLECTION',
    cardEyebrow: 'EN NUESTRA NATURALEZA',
    cardFooter: 'UNA DE CINCO\nNATURALEZAS VOLVO',
  },
  landing: {
    title: 'Elige\ntu naturaleza',
    ctaLabel: 'COMENZAR',
  },
  select: {
    title: 'Elige la naturaleza que quieras representar',
  },
  prepare: {
    title: 'PREPÁRATE',
    subtitle: 'Mira a cámara.\nNosotros hacemos el resto',
    ctaLabel: 'ESTOY LISTO/A',
    hints: ['Rostro visible', 'Mirada al frente', 'Sitúate en\nla marca'],
  },
  capture: {
    hint: 'Mira a cámara. Nosotros hacemos el resto',
    closeAria: 'Cerrar cámara',
    captureAria: 'Hacer foto',
    confirmPrompt: '¿Utilizamos esta foto?',
    confirm: 'SÍ, CREAR MI RETRATO',
    retake: 'REPETIR',
    retry: 'Reintentar',
    timerOff: 'Off',
  },
  generating: {
    statusLines: ['IMPRIMIENDO IMAGEN'],
    eyebrow: 'NATURE COLLECTION',
    eyebrowError: 'No se pudo completar',
    title: 'Estamos generando tu imagen',
    titleError: 'No pudimos transformar esta foto',
    subtitle:
      'Adaptando luz, gesto, paisaje y composición. Tu naturaleza estará lista en unos segundos.',
    printing: 'GENERANDO RETRATO',
    retryLabel: 'Reintentar',
  },
  result: {
    againLabel: 'FINALIZAR',
    recaptureLabel: 'REPETIR',
    qrHint: 'ESCANEA EL QR\nY GUARDA TU FOTO',
    qrAria: 'Código QR para guardar tu foto en la galería',
  },
  captureQuality: {
    darkWarn: 'La foto se ve muy oscura. Acércate a la luz o repite.',
    blurWarn: 'La foto se ve borrosa. Mantén la pose y repite.',
    continueLabel: 'Continuar',
    recaptureLabel: 'REPETIR',
  },
};

export default copy;
