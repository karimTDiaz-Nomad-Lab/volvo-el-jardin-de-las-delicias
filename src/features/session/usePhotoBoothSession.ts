import { useCallback, useEffect, useRef, useState } from 'react';
import type { NatureTheme } from '@config';
import { getCopy, getManifest } from '@config';
import { useCameraStream } from '@/features/capture/useCameraStream';
import { getFriendlyErrorMessage } from '@/shared/lib/utils';
import { useUiSfx } from '@/shared/hooks/useUiSfx';
import { composeNatureCard } from '@/shared/lib/compose-nature-card';
import { printImage } from '@/shared/lib/print-image';
import { sharePortrait } from '@/services/share-portrait';

export type BoothPhase =
  | 'landing'
  | 'select'
  | 'camera'
  | 'generating'
  | 'result';

type SpeculativePortrait = {
  dataUrl: string;
  prompt: string;
  invalidated: boolean;
  promise: Promise<string>;
};

const generateFromDataUrl = async (
  dataUrl: string,
  prompt: string,
): Promise<string> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], 'capture.jpg', {
    type: blob.type || 'image/jpeg',
  });
  const { generateNaturePortrait } = await import('@/services/geminiService');
  return generateNaturePortrait(file, prompt);
};

export function usePhotoBoothSession() {
  const copy = getCopy();
  const { play } = useUiSfx();
  const camera = useCameraStream();
  const [phase, setPhase] = useState<BoothPhase>('landing');
  const [nature, setNature] = useState<NatureTheme | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [overlayBaked, setOverlayBaked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isPreparingCamera, setIsPreparingCamera] = useState(false);
  const [lastCaptureUrl, setLastCaptureUrl] = useState<string | null>(null);

  const natureRef = useRef<NatureTheme | null>(null);
  const lastCaptureRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const speculativeRef = useRef<SpeculativePortrait | null>(null);

  natureRef.current = nature;
  lastCaptureRef.current = lastCaptureUrl;

  useEffect(() => {
    if (phase !== 'generating' || error) return undefined;
    const lines = copy.generating.statusLines;
    if (lines.length < 2) return undefined;
    const id = window.setInterval(() => {
      setStatusIndex((index) => (index + 1) % lines.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [phase, error, copy.generating.statusLines]);

  const invalidateSpeculative = () => {
    const entry = speculativeRef.current;
    if (!entry) return;
    entry.invalidated = true;
    speculativeRef.current = null;
  };

  const runGeneration = useCallback(
    async (dataUrl: string, prompt: string) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      const speculative = speculativeRef.current;
      speculativeRef.current = null;
      setLastCaptureUrl(dataUrl);
      setPhase('generating');
      setStatusIndex(0);
      setError(null);
      camera.release();

      try {
        const pending =
          speculative &&
          !speculative.invalidated &&
          speculative.dataUrl === dataUrl &&
          speculative.prompt === prompt
            ? speculative.promise
            : generateFromDataUrl(dataUrl, prompt);
        const imageUrl = await pending;
        const selectedNature = natureRef.current;
        const { brand } = getManifest();
        let printUrl = imageUrl;
        let baked = false;
        if (selectedNature) {
          try {
            printUrl = await composeNatureCard({
              portraitUrl: imageUrl,
              title: selectedNature.title,
              tagline: selectedNature.tagline,
              overlayInk: selectedNature.overlayInk,
              eyebrow: copy.brand.cardEyebrow,
              footer: copy.brand.cardFooter,
              logoSrc: brand.logoSrc,
            });
            baked = true;
          } catch (composeErr) {
            console.error('[compose] falling back to raw portrait', composeErr);
          }
        }
        play('success');
        const [, nextShareUrl] = await Promise.all([
          printImage(printUrl),
          sharePortrait(printUrl),
        ]);
        setResultUrl(printUrl);
        setShareUrl(nextShareUrl);
        setOverlayBaked(baked);
        setPhase('result');
      } catch (err) {
        play('error');
        setError(getFriendlyErrorMessage(err, copy.generating.titleError));
        setPhase('generating');
      } finally {
        inFlightRef.current = false;
      }
    },
    [camera, copy.generating.titleError, play],
  );

  const onSelectNature = useCallback(
    async (next: NatureTheme) => {
      if (isPreparingCamera || phase === 'camera') return;
      setError(null);
      setNature(next);
      natureRef.current = next;
      setIsPreparingCamera(true);
      const result = await camera.prepare();
      setIsPreparingCamera(false);
      if (result.status === 'ready') {
        setPhase('camera');
        return;
      }
      play('error');
      setError(result.error.message);
      setPhase('select');
    },
    [camera, isPreparingCamera, phase, play],
  );

  const onStartExperience = useCallback(() => {
    setPhase('select');
  }, []);

  const onSnapshot = useCallback((dataUrl: string) => {
    const selected = natureRef.current;
    if (!selected || inFlightRef.current) return;
    invalidateSpeculative();
    const entry: SpeculativePortrait = {
      dataUrl,
      prompt: selected.prompt,
      invalidated: false,
      promise: generateFromDataUrl(dataUrl, selected.prompt),
    };
    entry.promise.catch(() => {});
    speculativeRef.current = entry;
  }, []);

  const onCapture = useCallback(
    (dataUrl: string) => {
      const selected = natureRef.current;
      if (!selected) return;
      void runGeneration(dataUrl, selected.prompt);
    },
    [runGeneration],
  );

  const onCancelCamera = useCallback(() => {
    invalidateSpeculative();
    camera.release();
    setPhase('select');
  }, [camera]);

  const onRetake = useCallback(() => {
    invalidateSpeculative();
  }, []);

  const onStartOver = useCallback(() => {
    invalidateSpeculative();
    inFlightRef.current = false;
    camera.release();
    setNature(null);
    setResultUrl(null);
    setShareUrl(null);
    setOverlayBaked(false);
    setError(null);
    setLastCaptureUrl(null);
    setStatusIndex(0);
    setPhase('landing');
  }, [camera]);

  const onRecapture = useCallback(async () => {
    invalidateSpeculative();
    setResultUrl(null);
    setShareUrl(null);
    setOverlayBaked(false);
    setError(null);
    setIsPreparingCamera(true);
    const result = await camera.prepare();
    setIsPreparingCamera(false);
    if (result.status === 'ready') {
      setPhase('camera');
      return;
    }
    play('error');
    setError(result.error.message);
    setPhase('select');
  }, [camera, play]);

  const onRetry = useCallback(() => {
    const selected = natureRef.current;
    const capture = lastCaptureRef.current;
    if (!selected || !capture) {
      onStartOver();
      return;
    }
    void runGeneration(capture, selected.prompt);
  }, [onStartOver, runGeneration]);

  return {
    phase,
    nature,
    resultUrl,
    shareUrl,
    overlayBaked,
    error,
    statusLine:
      copy.generating.statusLines[statusIndex] ??
      copy.generating.statusLines[0] ??
      '',
    isPreparingCamera,
    stream: camera.stream,
    onSelectNature,
    onStartExperience,
    onSnapshot,
    onCapture,
    onCancelCamera,
    onRetake,
    onStartOver,
    onRecapture,
    onRetry,
  };
}
