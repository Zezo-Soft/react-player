import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVideoStore } from "../../store/VideoState";
import { VideoState } from "../../store/types/StoreTypes";
import { useShallow } from "zustand/react/shallow";

interface UsePrimaryVideoLifecycleParams {
  hasPreRoll: boolean;
  trackSrc: string;
}

interface PrimaryVideoLifecycleResult {
  registerVideoRef: (node: HTMLVideoElement | null) => void;
  videoRef: HTMLVideoElement | null;
  isAdPlaying: boolean;
  currentAd: VideoState["currentAd"];
  adType: VideoState["adType"];
  initialAdFinished: boolean;
  shouldCoverMainVideo: boolean;
  shouldShowPlaceholder: boolean;
}

export const usePrimaryVideoLifecycle = ({
  hasPreRoll,
  trackSrc,
}: UsePrimaryVideoLifecycleParams): PrimaryVideoLifecycleResult => {
  const {
    videoRef,
    setVideoRef,
    isAdPlaying,
    currentAd,
    adType,
    setMuted,
    setPlaying,
    setIsPlaying,
  } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      setVideoRef: state.setVideoRef,
      isAdPlaying: state.isAdPlaying,
      currentAd: state.currentAd,
      adType: state.adType,
      setMuted: state.setMuted,
      setPlaying: state.setPlaying,
      setIsPlaying: state.setIsPlaying,
    }))
  );

  const [initialAdStarted, setInitialAdStarted] = useState(!hasPreRoll);
  const [initialAdFinished, setInitialAdFinished] = useState(!hasPreRoll);
  const previousIsAdPlayingRef = useRef(isAdPlaying);

  useEffect(() => {
    if (hasPreRoll) {
      setInitialAdStarted(false);
      setInitialAdFinished(false);
    } else {
      setInitialAdStarted(true);
      setInitialAdFinished(true);
    }
  }, [hasPreRoll, trackSrc]);

  useEffect(() => {
    if (
      hasPreRoll &&
      !initialAdStarted &&
      isAdPlaying &&
      adType === "pre-roll"
    ) {
      setInitialAdStarted(true);
    }
  }, [hasPreRoll, initialAdStarted, isAdPlaying, adType]);

  useEffect(() => {
    const previouslyPlaying = previousIsAdPlayingRef.current;
    if (
      hasPreRoll &&
      initialAdStarted &&
      previouslyPlaying &&
      !isAdPlaying &&
      !initialAdFinished
    ) {
      setInitialAdFinished(true);
    }
    previousIsAdPlayingRef.current = isAdPlaying;
  }, [hasPreRoll, initialAdStarted, initialAdFinished, isAdPlaying]);

  useEffect(() => {
    if (!videoRef) {
      return;
    }

    if (hasPreRoll && !initialAdFinished) {
      videoRef.pause();
      return;
    }
  }, [videoRef, hasPreRoll, initialAdFinished]);

  useEffect(() => {
    if (!videoRef) return;

    const syncMutedState = () => {
      setMuted(videoRef.muted);
    };

    syncMutedState();
    videoRef.addEventListener("volumechange", syncMutedState);

    return () => {
      videoRef.removeEventListener("volumechange", syncMutedState);
    };
  }, [videoRef, setMuted]);

  useEffect(() => {
    if (!videoRef) return;
    videoRef.preload = "auto";
  }, [videoRef]);

  useEffect(() => {
    const element = videoRef;
    return () => {
      if (!element) return;
      try {
        element.pause();
      } catch (_error) {}
      element.removeAttribute("src");
      element.load();
    };
  }, [videoRef]);

  useEffect(() => {
    if (!videoRef) {
      return;
    }
    if (hasPreRoll && !initialAdFinished) {
      return;
    }
    if (isAdPlaying) {
      return;
    }

    let cancelled = false;

    const markPlaying = () => {
      if (cancelled) return;
      setPlaying(true);
      setIsPlaying(true);
    };

    const attemptPlayback = () => {
      if (!videoRef || cancelled) return;
      if (!videoRef.paused) {
        markPlaying();
        return;
      }
      const playPromise = videoRef.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(markPlaying).catch((error: unknown) => {
          if (cancelled) return;
          const maybeNotAllowed =
            typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name?: string }).name === "NotAllowedError";
          if (maybeNotAllowed && videoRef.muted === false) {
            videoRef.muted = true;
            const retryPromise = videoRef.play();
            if (retryPromise && typeof retryPromise.then === "function") {
              retryPromise.then(markPlaying).catch(() => {
                if (cancelled) return;
                setPlaying(false);
                setIsPlaying(false);
              });
              return;
            }
          }
          setPlaying(false);
          setIsPlaying(false);
        });
      } else {
        markPlaying();
      }
    };

    if (videoRef.readyState >= 2) {
      attemptPlayback();
    } else {
      const onCanPlay = () => {
        attemptPlayback();
      };
      videoRef.addEventListener("canplay", onCanPlay, { once: true });
      return () => {
        cancelled = true;
        videoRef.removeEventListener("canplay", onCanPlay);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [
    videoRef,
    hasPreRoll,
    initialAdFinished,
    isAdPlaying,
    setPlaying,
    setIsPlaying,
  ]);

  useEffect(() => {
    if (!videoRef) return;
    const wrapper = useVideoStore.getState().videoWrapperRef;
    if (wrapper) {
      wrapper.dataset.ready = (!hasPreRoll || initialAdFinished).toString();
    }
  }, [videoRef, hasPreRoll, initialAdFinished]);

  const registerVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      setVideoRef(node as HTMLVideoElement);
    },
    [setVideoRef]
  );

  const shouldCoverMainVideo = useMemo(
    () => hasPreRoll && !initialAdFinished,
    [hasPreRoll, initialAdFinished]
  );
  const shouldShowPlaceholder = useMemo(
    () => shouldCoverMainVideo && !isAdPlaying,
    [shouldCoverMainVideo, isAdPlaying]
  );

  return {
    registerVideoRef,
    videoRef,
    isAdPlaying,
    currentAd,
    adType,
    initialAdFinished,
    shouldCoverMainVideo,
    shouldShowPlaceholder,
  };
};
