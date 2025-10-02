import "./index.css";
export { default as VideoPlayer } from "./VideoPlayer/VideoPlayer";
export { useVideoStore } from "./store/VideoState";
export type {
  VideoPlayerProps,
  Episode,
  SubtitleTrack,
  IntroConfig,
  NextEpisodeConfig,
} from "./VideoPlayer/types/VideoPlayerTypes";

// Export subtitle styling types
export type { SubtitleStyleConfig } from "./VideoPlayer/hooks/useSubtitleStyling";

// Export store types
export type {
  VideoState,
  VideoRefsState,
  VideoPlaybackState,
  VideoTimingState,
  VideoControlsState,
  VideoQualityState,
  SubtitlesState,
  EpisodesState,
  IntroState,
} from "./store/types/StoreTypes";
