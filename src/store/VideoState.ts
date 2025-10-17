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
} from "./slices";

export const useVideoStore = create<VideoState>()((...a) => ({
  ...createVideoRefsSlice(...a),
  ...createVideoPlaybackSlice(...a),
  ...createVideoTimingSlice(...a),
  ...createVideoControlsSlice(...a),
  ...createVideoQualitySlice(...a),
  ...createSubtitlesSlice(...a),
  ...createEpisodesSlice(...a),
  ...createIntroSlice(...a),
}));

// Previous version before recent edits code changes in panding
//   ...createVideoRefsSlice(...a),
//   ...createVideoPlaybackSlice(...a),
//   ...createVideoTimingSlice(...a),
//  ...createEpisodesSlice(...a),
//   ...createIntroSlice(...a),
