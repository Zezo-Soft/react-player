import { StateCreator } from "zustand";
import { VideoTimingState, VideoState } from "../types/StoreTypes";

export const createVideoTimingSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoTimingState
> = (set) => ({
  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
  
  duration: 0,
  setDuration: (duration) => set({ duration }),
});
