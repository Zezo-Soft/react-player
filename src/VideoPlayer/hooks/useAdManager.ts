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
  const resumeAfterAdRef = useRef(false);
  // Track maximum time reached to prevent ad replay when seeking backward
  const maxTimeReachedRef = useRef(0);
  // Throttle ad checking to prevent performance issues
  const adCheckThrottleRef = useRef<number | null>(null);
  // Track if we're currently processing an ad to prevent race conditions
  const isProcessingAdRef = useRef(false);

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

    // Filter out invalid ads and ensure all required fields are present
    const validAds = adConfig.midRoll.filter(
      (ad) =>
        ad &&
        typeof ad.time === "number" &&
        ad.time >= 0 &&
        ad.time < Number.MAX_SAFE_INTEGER &&
        typeof ad.id === "string" &&
        ad.id.trim() !== "" &&
        typeof ad.adUrl === "string" &&
        ad.adUrl.trim() !== "" &&
        typeof ad.type === "string" &&
        ad.type === "mid-roll"
    );

    if (validAds.length === 0) {
      setMidRollQueue([]);
      return;
    }

    // Sort ads by time to ensure they play in order
    const sortedMidRolls = [...validAds].sort((a, b) => a.time - b.time);

    // Remove duplicate IDs (keep first occurrence)
    const uniqueAds = sortedMidRolls.filter(
      (ad, index, self) => index === self.findIndex((a) => a.id === ad.id)
    );

    setMidRollQueue(uniqueAds);
  }, [adConfig?.midRoll, setMidRollQueue]);

  // Removed smartPlacement - users should configure exact ad times
  // This ensures ads appear exactly when specified

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

  const playMidRollAd = useCallback(
    async (adBreak: AdBreak) => {
      if (!videoRef || isAdPlaying || isProcessingAdRef.current) return;

      // Prevent duplicate ad playback
      if (playedAdBreaks.includes(adBreak.id)) return;

      // Mark as processing to prevent race conditions
      isProcessingAdRef.current = true;

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

      // Reset processing flag after a short delay
      setTimeout(() => {
        isProcessingAdRef.current = false;
      }, 100);
    },
    [
      videoRef,
      isAdPlaying,
      playedAdBreaks,
      midRollQueue,
      setMidRollQueue,
      addPlayedAdBreak,
      setPlaying,
      setIsPlaying,
      setCurrentAd,
      setAdType,
      setIsAdPlaying,
      adConfig,
      stopMediaElement,
    ]
  );

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

    // Reset processing flag
    isProcessingAdRef.current = false;

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
    if (
      resumeAfterAdRef.current &&
      adTypeState !== "post-roll" &&
      videoRefState
    ) {
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

  // Precise mid-roll ad checking with accurate timing
  useEffect(() => {
    if (!videoRef || !adConfig?.midRoll || isAdPlaying) {
      // Clear any pending throttle
      if (adCheckThrottleRef.current !== null) {
        cancelAnimationFrame(adCheckThrottleRef.current);
        adCheckThrottleRef.current = null;
      }
      return;
    }

    // Precise ad check function
    const checkMidRollAds = () => {
      // Clear throttle ref
      adCheckThrottleRef.current = null;

      const state = useVideoStore.getState();

      // Skip if ad is already playing or being processed
      if (state.isAdPlaying || isProcessingAdRef.current) {
        return;
      }

      // Check if we have mid-roll ads in queue
      if (!state.midRollQueue || state.midRollQueue.length === 0) {
        return;
      }

      // Get current time directly from video element for maximum accuracy
      const currentVideoTime = videoRef.currentTime || 0;

      // Update max time reached (only forward, not backward)
      if (currentVideoTime > maxTimeReachedRef.current) {
        maxTimeReachedRef.current = currentVideoTime;
      }

      // Find the next ad in queue that should play
      // Check ads in order, but skip already-played ones
      for (const ad of state.midRollQueue) {
        // Skip if already played
        if (state.playedAdBreaks.includes(ad.id)) {
          continue;
        }

        // Precise timing check: ad should trigger when we reach or pass its time
        // Use 1 second tolerance to catch ads even if timeupdate fires slightly late
        const timeDifference = currentVideoTime - ad.time;
        const shouldTrigger = timeDifference >= 0 && timeDifference <= 1.0;

        // Also check if we've reached the max time (prevents replay on backward seek)
        // This ensures ads only play if we've actually watched past them
        const hasReachedMaxTime = maxTimeReachedRef.current >= ad.time;

        if (shouldTrigger && hasReachedMaxTime) {
          // Play the ad and break (only one ad at a time)
          playMidRollAd(ad);
          break;
        }
      }
    };

    // Throttle function using requestAnimationFrame for smooth performance
    const throttledCheck = () => {
      if (adCheckThrottleRef.current === null) {
        adCheckThrottleRef.current = requestAnimationFrame(checkMidRollAds);
      }
    };

    // Listen to timeupdate event (throttled for performance)
    videoRef.addEventListener("timeupdate", throttledCheck);

    // Also check immediately on seek to catch rapid seeks past ad times
    const handleSeeking = () => {
      // Force immediate check when seeking
      if (adCheckThrottleRef.current !== null) {
        cancelAnimationFrame(adCheckThrottleRef.current);
        adCheckThrottleRef.current = null;
      }
      // Check immediately
      checkMidRollAds();
    };

    videoRef.addEventListener("seeking", handleSeeking);
    videoRef.addEventListener("seeked", handleSeeking);

    return () => {
      videoRef.removeEventListener("timeupdate", throttledCheck);
      videoRef.removeEventListener("seeking", handleSeeking);
      videoRef.removeEventListener("seeked", handleSeeking);

      // Clear any pending animation frame
      if (adCheckThrottleRef.current !== null) {
        cancelAnimationFrame(adCheckThrottleRef.current);
        adCheckThrottleRef.current = null;
      }
    };
  }, [videoRef, isAdPlaying, adConfig, playMidRollAd]);

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

    // Reset ad state when video source changes
    preRollPlayedRef.current = false;
    postRollPlayedRef.current = false;
    resumeAfterAdRef.current = false;
    maxTimeReachedRef.current = 0;
    isProcessingAdRef.current = false;

    // Clear any pending throttle
    if (adCheckThrottleRef.current !== null) {
      cancelAnimationFrame(adCheckThrottleRef.current);
      adCheckThrottleRef.current = null;
    }

    setIsAdPlaying(false);
    setCurrentAd(null);
    setAdType(null);

    // Re-initialize mid-roll queue with strict validation
    if (adConfig?.midRoll && adConfig.midRoll.length > 0) {
      // Filter and validate ads
      const validAds = adConfig.midRoll.filter(
        (ad) =>
          ad &&
          typeof ad.time === "number" &&
          ad.time >= 0 &&
          typeof ad.id === "string" &&
          ad.id.trim() !== "" &&
          typeof ad.adUrl === "string" &&
          ad.adUrl.trim() !== "" &&
          typeof ad.type === "string" &&
          ad.type === "mid-roll"
      );

      if (validAds.length > 0) {
        // Sort by time and remove duplicates
        const sortedMidRolls = [...validAds].sort((a, b) => a.time - b.time);
        const uniqueAds = sortedMidRolls.filter(
          (ad, index, self) => index === self.findIndex((a) => a.id === ad.id)
        );
        setMidRollQueue(uniqueAds);
      } else {
        setMidRollQueue([]);
      }
    } else {
      setMidRollQueue([]);
    }

    // Clean up any lingering ad video
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
