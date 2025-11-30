import { useEffect, useRef, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../../store/VideoState";
import { AdConfig, AdBreak, AdType } from "../types/AdTypes";

export const useAdManager = (adConfig?: AdConfig) => {
  const {
    videoRef,
    setPlaying,
    setIsPlaying,
    currentTime,
    duration,
    isAdPlaying,
    setIsAdPlaying,
    currentAd,
    setCurrentAd,
    adType,
    setAdType,
    adVideoRef,
    setAdVideoRef,
    setAdCurrentTime,
    setCanSkipAd,
    setSkipCountdown,
    playedAdBreaks,
    addPlayedAdBreak,
    midRollQueue,
    setMidRollQueue,
  } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      setPlaying: state.setPlaying,
      setIsPlaying: state.setIsPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      isAdPlaying: state.isAdPlaying,
      setIsAdPlaying: state.setIsAdPlaying,
      currentAd: state.currentAd,
      setCurrentAd: state.setCurrentAd,
      adType: state.adType,
      setAdType: state.setAdType,
      adVideoRef: state.adVideoRef,
      setAdVideoRef: state.setAdVideoRef,
      setAdCurrentTime: state.setAdCurrentTime,
      setCanSkipAd: state.setCanSkipAd,
      setSkipCountdown: state.setSkipCountdown,
      playedAdBreaks: state.playedAdBreaks,
      addPlayedAdBreak: state.addPlayedAdBreak,
      midRollQueue: state.midRollQueue,
      setMidRollQueue: state.setMidRollQueue,
    }))
  );

  const preRollPlayedRef = useRef(false);
  const postRollPlayedRef = useRef(false);
  const midRollCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const resumeAfterAdRef = useRef(false);

  const stopMediaElement = useCallback((media?: HTMLMediaElement | null) => {
    if (!media) return;
    try {
      media.pause();
    } catch (_error) {}
    try {
      media.currentTime = 0;
    } catch (_error) {}
    media.removeAttribute("src");
    media.load();
  }, []);

  useEffect(() => {
    if (!adConfig?.midRoll || adConfig.midRoll.length === 0) {
      setMidRollQueue([]);
      return;
    }

    let sortedMidRolls = [...adConfig.midRoll].sort((a, b) => a.time - b.time);

    if (adConfig.smartPlacement?.enabled) {
      sortedMidRolls = applySmartPlacement(
        sortedMidRolls,
        duration,
        adConfig.smartPlacement
      );
    }

    setMidRollQueue(sortedMidRolls);
  }, [adConfig?.midRoll, adConfig?.smartPlacement, duration, setMidRollQueue]);

  const applySmartPlacement = (
    ads: AdBreak[],
    videoDuration: number,
    options: NonNullable<AdConfig["smartPlacement"]>
  ): AdBreak[] => {
    const minVideoDuration = options.minVideoDuration || 60;
    const minGap = options.minGapBetweenAds || 30;
    const avoidNearEnd = options.avoidNearEnd || 10;

    if (videoDuration < minVideoDuration) {
      return [];
    }

    const validAds: AdBreak[] = [];
    let lastAdTime = 0;

    for (const ad of ads) {
      if (ad.time < minGap) continue;

      if (ad.time > videoDuration - avoidNearEnd) continue;

      if (ad.time - lastAdTime < minGap) continue;

      validAds.push(ad);
      const adLength = Number.isFinite(ad.duration)
        ? (ad.duration as number)
        : 0;
      lastAdTime = ad.time + adLength;
    }

    return validAds;
  };

  const playPreRollAd = async () => {
    if (!adConfig?.preRoll || preRollPlayedRef.current || !videoRef) return;

    const adBreak = adConfig.preRoll;
    preRollPlayedRef.current = true;
    resumeAfterAdRef.current = true;

    stopMediaElement(useVideoStore.getState().adVideoRef);

    videoRef.pause();
    setPlaying(false);
    setIsPlaying(false);

    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("pre-roll");

    adConfig.onAdStart?.(adBreak);
  };

  const checkMidRollAds = () => {
    if (!videoRef || isAdPlaying || midRollQueue.length === 0) return;

    const nextAd = midRollQueue[0];
    if (!nextAd) return;

    if (currentTime >= nextAd.time && !playedAdBreaks.includes(nextAd.id)) {
      playMidRollAd(nextAd);
    }
  };

  const playMidRollAd = async (adBreak: AdBreak) => {
    if (!videoRef || isAdPlaying) return;
    
    // Prevent duplicate ad playback
    if (playedAdBreaks.includes(adBreak.id)) return;

    const updatedQueue = midRollQueue.filter((ad) => ad.id !== adBreak.id);
    setMidRollQueue(updatedQueue);

    addPlayedAdBreak(adBreak.id);

    const wasPlaying = !videoRef.paused;
    videoRef.pause();
    setPlaying(false);
    setIsPlaying(false);
    resumeAfterAdRef.current = wasPlaying;

    stopMediaElement(useVideoStore.getState().adVideoRef);

    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("mid-roll");

    adConfig?.onAdStart?.(adBreak);
  };

  const playPostRollAd = async () => {
    if (!adConfig?.postRoll || postRollPlayedRef.current || !videoRef) return;

    const adBreak = adConfig.postRoll;
    postRollPlayedRef.current = true;
    resumeAfterAdRef.current = false;

    stopMediaElement(useVideoStore.getState().adVideoRef);

    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("post-roll");

    adConfig.onAdStart?.(adBreak);
  };

  const endAd = useCallback(() => {
    const currentAdState = useVideoStore.getState().currentAd;
    const adTypeState = useVideoStore.getState().adType;
    const videoRefState = useVideoStore.getState().videoRef;
    const adVideoRefState = useVideoStore.getState().adVideoRef;

    if (!currentAdState) return;

    // Clean up ad video element
    if (adVideoRefState) {
      stopMediaElement(adVideoRefState);
      setAdVideoRef(null);
    }

    // Reset ad state
    setIsAdPlaying(false);
    setCurrentAd(null);
    setAdType(null);
    setAdCurrentTime(0);
    setCanSkipAd(false);
    setSkipCountdown(0);

    // Call end callback
    adConfig?.onAdEnd?.(currentAdState);

    // Resume main video if needed
    if (resumeAfterAdRef.current && adTypeState !== "post-roll" && videoRefState) {
      // Small delay to ensure ad cleanup is complete
      setTimeout(() => {
        if (videoRefState && !videoRefState.paused) return;
        videoRefState.play().catch(() => {
          // If autoplay fails, user will need to click play
          setPlaying(false);
          setIsPlaying(false);
        });
        setPlaying(true);
        setIsPlaying(true);
      }, 100);
    }
    resumeAfterAdRef.current = false;
  }, [
    adConfig,
    setIsAdPlaying,
    setCurrentAd,
    setAdType,
    setAdCurrentTime,
    setCanSkipAd,
    setSkipCountdown,
    setAdVideoRef,
    setPlaying,
    setIsPlaying,
    stopMediaElement,
  ]);

  const skipAd = () => {
    if (!currentAd || !currentAd.skipable) return;

    adConfig?.onAdSkip?.(currentAd);

    endAd();
  };

  useEffect(() => {
    if (!adVideoRef || !isAdPlaying) return;

    const handleAdEnded = () => {
      endAd();
    };

    let forcedEndTriggered = false;
    const enforceTimedDuration = () => {
      if (!currentAd) return;

      const configuredDuration = Number(currentAd.duration);
      if (!Number.isFinite(configuredDuration) || configuredDuration <= 0) {
        return;
      }

      if (adVideoRef.currentTime >= configuredDuration) {
        if (adVideoRef.currentTime > configuredDuration) {
          try {
            adVideoRef.currentTime = configuredDuration;
          } catch (_error) {}
        }
        if (!forcedEndTriggered) {
          forcedEndTriggered = true;
          endAd();
        }
      }
    };

    adVideoRef.addEventListener("ended", handleAdEnded);
    adVideoRef.addEventListener("timeupdate", enforceTimedDuration);

    return () => {
      adVideoRef.removeEventListener("ended", handleAdEnded);
      adVideoRef.removeEventListener("timeupdate", enforceTimedDuration);
    };
  }, [adVideoRef, isAdPlaying, endAd, currentAd]);

  useEffect(() => {
    if (isAdPlaying || !adVideoRef) {
      return;
    }
    stopMediaElement(adVideoRef);
    setAdVideoRef(null);
  }, [isAdPlaying, adVideoRef, setAdVideoRef, stopMediaElement]);

  useEffect(() => {
    if (!videoRef || !adConfig?.preRoll || preRollPlayedRef.current) return;

    const handleCanPlay = () => {
      playPreRollAd();
    };

    videoRef.addEventListener("canplay", handleCanPlay, { once: true });

    if (videoRef.readyState >= 2) {
      playPreRollAd();
    }

    return () => {
      videoRef.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoRef, adConfig?.preRoll]);

  useEffect(() => {
    if (!videoRef || !adConfig?.midRoll || isAdPlaying) {
      if (midRollCheckIntervalRef.current) {
        clearInterval(midRollCheckIntervalRef.current);
        midRollCheckIntervalRef.current = null;
      }
      return;
    }

    midRollCheckIntervalRef.current = setInterval(() => {
      const state = useVideoStore.getState();
      if (
        state.isAdPlaying ||
        !state.midRollQueue ||
        state.midRollQueue.length === 0 ||
        !state.videoRef
      ) {
        return;
      }

      const nextAd = state.midRollQueue[0];
      if (
        nextAd &&
        state.currentTime >= nextAd.time &&
        !state.playedAdBreaks.includes(nextAd.id)
      ) {
        // Clear interval to prevent duplicate triggers
        if (midRollCheckIntervalRef.current) {
          clearInterval(midRollCheckIntervalRef.current);
          midRollCheckIntervalRef.current = null;
        }

        const updatedQueue = state.midRollQueue.filter(
          (ad) => ad.id !== nextAd.id
        );
        state.setMidRollQueue(updatedQueue);

        state.addPlayedAdBreak(nextAd.id);

        const wasPlaying = !state.videoRef.paused;
        state.videoRef.pause();
        state.setPlaying(false);
        state.setIsPlaying(false);
        resumeAfterAdRef.current = wasPlaying;

        stopMediaElement(state.adVideoRef);

        state.setIsAdPlaying(true);
        state.setCurrentAd(nextAd);
        state.setAdType("mid-roll");

        adConfig?.onAdStart?.(nextAd);
      }
    }, 500); // Check every 500ms for better accuracy

    return () => {
      if (midRollCheckIntervalRef.current) {
        clearInterval(midRollCheckIntervalRef.current);
        midRollCheckIntervalRef.current = null;
      }
    };
  }, [videoRef, isAdPlaying, adConfig]);

  useEffect(() => {
    if (!videoRef || !adConfig?.postRoll || postRollPlayedRef.current) return;

    const handleVideoEnded = () => {
      setTimeout(() => {
        playPostRollAd();
      }, 500);
    };

    videoRef.addEventListener("ended", handleVideoEnded);

    return () => {
      videoRef.removeEventListener("ended", handleVideoEnded);
    };
  }, [videoRef, adConfig?.postRoll]);

  useEffect(() => {
    if (!videoRef?.src) return;

    preRollPlayedRef.current = false;
    postRollPlayedRef.current = false;
    resumeAfterAdRef.current = false;
    setIsAdPlaying(false);
    setCurrentAd(null);
    setAdType(null);
    if (adConfig?.midRoll && adConfig.midRoll.length > 0) {
      const sortedMidRolls = [...adConfig.midRoll].sort(
        (a, b) => a.time - b.time
      );
      setMidRollQueue(sortedMidRolls);
    } else {
      setMidRollQueue([]);
    }

    const lingeringAdRef = useVideoStore.getState().adVideoRef;
    if (lingeringAdRef) {
      stopMediaElement(lingeringAdRef);
      setAdVideoRef(null);
    }
  }, [
    videoRef?.src,
    adConfig?.midRoll,
    setIsAdPlaying,
    setCurrentAd,
    setAdType,
    setMidRollQueue,
    stopMediaElement,
    setAdVideoRef,
  ]);

  return {
    isAdPlaying,
    currentAd,
    adType,
    skipAd,
    endAd,
  };
};
