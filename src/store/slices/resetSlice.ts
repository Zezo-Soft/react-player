import { StateCreator } from "zustand";
import { StoreResetState, VideoState } from "../types/StoreTypes";

export const createResetSlice: StateCreator<
  VideoState,
  [],
  [],
  StoreResetState
> = (set, get) => ({
  resetStore: () => {
    const safeStopMediaElement = (media: HTMLVideoElement | null) => {
      if (!media) return;
      try {
        media.pause();
      } catch (_error) {
        // Already paused or unavailable; nothing else to do.
      }
      try {
        media.currentTime = 0;
      } catch (_error) {
        // Some browser streams reject seeks without metadata; ignore and keep tearing down.
      }
      media.removeAttribute("src");
      media.load();
    };

    const {
      videoRef,
      adVideoRef,
      hlsInstance,
      dashInstance,
    } = get();

    // Stop any active media to ensure audio/video cannot continue after the store resets.
    safeStopMediaElement(videoRef);
    safeStopMediaElement(adVideoRef);

    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }

    if (dashInstance && typeof dashInstance.reset === "function") {
      dashInstance.reset();
    }

    set({
      videoRef: null,
      videoWrapperRef: null,
      playing: false,
      isBuffering: false,
      isPlaying: false,
      muted: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      bufferedProgress: 0,
      controls: false,
      isFullscreen: false,
      hlsInstance: undefined,
      dashInstance: undefined,
      qualityLevels: undefined,
      activeQuality: "auto",
      activeSubtitle: null,
      subtitles: [],
      episodeList: [],
      currentEpisodeIndex: 0,
      showCountdown: false,
      countdownTime: 10,
      autoPlayNext: false,
      showIntroSkip: false,
      isAdPlaying: false,
      currentAd: null,
      adType: null,
      adCurrentTime: 0,
      canSkipAd: false,
      skipCountdown: 0,
      playedAdBreaks: [],
      midRollQueue: [],
      adVideoRef: null,
    });
  },
});
