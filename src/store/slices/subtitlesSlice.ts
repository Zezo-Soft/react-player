import { StateCreator } from "zustand";
import { SubtitlesState, VideoState } from "../types/StoreTypes";

export const createSubtitlesSlice: StateCreator<
  VideoState,
  [],
  [],
  SubtitlesState
> = (set) => ({
  activeSubtitle: null,
  setActiveSubtitle: (subtitle) => set({ activeSubtitle: subtitle }),
  
  subtitles: [],
  setSubtitles: (subtitles) => set({ subtitles }),
});
