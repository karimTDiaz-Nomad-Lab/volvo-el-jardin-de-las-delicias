import React from 'react';
import { getCopy } from '@config';
import Button from '@/shared/ui/Button';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import styles from './GeneratingScreen.module.css';
import Spinner from '@/shared/components/Spinner';

interface GeneratingScreenProps {
  statusLine: string;
  error: string | null;
  onRetry: () => void;
  onStartOver: () => void;
}

const GeneratingScreen: React.FC<GeneratingScreenProps> = ({
  statusLine,
  error,
  onRetry,
  onStartOver,
}) => {
  const copy = getCopy();
  const hasError = Boolean(error);

  return (
    <JourneyChrome
      footer={
        hasError ? (
          <div className={styles.actions}>
            <p className={styles.subtitle}>{error}</p>
            <Button
              variant='primary'
              size='kiosk'
              onClick={onRetry}
            >
              {copy.generating.retryLabel}
            </Button>
            <Button
              variant='secondary'
              size='kiosk'
              onClick={onStartOver}
            >
              {copy.result.againLabel}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div
        className={styles.root}
        aria-busy={!hasError}
      >
        <div className={styles.body}>
          <h1 className={styles.title}>
            {hasError ? copy.generating.titleError : copy.generating.title}
          </h1>
          {hasError ? null : (
            <>
              <div className={styles.spinnerWrapper}>
                <Spinner />
              </div>
              <div className={styles.bottom}>
                <p className={styles.subtitle}>{copy.generating.subtitle}</p>
                <p className={styles.status}>
                  {copy.generating.printing || statusLine}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </JourneyChrome>
  );
};

export default GeneratingScreen;
