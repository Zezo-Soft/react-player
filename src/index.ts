import "./index.css";
export { default as VideoPlayer } from "./VideoPlayer/VideoPlayer";
export { useVideoStore } from "./store/VideoState";
export type {
  VideoPlayerProps,
  Episode,
  SubtitleTrack,
  IntroConfig,
  NextEpisodeConfig,
  WatchHistoryData,
} from "./VideoPlayer/types/VideoPlayerTypes";
export type { SubtitleStyleConfig } from "./VideoPlayer/hooks/useSubtitleStyling";
export type { VideoQualityConfig } from "./VideoPlayer/types/VideoPlayerTypes";
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
