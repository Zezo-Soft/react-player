import { StateCreator } from "zustand";
import { VideoTimingState, VideoState } from "../types/StoreTypes";

export const createVideoTimingSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoTimingState
> = (set: any) => ({
  currentTime: 0,
  setCurrentTime: (currentTime: number) => set({ currentTime }),
  
  duration: 0,
  setDuration: (duration: number) => set({ duration }),
  
  bufferedProgress: 0,
  setBufferedProgress: (progress: number) => set({ bufferedProgress: progress }),
});
