import React from 'react';
import { getCopy } from '@config';
import Button from '@/shared/ui/Button';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import styles from './LandingScreen.module.css';

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const copy = getCopy();
  const { onCtaClick } = useUiSfx();

  return (
    <JourneyChrome
      footer={
        <Button
          variant="primary"
          size="kiosk"
          onClick={() => {
            onCtaClick();
            onStart();
          }}
        >
          {copy.landing.ctaLabel}
        </Button>
      }
    >
      <div className={styles.body}>
        <h1 className={styles.title}>{copy.landing.title}</h1>
        <div className={styles.fan} aria-hidden>
          <div className={styles.fanStage}>
            <div className={`${styles.card} ${styles.cardLeft}`}>
              <img src="/results/01_responsable_individual.png" alt="" />
            </div>
            <div className={`${styles.card} ${styles.cardRight}`}>
              <img src="/results/04_respetuoso_grupal.png" alt="" />
            </div>
            <div className={styles.cardMid}>
              <img src="/results/02_eficiente_individual.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </JourneyChrome>
  );
};

export default LandingScreen;
