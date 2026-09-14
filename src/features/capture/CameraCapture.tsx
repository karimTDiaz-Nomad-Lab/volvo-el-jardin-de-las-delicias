/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopy, getManifest } from '@config';
import { cn } from '@/shared/lib/utils';
import Button from '@/shared/ui/Button';
import JourneyChrome from '@/shared/ui/JourneyChrome';
import UiStageOverlay from '@/shared/ui/UiStageOverlay';
import PrepareScreen from './PrepareScreen';
import {
  CAMERA_VIDEO_CONSTRAINTS,
  captureVideoFrame,
  getUnavailableCameraError,
  isCameraApiAvailable,
  parseUserMediaError,
  getCameraRotationDeg,
  usesMupiCameraRotation,
  type CameraErrorKind,
} from '@/shared/lib/camera';
import {
  screenEase,
  viewportFadeTransition,
  webcamRevealTransition,
} from '@/shared/lib/motionPresets';
import Spinner from '@/shared/components/Spinner';
import frameStyles from '@/shared/ui/CaptureFrame.module.css';
import chromeStyles from '@/shared/ui/JourneyChrome.module.css';
import captureStyles from './CameraCapture.module.css';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import { useSfx } from '@/shared/context/useSfx';
import { playShutterSfx } from '@/shared/lib/sfx';
import {
  measureCaptureQuality,
  type CaptureQualityIssue,
} from '@/core/media/captureQuality';

const CAMERA_SFX_VOLUME = 0.4;

interface CaptureQualityCopy {
  darkWarn: string;
  blurWarn: string;
  continueLabel: string;
  recaptureLabel: string;
}

interface CameraLabels {
  closeAria: string;
  captureAria: string;
  confirmPrompt: string;
  confirm: string;
  retake: string;
  retry: string;
  timerOff: string;
}

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
  /** Fired the moment a frame is snapped (before confirm) — enables speculative work. */
  onSnapshot?: (imageSrc: string) => void;
  /** Fired when the user discards the snapped frame. */
  onRetake?: () => void;
  /** Reuse a stream acquired before this screen mounts (avoids a second permission prompt). */
  mediaStream?: MediaStream | null;
  /** Stream was warmed on the landing screen — skip the full warmup overlay. */
  streamPreheated?: boolean;
  /** Capture coaching line; defaults to full-body apparel guidance. */
  captureHint?: string;
  /** Soft extreme-only quality gate copy (optional). */
  qualityCopy?: CaptureQualityCopy;
  labels?: CameraLabels;
}

const COUNTDOWN_SECONDS = 3;
const DEFAULT_CAPTURE_HINT = 'Mira a cámara. Nosotros hacemos el resto';

