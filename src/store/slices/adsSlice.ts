import { StateCreator } from "zustand";
import {
  AdBreak,
  AdProvider,
  AdType,
  ImaPlaybackApi,
} from "../../VideoPlayer/types/AdTypes";
import { VideoState } from "../types/StoreTypes";

export interface AdsState {
  isAdPlaying: boolean;
  setIsAdPlaying: (isAdPlaying: boolean) => void;

  adProvider: AdProvider | null;
  setAdProvider: (provider: AdProvider | null) => void;

  currentAd: AdBreak | null;
  setCurrentAd: (ad: AdBreak | null) => void;

  adType: AdType | null;
  setAdType: (type: AdType | null) => void;

  adCurrentTime: number;
  setAdCurrentTime: (time: number) => void;

  canSkipAd: boolean;
  setCanSkipAd: (canSkip: boolean) => void;

  skipCountdown: number;
  setSkipCountdown: (countdown: number) => void;

  playedAdBreaks: string[];
  addPlayedAdBreak: (id: string) => void;

  midRollQueue: AdBreak[];
  setMidRollQueue: (queue: AdBreak[]) => void;

  adVideoRef: HTMLVideoElement | null;
  setAdVideoRef: (ref: HTMLVideoElement | null) => void;

  imaAdContainerRef: HTMLDivElement | null;
  setImaAdContainerRef: (ref: HTMLDivElement | null) => void;

  imaPlayback: ImaPlaybackApi | null;
  setImaPlayback: (api: ImaPlaybackApi | null) => void;

  imaDestroy: (() => void) | null;
  setImaDestroy: (fn: (() => void) | null) => void;

  /** True when the current IMA ad can become skippable (VAST skip offset). */
  imaSkipEnabled: boolean;
  setImaSkipEnabled: (enabled: boolean) => void;

  /** True once IMA pre-roll finished, failed, or timed out (unblocks content UI). */
  imaPreRollGateComplete: boolean;
  setImaPreRollGateComplete: (complete: boolean) => void;
}

export const createAdsSlice: StateCreator<VideoState, [], [], AdsState> = (
  set,
  get
) => ({
  isAdPlaying: false,
  setIsAdPlaying: (isAdPlaying) => set({ isAdPlaying }),

  adProvider: null,
  setAdProvider: (adProvider) => set({ adProvider }),

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

  imaAdContainerRef: null,
  setImaAdContainerRef: (imaAdContainerRef) => set({ imaAdContainerRef }),

  imaPlayback: null,
  setImaPlayback: (imaPlayback) => set({ imaPlayback }),

  imaDestroy: null,
  setImaDestroy: (imaDestroy) => set({ imaDestroy }),

  imaSkipEnabled: false,
  setImaSkipEnabled: (imaSkipEnabled) => set({ imaSkipEnabled }),

  imaPreRollGateComplete: false,
  setImaPreRollGateComplete: (imaPreRollGateComplete) =>
    set({ imaPreRollGateComplete }),
});
