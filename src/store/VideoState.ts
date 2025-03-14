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
}));
