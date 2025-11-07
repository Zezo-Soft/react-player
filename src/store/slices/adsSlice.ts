import { StateCreator } from "zustand";
import { AdBreak, AdType } from "../../VideoPlayer/types/AdTypes";
import { VideoState } from "../types/StoreTypes";

export interface AdsState {
  // Current ad state
  isAdPlaying: boolean;
  setIsAdPlaying: (isAdPlaying: boolean) => void;

  currentAd: AdBreak | null;
  setCurrentAd: (ad: AdBreak | null) => void;

  adType: AdType | null;
  setAdType: (type: AdType | null) => void;

  // Ad playback state
  adCurrentTime: number;
  setAdCurrentTime: (time: number) => void;

  // Skip functionality
  canSkipAd: boolean;
  setCanSkipAd: (canSkip: boolean) => void;

  skipCountdown: number;
  setSkipCountdown: (countdown: number) => void;

  // Ad breaks tracking
  playedAdBreaks: string[]; // IDs of ads that have been played
  addPlayedAdBreak: (id: string) => void;

  // Mid-roll ads queue
  midRollQueue: AdBreak[];
  setMidRollQueue: (queue: AdBreak[]) => void;

  // Ad video element
  adVideoRef: HTMLVideoElement | null;
  setAdVideoRef: (ref: HTMLVideoElement | null) => void;
}

export const createAdsSlice: StateCreator<VideoState, [], [], AdsState> = (
  set,
  get
) => ({
  isAdPlaying: false,
  setIsAdPlaying: (isAdPlaying) => set({ isAdPlaying }),

  currentAd: null,
  setCurrentAd: (currentAd) => set({ currentAd }),

  adType: null,
  setAdType: (adType) => set({ adType }),

  adCurrentTime: 0,
  setAdCurrentTime: (adCurrentTime) => set({ adCurrentTime }),

  canSkipAd: false,
  setCanSkipAd: (canSkipAd) => set({ canSkipAd }),

  skipCountdown: 0,
  setSkipCountdown: (skipCountdown) => set({ skipCountdown }),

  playedAdBreaks: [],
  addPlayedAdBreak: (id) =>
    set((state) => ({
      playedAdBreaks: [...state.playedAdBreaks, id],
    })),

  midRollQueue: [],
  setMidRollQueue: (midRollQueue) => set({ midRollQueue }),

  adVideoRef: null,
  setAdVideoRef: (adVideoRef) => set({ adVideoRef }),
});
