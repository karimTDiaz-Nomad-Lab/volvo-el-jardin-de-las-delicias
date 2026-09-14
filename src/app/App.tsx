import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCopy, getManifest, isFeatureEnabled } from '@config';
import LandingScreen from '@/features/natures/LandingScreen';
import NatureSelect from '@/features/natures/NatureSelect';
import CameraCapture from '@/features/capture/CameraCapture';
import GeneratingScreen from '@/features/capture/GeneratingScreen';
import ResultScreen from '@/features/result/ResultScreen';
import { usePhotoBoothSession } from '@/features/session/usePhotoBoothSession';
import { useDisplayMode } from '@/shared/lib/useDisplayMode';
import { useKioskIdle } from '@/shared/lib/useKioskIdle';
import { viewportFadeTransition } from '@/shared/lib/motionPresets';
import appStyles from './App.module.css';

const manifest = getManifest();

const App: React.FC = () => {
  const copy = getCopy();
  const displayMode = useDisplayMode();
  const session = usePhotoBoothSession();
  const idleEnabled =
    isFeatureEnabled('kioskIdle') &&
    displayMode === 'mupi' &&
    session.phase !== 'landing';

  const handleIdle = useCallback(() => {
    session.onStartOver();
  }, [session]);

  useKioskIdle(handleIdle, idleEnabled);

  return (
    <div
      className={appStyles.appRoot}
      data-client={manifest.clientId}
      data-theme={manifest.theme}
    >
      <div className={appStyles.stage}>
        <AnimatePresence mode="wait">
          {session.phase === 'landing' ? (
            <motion.div
              key="landing"
              className={appStyles.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewportFadeTransition}
            >
              <LandingScreen onStart={session.onStartExperience} />
            </motion.div>
          ) : null}

          {session.phase === 'select' ? (
            <motion.div
              key="select"
              className={appStyles.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewportFadeTransition}
            >
              <NatureSelect
                onSelect={(nature) => {
                  void session.onSelectNature(nature);
                }}
                disabled={session.isPreparingCamera}
              />
            </motion.div>
          ) : null}

          {session.phase === 'camera' ? (
            <motion.div
              key="camera"
              className={appStyles.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewportFadeTransition}
            >
              <CameraCapture
                mediaStream={session.stream}
                streamPreheated
                onCapture={session.onCapture}
                onCancel={session.onCancelCamera}
                onSnapshot={session.onSnapshot}
                onRetake={session.onRetake}
                captureHint={copy.capture.hint}
                qualityCopy={copy.captureQuality}
                labels={copy.capture}
              />
            </motion.div>
          ) : null}

          {session.phase === 'generating' ? (
            <motion.div
              key="generating"
              className={appStyles.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewportFadeTransition}
            >
              <GeneratingScreen
                statusLine={session.statusLine}
                error={session.error}
                onRetry={session.onRetry}
                onStartOver={session.onStartOver}
              />
            </motion.div>
          ) : null}

          {session.phase === 'result' && session.resultUrl && session.nature ? (
            <motion.div
              key="result"
              className={appStyles.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={viewportFadeTransition}
            >
              <ResultScreen
                imageUrl={session.resultUrl}
                shareUrl={session.shareUrl}
                overlayBaked={session.overlayBaked}
                nature={session.nature}
                onStartOver={session.onStartOver}
                onRecapture={() => {
                  void session.onRecapture();
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
