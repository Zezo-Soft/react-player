import Hls from "hls.js";
import * as dashjs from "dashjs";

export interface VideoRefsState {
  videoRef: HTMLVideoElement | null;
  setVideoRef: (ref: HTMLVideoElement) => void;
  videoWrapperRef: HTMLDivElement | null;
  setVideoWrapperRef: (ref: HTMLDivElement) => void;
}

export interface VideoPlaybackState {
  playing: boolean;
  setPlaying: (playing: boolean) => void;

  isBuffering: boolean;
  setIsBuffering: (isBuffering: boolean) => void;

  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;

  muted: boolean;
  setMuted: (muted: boolean) => void;

  volume: number;
  setVolume: (volume: number) => void;
}

// Video timing and progress
export interface VideoTimingState {
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  bufferedProgress: number;
  setBufferedProgress: (progress: number) => void;
}

// Video controls and UI
export interface VideoControlsState {
  controls: boolean;
  setControls: (controls: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;

  controlsVisible: boolean;
  setControlsVisible: (visible: boolean) => void;
}

// Video quality state
export interface VideoQualityState {
  hlsInstance?: Hls | null; // null for native HLS, undefined when not available
  setHlsInstance: (hlsInstance: Hls | null) => void;
  
  dashInstance?: dashjs.MediaPlayerClass;
  setDashInstance: (dashInstance: dashjs.MediaPlayerClass) => void;
  
  qualityLevels?: Array<{
    height: number;
    bitrate?: number;
    originalIndex: number;
    id?: string; // For DASH
  }>;
  setQualityLevels: (qualityLevels: Array<{
    height: number;
    bitrate?: number;
    originalIndex: number;
    id?: string;
  }>) => void;
  
  activeQuality: string;
  setActiveQuality: (activeQuality: string) => void;
  
  streamType: "hls" | "dash" | "mp4" | "other";
  setStreamType: (streamType: "hls" | "dash" | "mp4" | "other") => void;
}

// Subtitle types and state
export interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

export interface SubtitlesState {
  activeSubtitle: SubtitleTrack | null;
  setActiveSubtitle: (subtitle: SubtitleTrack | null) => void;
  subtitles: SubtitleTrack[];
  setSubtitles: (subtitles: SubtitleTrack[]) => void;
}

// Episode types and state
export interface Episode {
  id: number;
  title: string;
  url: string;
}

export interface EpisodesState {
  episodeList: Episode[];
  setEpisodeList: (list: Episode[]) => void;
  currentEpisodeIndex: number;
  setCurrentEpisodeIndex: (index: number) => void;
  showCountdown: boolean;
  setShowCountdown: (show: boolean) => void;
  countdownTime: number;
  setCountdownTime: (time: number) => void;
  autoPlayNext: boolean;
  setAutoPlayNext: (value: boolean) => void;
}

// Intro skip state
export interface IntroState {
  showIntroSkip: boolean;
  setShowIntroSkip: (show: boolean) => void;
}

// Store reset functionality
export interface StoreResetState {
  resetStore: () => void;
}

// Combined video store state
export interface VideoState
  extends VideoRefsState,
    VideoPlaybackState,
    VideoTimingState,
    VideoControlsState,
    VideoQualityState,
    SubtitlesState,
    EpisodesState,
    IntroState,
    StoreResetState {}