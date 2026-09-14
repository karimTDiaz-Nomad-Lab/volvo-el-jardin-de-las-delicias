import type { PlatformManifest } from '../../types';
import copy from './copy';
import natures from './natures';

const manifest: PlatformManifest = {
  clientId: 'volvo',
  theme: 'volvo',
  features: {
    kioskIdle: true,
  },
  brand: {
    productName: 'El jardín de las delicias',
    logoSrc: '/ui/volvo_logo_negro.svg?v=3',
    logoOnDarkSrc: '/ui/volvo_logo_blanco.svg',
    logoAlt: 'Volvo',
    selectBackgroundSrc: '/ui/fondo_journey.png',
  },
  display: {
    defaultMode: 'mupi',
  },
  natures,
  copy,
};

export default manifest;
