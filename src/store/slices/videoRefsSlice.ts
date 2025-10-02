import { StateCreator } from "zustand";
import { VideoRefsState, VideoState } from "../types/StoreTypes";

export const createVideoRefsSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoRefsState
> = (set) => ({
  videoRef: null,
  setVideoRef: (ref) => set({ videoRef: ref }),
  
  videoWrapperRef: null,
  setVideoWrapperRef: (ref) => set({ videoWrapperRef: ref }),
});
