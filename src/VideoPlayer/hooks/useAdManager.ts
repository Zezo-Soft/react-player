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
    } catch (_error) {
      // Element might already be paused; this is safe to ignore.
    }
    try {
      media.currentTime = 0;
    } catch (_error) {
      // Some live streams reject scrubbing prior to metadata; ignore to continue cleanup.
    }
    media.removeAttribute("src");
    media.load();
  }, []);

  // Initialize mid-roll queue with smart placement
  useEffect(() => {
    if (!adConfig?.midRoll || adConfig.midRoll.length === 0) {
      setMidRollQueue([]);
      return;
    }

    let sortedMidRolls = [...adConfig.midRoll].sort((a, b) => a.time - b.time);

    // Apply smart placement if enabled
    if (adConfig.smartPlacement?.enabled) {
      sortedMidRolls = applySmartPlacement(
        sortedMidRolls,
        duration,
        adConfig.smartPlacement
      );
    }

    setMidRollQueue(sortedMidRolls);
  }, [adConfig?.midRoll, adConfig?.smartPlacement, duration, setMidRollQueue]);

  // Helper function for smart ad placement
  const applySmartPlacement = (
    ads: AdBreak[],
    videoDuration: number,
    options: NonNullable<AdConfig["smartPlacement"]>
  ): AdBreak[] => {
    const minVideoDuration = options.minVideoDuration || 60;
    const minGap = options.minGapBetweenAds || 30;
    const avoidNearEnd = options.avoidNearEnd || 10;

    // Don't apply smart placement if video is too short
    if (videoDuration < minVideoDuration) {
      return [];
    }

    const validAds: AdBreak[] = [];
    let lastAdTime = 0;

    for (const ad of ads) {
      // Skip ads that are too early
      if (ad.time < minGap) continue;

      // Skip ads too close to the end
      if (ad.time > videoDuration - avoidNearEnd) continue;

      // Skip ads too close to previous ad
      if (ad.time - lastAdTime < minGap) continue;

      validAds.push(ad);
      const adLength = Number.isFinite(ad.duration)
        ? (ad.duration as number)
        : 0;
      lastAdTime = ad.time + adLength;
    }

    return validAds;
  };

  // Handle pre-roll ad
  const playPreRollAd = async () => {
    if (!adConfig?.preRoll || preRollPlayedRef.current || !videoRef) return;

    const adBreak = adConfig.preRoll;
    preRollPlayedRef.current = true;
    resumeAfterAdRef.current = true; // Pre-roll ads should hand control back to the main content automatically.

    // Tear down any lingering ad media before we spin up a new break to avoid overlapping audio.
    stopMediaElement(useVideoStore.getState().adVideoRef);

    // Pause main video
    videoRef.pause();
    setPlaying(false);
    setIsPlaying(false);

    // Set ad state
    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("pre-roll");

    // Callback
    adConfig.onAdStart?.(adBreak);

    // Ad video will be played by AdOverlay component when ref is set
  };

  // Handle mid-roll ads
  const checkMidRollAds = () => {
    if (!videoRef || isAdPlaying || midRollQueue.length === 0) return;

    const nextAd = midRollQueue[0];
    if (!nextAd) return;

    // Check if we've reached the ad time and haven't played this ad yet
    if (currentTime >= nextAd.time && !playedAdBreaks.includes(nextAd.id)) {
      playMidRollAd(nextAd);
    }
  };

  const playMidRollAd = async (adBreak: AdBreak) => {
    if (!videoRef || isAdPlaying) return;

    // Remove from queue
    const updatedQueue = midRollQueue.filter((ad) => ad.id !== adBreak.id);
    setMidRollQueue(updatedQueue);

    // Mark as played
    addPlayedAdBreak(adBreak.id);

    // Pause main video
    const wasPlaying = !videoRef.paused;
    videoRef.pause();
    setPlaying(false);
    setIsPlaying(false);
    resumeAfterAdRef.current = wasPlaying; // Only resume if the viewer had the main video playing pre-break.

    // Make sure any previous ad element releases its resources before the new one mounts.
    stopMediaElement(useVideoStore.getState().adVideoRef);

    // Set ad state
    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("mid-roll");

    // Callback
    adConfig?.onAdStart?.(adBreak);

    // Ad video will be played by AdOverlay component when ref is set
  };

  // Handle post-roll ad
  const playPostRollAd = async () => {
    if (!adConfig?.postRoll || postRollPlayedRef.current || !videoRef) return;

    const adBreak = adConfig.postRoll;
    postRollPlayedRef.current = true;
    resumeAfterAdRef.current = false; // Post-rolls mark the end of playback; avoid auto-resume.

    stopMediaElement(useVideoStore.getState().adVideoRef);

    // Set ad state
    setIsAdPlaying(true);
    setCurrentAd(adBreak);
    setAdType("post-roll");

    // Callback
    adConfig.onAdStart?.(adBreak);

    // Ad video will be played by AdOverlay component when ref is set
  };

  // End ad and resume video
  const endAd = useCallback(() => {
    const currentAdState = useVideoStore.getState().currentAd;
    const adTypeState = useVideoStore.getState().adType;
    const videoRefState = useVideoStore.getState().videoRef;
    const adVideoRefState = useVideoStore.getState().adVideoRef;

    if (!videoRefState || !currentAdState) return;

    // Stop ad video
    if (adVideoRefState) {
      // Force-stop the ad element so audio/video cannot linger after the overlay closes.
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

    // Callback
    adConfig?.onAdEnd?.(currentAdState);

    // Resume main video (except for post-roll)
    if (resumeAfterAdRef.current && adTypeState !== "post-roll") {
      videoRefState.play().catch(() => undefined);
      setPlaying(true);
      setIsPlaying(true);
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

  // Skip ad
  const skipAd = () => {
    if (!currentAd || !currentAd.skipable) return;

    // Callback
    adConfig?.onAdSkip?.(currentAd);

    // End ad
    endAd();
  };

  // Handle ad video ended
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
          } catch (_error) {
            // Some DRM streams may reject seeking; best effort only.
          }
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
    // Defensive clean-up to stop any orphaned ad media once the overlay disappears.
    stopMediaElement(adVideoRef);
    setAdVideoRef(null);
  }, [isAdPlaying, adVideoRef, setAdVideoRef, stopMediaElement]);

  // Play pre-roll ad when video is ready
  useEffect(() => {
    if (!videoRef || !adConfig?.preRoll || preRollPlayedRef.current) return;

    const handleCanPlay = () => {
      // Small delay to ensure video is ready
      setTimeout(() => {
        playPreRollAd();
      }, 500);
    };

    videoRef.addEventListener("canplay", handleCanPlay, { once: true });

    return () => {
      videoRef.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoRef, adConfig?.preRoll]);

  // Check for mid-roll ads periodically
  useEffect(() => {
    if (!videoRef || !adConfig?.midRoll || isAdPlaying) {
      if (midRollCheckIntervalRef.current) {
        clearInterval(midRollCheckIntervalRef.current);
        midRollCheckIntervalRef.current = null;
      }
      return;
    }

    // Check every second
    midRollCheckIntervalRef.current = setInterval(() => {
      const state = useVideoStore.getState();
      if (
        state.isAdPlaying ||
        !state.midRollQueue ||
        state.midRollQueue.length === 0
      ) {
        return;
      }

      const nextAd = state.midRollQueue[0];
      if (
        nextAd &&
        state.currentTime >= nextAd.time &&
        !state.playedAdBreaks.includes(nextAd.id)
      ) {
        // Remove from queue
        const updatedQueue = state.midRollQueue.filter(
          (ad) => ad.id !== nextAd.id
        );
        state.setMidRollQueue(updatedQueue);

        // Mark as played
        state.addPlayedAdBreak(nextAd.id);

        // Pause main video
        const wasPlaying = !state.videoRef?.paused;
        state.videoRef?.pause();
        state.setPlaying(false);
        state.setIsPlaying(false);
        resumeAfterAdRef.current = wasPlaying;

        // Set ad state
        state.setIsAdPlaying(true);
        state.setCurrentAd(nextAd);
        state.setAdType("mid-roll");

        // Callback
        adConfig?.onAdStart?.(nextAd);
      }
    }, 1000);

    return () => {
      if (midRollCheckIntervalRef.current) {
        clearInterval(midRollCheckIntervalRef.current);
        midRollCheckIntervalRef.current = null;
      }
    };
  }, [videoRef, isAdPlaying, adConfig]);

  // Handle video ended for post-roll
  useEffect(() => {
    if (!videoRef || !adConfig?.postRoll || postRollPlayedRef.current) return;

    const handleVideoEnded = () => {
      // Small delay before showing post-roll ad
      setTimeout(() => {
        playPostRollAd();
      }, 500);
    };

    videoRef.addEventListener("ended", handleVideoEnded);

    return () => {
      videoRef.removeEventListener("ended", handleVideoEnded);
    };
  }, [videoRef, adConfig?.postRoll]);

  // Reset ad state when video source changes
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

    // Ensure any previous ad media element releases its resources when the source switches.
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
