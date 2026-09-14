import React from 'react';
import { getCopy } from '@config';
import Button from '@/shared/ui/Button';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import UiStageOverlay from '@/shared/ui/UiStageOverlay';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import styles from './PrepareScreen.module.css';

interface PrepareScreenProps {
  onReady: () => void;
  disabled?: boolean;
}

const PrepareScreen: React.FC<PrepareScreenProps> = ({ onReady, disabled }) => {
  const copy = getCopy();
  const { onCtaClick } = useUiSfx();

  return (
    <div className={styles.root}>
      <JourneyChrome
        footer={
          <Button
            variant="primary"
            size="kiosk"
            disabled={disabled}
            onClick={() => {
              onCtaClick();
              onReady();
            }}
          >
            {copy.prepare.ctaLabel}
          </Button>
        }
      >
        <div className={styles.copy}>
          <h1 className={styles.title}>{copy.prepare.title}</h1>
          <p className={styles.subtitle}>{copy.prepare.subtitle}</p>
        </div>
      </JourneyChrome>
      <UiStageOverlay src="/ui/iconos_diapositiva_03_silueta.svg" />
      <UiStageOverlay src="/ui/iconos_diapositiva_03_varios.svg" />

      {copy.prepare.hints && (
        <div className={styles.hintsBar}>
          {copy.prepare.hints.map((hint) => (
            <span key={hint} className={styles.hintLabel}>
              {hint}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrepareScreen;
