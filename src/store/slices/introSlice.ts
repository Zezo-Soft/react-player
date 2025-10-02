import { StateCreator } from "zustand";
import { IntroState, VideoState } from "../types/StoreTypes";

export const createIntroSlice: StateCreator<
  VideoState,
  [],
  [],
  IntroState
> = (set) => ({
  showIntroSkip: false,
  setShowIntroSkip: (show) => set({ showIntroSkip: show }),
});
