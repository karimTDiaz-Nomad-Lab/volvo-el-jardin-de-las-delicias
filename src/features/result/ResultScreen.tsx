import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { NatureTheme } from '@config';
import { getCopy, getManifest } from '@config';
import Button from '@/shared/ui/Button';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  imageUrl: string;
  shareUrl?: string | null;
  overlayBaked?: boolean;
  nature: NatureTheme;
  onStartOver: () => void;
  onRecapture: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  imageUrl,
  shareUrl,
  overlayBaked = false,
  nature,
  onStartOver,
  onRecapture: _onRecapture,
}) => {
  const copy = getCopy();
  const { brand } = getManifest();
  const { onCtaClick } = useUiSfx();

  return (
    <JourneyChrome
      showHeader={false}
      footer={
        <>
          {shareUrl ? (
            <div className={styles.qrBlock}>
              <div className={styles.qrRow}>
                <div className={styles.qrFrame}>
                  <QRCodeSVG
                    value={shareUrl}
                    size={112}
                    level="M"
                    marginSize={1}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    title={copy.result.qrAria}
                  />
                </div>
                <p className={styles.qrHint}>{copy.result.qrHint}</p>
              </div>
            </div>
          ) : null}
          <Button
            variant="secondary"
            size="kiosk"
            onClick={() => {
              onCtaClick();
              onStartOver();
            }}
          >
            {copy.result.againLabel}
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <article className={styles.card}>
          <img src={imageUrl} alt={nature.title} className={styles.image} />
          {overlayBaked ? null : (
            <div
              className={
                nature.overlayInk === 'white' ? styles.copyWhite : styles.copyBlack
              }
            >
              <img src={brand.logoSrc} alt="" className={styles.miniLogo} />
              <p className={styles.eyebrow}>{copy.brand.cardEyebrow}</p>
              <h2 className={styles.name}>{nature.title}</h2>
              <p className={styles.tagline}>{nature.tagline}</p>
              <p className={styles.footerNote}>{copy.brand.cardFooter}</p>
            </div>
          )}
        </article>
      </div>
    </JourneyChrome>
  );
};

export default ResultScreen;
