import { StateCreator } from "zustand";
import { VideoQualityState, VideoState } from "../types/StoreTypes";

export const createVideoQualitySlice: StateCreator<
  VideoState,
  [],
  [],
  VideoQualityState
> = (set) => ({
  hlsInstance: undefined,
  setHlsInstance: (hlsInstance) => set({ hlsInstance }),
  
  qualityLevels: undefined,
  setQualityLevels: (qualityLevels) => set({ qualityLevels }),
  
  activeQuality: "auto",
  setActiveQuality: (activeQuality) => set({ activeQuality }),
});
