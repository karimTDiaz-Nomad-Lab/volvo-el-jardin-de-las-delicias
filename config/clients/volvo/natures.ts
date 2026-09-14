import type { NatureTheme } from '../../types';
import {
  CONSCIENTE_PROMPT,
  CUIDADOSA_PROMPT,
  EFICIENTE_PROMPT,
  RESPETUOSA_PROMPT,
  RESPONSABLE_PROMPT,
} from './prompts';

const thumb = (id: NatureTheme['id']) => `/referencias_tarjetas/${id}.jpg`;
const look = (file: string) => `/referencia_producto_final/${file}`;

const natures: NatureTheme[] = [
  {
    id: 'responsable',
    title: 'RESPONSABLE',
    tagline: 'Está en nuestra naturaleza\ncuidar lo que tenemos.',
    thumbSrc: thumb('responsable'),
    prompt: RESPONSABLE_PROMPT,
    overlayInk: 'black',
    styleRefs: {
      individual: look('01_responsable_individual.png'),
      group: look('01_responsable_grupal.png'),
    },
  },
  {
    id: 'eficiente',
    title: 'EFICIENTE',
    tagline: 'Está en nuestra naturaleza\nrespetar lo que tenemos.',
    thumbSrc: thumb('eficiente'),
    prompt: EFICIENTE_PROMPT,
    overlayInk: 'black',
    styleRefs: {
      individual: look('02_eficiente_individual.png'),
      group: look('02_eficiente_grupal.png'),
    },
  },
  {
    id: 'cuidadosa',
    title: 'CUIDADOSA',
    tagline: 'Está en nuestra naturaleza\nproteger lo que tenemos.',
    thumbSrc: thumb('cuidadosa'),
    prompt: CUIDADOSA_PROMPT,
    overlayInk: 'black',
    styleRefs: {
      individual: look('03_CUIDADOSA_individual.png'),
    },
  },
  {
    id: 'respetuosa',
    title: 'RESPETUOSA',
    tagline: 'Está en nuestra naturaleza\npreservar lo que tenemos.',
    thumbSrc: thumb('respetuosa'),
    prompt: RESPETUOSA_PROMPT,
    overlayInk: 'white',
    styleRefs: {
      individual: look('04_respetuoso_individual.png'),
      group: look('04_respetuoso_grupal.png'),
    },
  },
  {
    id: 'consciente',
    title: 'CONSCIENTE',
    tagline: 'Está en nuestra naturaleza\npensar en lo que tenemos.',
    thumbSrc: thumb('consciente'),
    prompt: CONSCIENTE_PROMPT,
    overlayInk: 'white',
    styleRefs: {
      individual: look('05_consciente_individual.png'),
      group: look('05_consciente_grupal.png'),
    },
  },
];

export default natures;
