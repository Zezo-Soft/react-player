import { StateCreator } from "zustand";
import Hls from "hls.js";
import type { MediaPlayerClass } from "dashjs";
import {
  VideoQualityState,
  VideoState,
} from "../types/StoreTypes";

export const createVideoQualitySlice: StateCreator<
  VideoState,
  [],
  [],
  VideoQualityState
> = (set) => ({
  hlsInstance: null,
  setHlsInstance: (hlsInstance: Hls | null) => set({ hlsInstance }),
  dashInstance: null,
  setDashInstance: (dashInstance: MediaPlayerClass | null) =>
    set({ dashInstance }),
  qualityLevels: [],
  setQualityLevels: (
    qualityLevels: VideoQualityState["qualityLevels"]
  ) => set({ qualityLevels }),
  activeQuality: "auto",
  setActiveQuality: (activeQuality) => set({ activeQuality }),
  currentQuality: "auto",
  setCurrentQuality: (currentQuality) => set({ currentQuality }),
  streamType: "mp4",
  setStreamType: (streamType) => set({ streamType }),
});