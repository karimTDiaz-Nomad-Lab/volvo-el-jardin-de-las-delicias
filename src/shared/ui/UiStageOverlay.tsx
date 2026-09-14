import React from 'react';
import styles from './UiStageOverlay.module.css';

interface UiStageOverlayProps {
  src: string;
}

/** Full-bleed 9:16 artboard overlay — icons are already positioned in the SVG. */
const UiStageOverlay: React.FC<UiStageOverlayProps> = ({ src }) => (
  <img src={src} alt="" className={styles.overlay} aria-hidden />
);

export default UiStageOverlay;
