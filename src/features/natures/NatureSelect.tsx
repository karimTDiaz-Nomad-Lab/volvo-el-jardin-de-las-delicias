import React from 'react';
import type { NatureTheme } from '@config';
import { getCopy, getManifest } from '@config';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import styles from './NatureSelect.module.css';

interface NatureSelectProps {
  onSelect: (nature: NatureTheme) => void;
  disabled?: boolean;
}

const NatureSelect: React.FC<NatureSelectProps> = ({ onSelect, disabled }) => {
  const copy = getCopy();
  const natures = getManifest().natures;
  const { play } = useUiSfx();

  return (
    <JourneyChrome>
      <div className={styles.panel}>
        <h1 className={styles.title}>{copy.select.title}</h1>
        <ul
          className={styles.rail}
          aria-label={copy.select.title}
        >
          {natures.map((nature, index) => (
            <li
              key={nature.id}
              className={styles.item}
            >
              <button
                type='button'
                className={styles.card}
                disabled={disabled}
                onClick={() => {
                  play('success');
                  onSelect(nature);
                }}
              >
                <span className={styles.thumbWrap}>
                  <img
                    src={nature.thumbSrc}
                    alt=''
                    className={styles.thumb}
                  />
                </span>
                <span className={styles.copy}>
                  <span className={styles.name}>{nature.title}</span>
                  <span className={styles.tagline}>{nature.tagline}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </JourneyChrome>
  );
};

export default NatureSelect;
