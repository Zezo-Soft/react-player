import { StateCreator } from "zustand";
import { StoreResetState, VideoState } from "../types/StoreTypes";

export const createResetSlice: StateCreator<
  VideoState,
  [],
  [],
  StoreResetState
> = (set, get) => ({
  resetStore: () => {
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
    });
  },
});
