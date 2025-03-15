import Hls from "hls.js";
import { create } from "zustand";

interface VideoState {
  videoRef: HTMLVideoElement | null;
  setVideoRef: (ref: HTMLVideoElement) => void;
  videoWrapperRef: HTMLDivElement | null;
  setVideoWrapperRef: (ref: HTMLDivElement) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  controls: boolean;
  setControls: (controls: boolean) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  hlsInstance?: Hls;
  setHlsInstance: (hlsInstance: Hls) => void;
  qualityLevels?: Hls["levels"];
  setQualityLevels: (qualityLevels: Hls["levels"]) => void;
  activeQuality?: string;
  setActiveQuality: (activeQuality: string) => void;
  isFullscreen?: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  duration?: number;
  setDuration: (duration: number) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoRef: null,
  setVideoRef: (ref) => set({ videoRef: ref }),
  videoWrapperRef: null,
  setVideoWrapperRef: (ref) => set({ videoWrapperRef: ref }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  controls: false,
  setControls: (controls) => set({ controls }),
  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
  hlsInstance: undefined,
  setHlsInstance: (hlsInstance) => set({ hlsInstance }),
  qualityLevels: undefined,
  setQualityLevels: (qualityLevels) => set({ qualityLevels }),
  activeQuality: "auto",
  setActiveQuality: (activeQuality) => set({ activeQuality }),
  isFullscreen: false,
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
}));
