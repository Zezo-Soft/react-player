import { StateCreator } from "zustand";
import { VideoQualityState, VideoState } from "../types/StoreTypes";
import Hls from "hls.js";

export const createVideoQualitySlice: StateCreator<
  VideoState,
  [],
  [],
  VideoQualityState
> = (set) => ({
  hlsInstance: undefined,
  setHlsInstance: (hlsInstance: Hls | null) => set({ hlsInstance }),
  
  dashInstance: undefined,
  setDashInstance: (dashInstance) => set({ dashInstance }),
  
  qualityLevels: undefined,
  setQualityLevels: (qualityLevels) => set({ qualityLevels }),
  
  activeQuality: "auto",
  setActiveQuality: (activeQuality) => set({ activeQuality }),
  
  streamType: "mp4",
  setStreamType: (streamType) => set({ streamType }),
});