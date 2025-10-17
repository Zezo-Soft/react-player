import { StateCreator } from "zustand";
import { VideoControlsState, VideoState } from "../types/StoreTypes";

export const createVideoControlsSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoControlsState
> = (set) => ({
  controls: false,
  setControls: (controls) => set({ controls }),
  
  isFullscreen: false,
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
});
