import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(root, 'index.html'),
    path.join(root, 'src/**/*.{ts,tsx}'),
    path.join(root, 'config/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Volvo Centum', 'sans-serif'],
        display: ['Volvo Centum', 'sans-serif'],
      },
      colors: {
        bg0: 'rgb(var(--vf-bg-0) / <alpha-value>)',
        bg1: 'rgb(var(--vf-bg-1) / <alpha-value>)',
        rail: 'rgb(var(--vf-rail) / <alpha-value>)',
        surface1: 'rgb(var(--vf-surface-1) / <alpha-value>)',
        surface2: 'rgb(var(--vf-surface-2) / <alpha-value>)',
        soft: 'rgb(var(--vf-border-soft) / <alpha-value>)',
        text: 'rgb(var(--vf-text) / <alpha-value>)',
        'text-strong': 'rgb(var(--vf-text-strong) / <alpha-value>)',
        'text-muted': 'rgb(var(--vf-text-muted) / <alpha-value>)',
        'text-subtle': 'rgb(var(--vf-text-subtle) / <alpha-value>)',
        accent: 'rgb(var(--vf-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--vf-accent-strong) / <alpha-value>)',
        'accent-ink': 'rgb(var(--vf-accent-ink) / <alpha-value>)',
        overlay: 'rgb(var(--vf-overlay) / <alpha-value>)',
        danger: 'rgb(var(--vf-danger) / <alpha-value>)',
        'danger-bg': 'rgb(var(--vf-danger-bg) / <alpha-value>)',
        focus: 'rgb(var(--vf-focus) / <alpha-value>)',
      },
      boxShadow: {
        soft: 'var(--vf-shadow-soft)',
        premium: 'var(--vf-shadow-premium)',
      },
      borderRadius: {
        vfsm: 'var(--vf-radius-sm)',
        vfmd: 'var(--vf-radius-md)',
        vflg: 'var(--vf-radius-lg)',
      },
      fontSize: {
        'vf-label': ['var(--fs-label)', { lineHeight: '1.35' }],
        'vf-body': ['var(--fs-body)', { lineHeight: '1.45' }],
        'vf-title-sm': ['var(--fs-title-sm)', { lineHeight: '1.2' }],
        'vf-title': ['var(--fs-title)', { lineHeight: '1.15' }],
        'vf-hero': ['var(--fs-hero)', { lineHeight: 'var(--fs-hero-line, 0.92)' }],
      },
      letterSpacing: {
        luxe: '0.08em',
        luxeWide: '0.14em',
      },
    },
  },
  plugins: [],
};
