import { StateCreator } from "zustand";
import { VideoPlaybackState, VideoState } from "../types/StoreTypes";

export const createVideoPlaybackSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoPlaybackState
> = (set) => ({
  playing: false,
  setPlaying: (playing: boolean) => set({ playing }),

  isBuffering: false,
  setIsBuffering: (isBuffering: boolean) => set({ isBuffering }),

  isPlaying: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  muted: false,
  setMuted: (muted: boolean) => set({ muted }),

  volume: 1,
  setVolume: (volume: number) => set({ volume }),
});