const DEFAULT_LABELS: CameraLabels = {
  closeAria: 'Cerrar cámara',
  captureAria: 'Hacer foto',
  confirmPrompt: '¿Utilizamos esta foto?',
  confirm: 'SÍ, CREAR MI RETRATO',
  retake: 'REPETIR',
  retry: 'Reintentar',
  timerOff: 'Off',
};

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  onSnapshot,
  onRetake,
  mediaStream = null,
  streamPreheated = false,
  captureHint: _captureHint = DEFAULT_CAPTURE_HINT,
  qualityCopy,
  labels = DEFAULT_LABELS,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copy = getCopy();
  const manifest = getManifest();
  const { onTapClick } = useUiSfx({ volume: CAMERA_SFX_VOLUME });
  const { unlock, prefersReducedMotion } = useSfx();
  const [isPrepared, setIsPrepared] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(streamPreheated && !!mediaStream);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedCountdownSeconds] = useState<number>(COUNTDOWN_SECONDS);
  const [showFlash, setShowFlash] = useState(false);
  const [webcamKey, setWebcamKey] = useState(0);
  const [qualityIssue, setQualityIssue] = useState<CaptureQualityIssue | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const qualityPromiseRef = useRef<Promise<CaptureQualityIssue | null> | null>(null);
  const [cameraError, setCameraError] = useState<{ kind: CameraErrorKind; message: string } | null>(
    () => (isCameraApiAvailable() ? null : getUnavailableCameraError())
  );

  const usesExternalStream = mediaStream != null;
  const showWebcam = cameraError === null && isCameraApiAvailable();
  const cameraRotationDeg = getCameraRotationDeg();
  const mupiCameraRotation = usesMupiCameraRotation();
  const videoContainerClass = mupiCameraRotation
    ? captureStyles.mupiVideoContainer
    : captureStyles.mupiVideoContainerPlain;
  const videoContainerStyle = mupiCameraRotation
    ? ({ '--camera-rotate': `${cameraRotationDeg}deg` } as React.CSSProperties)
    : undefined;

  const fireShutterSfx = useCallback(() => {
    unlock();
    playShutterSfx({ muted: prefersReducedMotion, baseVolume: CAMERA_SFX_VOLUME });
  }, [unlock, prefersReducedMotion]);

  const captureNow = useCallback(() => {
    fireShutterSfx();
    setShowFlash(true);
    window.setTimeout(() => setShowFlash(false), 160);

    const video = usesExternalStream
      ? videoRef.current
      : (webcamRef.current?.video ?? null);
    const imageSrc = video ? captureVideoFrame(video) : null;

    if (imageSrc) {
      setCapturedImage(imageSrc);
      setQualityIssue(null);
      onSnapshot?.(imageSrc);

      // Soft quality gate starts at snap so the warn is ready before Confirm.
      if (qualityCopy) {
        setIsCheckingQuality(true);
        const pending = measureCaptureQuality(imageSrc)
          .then((assessment) => assessment.issue)
          .catch((err) => {
            if (import.meta.env.DEV) {
              console.warn('[capture-quality] check failed; continuing', err);
            }
            return null;
          })
          .then((issue) => {
            setQualityIssue(issue);
            setIsCheckingQuality(false);
            return issue;
          });
        qualityPromiseRef.current = pending;
      } else {
        qualityPromiseRef.current = null;
      }
    }
  }, [usesExternalStream, fireShutterSfx, onSnapshot, qualityCopy]);

  const bindExternalVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (!node || !mediaStream) return;
      if (node.srcObject !== mediaStream) {
        node.srcObject = mediaStream;
      }
      void node.play().catch(() => {
        /* Autoplay may reject until a gesture; stream still paints via autoPlay/muted. */
      });
    },
    [mediaStream]
  );

  useEffect(() => {
    if (!usesExternalStream || !mediaStream) return;

    const video = videoRef.current;
    if (!video) return;

    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }
    void video.play().catch(() => {
      /* Autoplay may reject until a gesture; stream still paints via autoPlay/muted. */
    });

    const markReady = () => {
      setCameraError(null);
      setIsCameraReady(true);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
      return;
    }

    video.addEventListener('loadeddata', markReady, { once: true });
    return () => video.removeEventListener('loadeddata', markReady);
    // Re-attach when the <video> remounts after prepare / retake.
  }, [usesExternalStream, mediaStream, isPrepared, capturedImage]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const captureId = window.setTimeout(() => {
        setCountdown(null);
        captureNow();
      }, 0);
      return () => window.clearTimeout(captureId);
    }
    const timeoutId = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [countdown, captureNow]);

  const startCountdownCapture = () => {
    if (!isCameraReady || countdown !== null) return;
    if (selectedCountdownSeconds <= 0) {
      captureNow();
      return;
    }
    onTapClick();
    setCountdown(selectedCountdownSeconds);
  };

  const retake = () => {
    onTapClick();
    setCountdown(null);
    setCapturedImage(null);
    setQualityIssue(null);
    setIsCheckingQuality(false);
    qualityPromiseRef.current = null;
    onRetake?.();
  };

  const confirm = async () => {
    if (!capturedImage || isCheckingQuality) return;
    onTapClick();

    // Soft gate: warn on extreme dark/blur, still allow continue.
    // Measurement usually finished at snap; await only if Confirm is very fast.
    if (qualityCopy && !qualityIssue) {
      setIsCheckingQuality(true);
      try {
        const pending = qualityPromiseRef.current;
        const issue = pending
          ? await pending
          : (await measureCaptureQuality(capturedImage)).issue;
        if (issue) {
          setQualityIssue(issue);
          return;
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[capture-quality] check failed; continuing', err);
        }
      } finally {
        setIsCheckingQuality(false);
      }
    }

    onCapture(capturedImage);
  };

  const continueDespiteQuality = () => {
    if (!capturedImage) return;
    onTapClick();
    onCapture(capturedImage);
  };

  const handleUserMedia = () => {
    setCameraError(null);
    setIsCameraReady(true);
  };

  const handleUserMediaError = (err: string | DOMException) => {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    const parsed = parseUserMediaError(err);
    setCameraError(parsed);
    setIsCameraReady(false);
    setCountdown(null);
  };

  const retryCamera = () => {
    onTapClick();
    if (usesExternalStream) {
      onCancel();
      return;
    }
    setCameraError(null);
    setIsCameraReady(false);
    setCountdown(null);
    setWebcamKey((key) => key + 1);
  };

  const showRetry = cameraError?.kind === 'permission' || cameraError?.kind === 'generic';
  const showWarmupOverlay = showWebcam && !isCameraReady && !streamPreheated;

  const handlePreparedReady = () => {
    if (cameraError) {
      retryCamera();
      return;
    }
    setIsPrepared(true);
    void videoRef.current?.play().catch(() => {
      /* User gesture: resume playback if the browser paused the hidden feed. */
    });
  };

  if (capturedImage) {
    const previewActions = (
      <div className={captureStyles.previewActions}>
        {qualityIssue && qualityCopy ? (
          <>
            <p className={frameStyles.errorText}>
              {qualityIssue === 'too_dark' ? qualityCopy.darkWarn : qualityCopy.blurWarn}
            </p>
            <Button variant="primary" size="kiosk" onClick={continueDespiteQuality}>
              {qualityCopy.continueLabel}
            </Button>
            <Button variant="secondary" size="kiosk" onClick={retake}>
              {qualityCopy.recaptureLabel}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="kiosk"
              disabled={isCheckingQuality}
              onClick={() => void confirm()}
            >
              {isCheckingQuality ? '…' : labels.confirm}
            </Button>
            <Button variant="secondary" size="kiosk" onClick={retake}>
              {labels.retake}
            </Button>
          </>
        )}
      </div>
    );

    return (
      <motion.div
        key="preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={viewportFadeTransition}
        className={captureStyles.previewRoot}
      >
        <JourneyChrome footer={previewActions}>
          <div className={captureStyles.previewBody}>
            <h1 className={captureStyles.previewPrompt}>{labels.confirmPrompt}</h1>
            <div className={captureStyles.previewStage}>
              <div className={captureStyles.previewFrame}>
                <img src={capturedImage} alt="" />
              </div>
            </div>
          </div>
        </JourneyChrome>
      </motion.div>
    );
  }

  return (
    <div className={frameStyles.root}>
      <div className={frameStyles.viewport}>
        {showWebcam ? (
          <>
            <motion.div
              className={videoContainerClass}
              style={videoContainerStyle}
              initial={{ opacity: streamPreheated ? 1 : 0 }}
              animate={{ opacity: isCameraReady ? 1 : 0 }}
              transition={webcamRevealTransition}
            >
              {usesExternalStream ? (
                <video ref={bindExternalVideo} autoPlay playsInline muted />
              ) : (
                <Webcam
                  key={webcamKey}
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={CAMERA_VIDEO_CONSTRAINTS}
                  onUserMedia={handleUserMedia}
                  mirrored={false}
                  forceScreenshotSourceSize={false}
                  imageSmoothing
                  disablePictureInPicture
                  onUserMediaError={handleUserMediaError}
                  screenshotQuality={0.92}
                />
              )}
            </motion.div>
            <AnimatePresence>
              {showWarmupOverlay ? (
                <motion.div
                  key="warmup"
                  className={frameStyles.warmupOverlay}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: screenEase }}
                  aria-hidden
                >
                  <div className={frameStyles.warmupInner}>
                    <Spinner className={frameStyles.warmupSpinner} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {showFlash ? (
              <motion.div
                className={captureStyles.shutterFlash}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            ) : null}
          </>
        ) : (
          <div className={captureStyles.errorBackdrop} aria-hidden />
        )}

        {isPrepared ? (
          <header className={cn(chromeStyles.header, captureStyles.liveHeader)}>
            <img
              src={manifest.brand.logoSrc}
              alt={manifest.brand.logoAlt}
              className={chromeStyles.logo}
            />
            <p className={chromeStyles.collection}>{copy.brand.collection}</p>
          </header>
        ) : null}

        <UiStageOverlay src="/ui/iconos_diapositiva_04_grid.svg" />

        <AnimatePresence>
          {countdown !== null && showWebcam ? (
            <motion.div
              key={countdown}
              className={frameStyles.countdownBubble}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
            >
              <span className={cn(captureStyles.countdownNum, 'capture-countdown')}>{countdown}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {countdown === null && showWebcam && isPrepared ? (
          <div className={captureStyles.shutterDock}>
            <button
              type="button"
              onClick={startCountdownCapture}
              disabled={!isCameraReady}
              className={cn(captureStyles.volvoShutter, 'capture-shutter')}
              aria-label={labels.captureAria}
            >
              <span className={captureStyles.volvoShutterInner} />
            </button>
          </div>
        ) : null}

        {countdown === null && cameraError && isPrepared ? (
          <div className={frameStyles.controlsDock}>
            <div className={frameStyles.errorPanel}>
              <p className={frameStyles.errorText}>{cameraError.message}</p>
              {showRetry ? (
                <Button variant="primary" size="kiosk" onClick={retryCamera}>
                  {labels.retry}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {!isPrepared ? (
        <div className={captureStyles.prepareLayer}>
          <PrepareScreen
            disabled={!isCameraReady && !cameraError}
            onReady={handlePreparedReady}
          />
        </div>
      ) : null}
    </div>
  );
};

export default CameraCapture;
