import { StateCreator } from "zustand";
import { VideoPlaybackState, VideoState } from "../types/StoreTypes";

export const createVideoPlaybackSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoPlaybackState
> = (set) => ({
  playing: false,
  setPlaying: (playing) => set({ playing }),
  
  isBuffering: false,
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  muted: false,
  setMuted: (muted) => set({ muted }),
  
  volume: 1,
  setVolume: (volume) => set({ volume }),
});
