import { create } from "zustand";
import { VideoState } from "./types/StoreTypes";
import {
  createVideoRefsSlice,
  createVideoPlaybackSlice,
  createVideoTimingSlice,
  createVideoControlsSlice,
  createVideoQualitySlice,
  createSubtitlesSlice,
  createEpisodesSlice,
  createIntroSlice,
  createResetSlice,
} from "./slices";

export const useVideoStore = create<VideoState>()((set, get, store) => ({
  ...createVideoRefsSlice(set, get, store),
  ...createVideoPlaybackSlice(set, get, store),
  ...createVideoTimingSlice(set, get, store),
  ...createVideoControlsSlice(set, get, store),
  ...createVideoQualitySlice(set, get, store),
  ...createSubtitlesSlice(set, get, store),
  ...createEpisodesSlice(set, get, store),
  ...createIntroSlice(set, get, store),
  ...createResetSlice(set, get, store),
}));
