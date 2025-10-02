import { StateCreator } from "zustand";
import { EpisodesState, VideoState } from "../types/StoreTypes";

export const createEpisodesSlice: StateCreator<
  VideoState,
  [],
  [],
  EpisodesState
> = (set) => ({
  episodeList: [],
  setEpisodeList: (list) => set({ episodeList: list }),
  
  currentEpisodeIndex: 0,
  setCurrentEpisodeIndex: (index) => set({ currentEpisodeIndex: index }),
  
  showCountdown: false,
  setShowCountdown: (show) => set({ showCountdown: show }),
  
  countdownTime: 10,
  setCountdownTime: (time) => set({ countdownTime: time }),
  
  autoPlayNext: false,
  setAutoPlayNext: (value) => set({ autoPlayNext: value }),
});
