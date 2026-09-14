import React from 'react';
import { getCopy, getManifest } from '@config';
import { cn } from '@/shared/lib/utils';
import styles from './JourneyChrome.module.css';

interface JourneyChromeProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
}

const JourneyChrome: React.FC<JourneyChromeProps> = ({
  children,
  footer,
  showHeader = true,
}) => {
  const copy = getCopy();
  const { brand } = getManifest();

  return (
    <div className={styles.root}>
      <img
        src={brand.selectBackgroundSrc}
        alt=''
        className={styles.backdrop}
      />
      {showHeader ? (
        <header className={styles.header}>
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className={styles.logo}
          />
          <p className={styles.collection}>{copy.brand.collection}</p>
        </header>
      ) : null}
      <div className={cn(styles.body, !showHeader && styles.bodyFlush)}>
        {children}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
};

export default JourneyChrome;
