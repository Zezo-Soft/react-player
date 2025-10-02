import Hls from "hls.js";
import { Dispatch, SetStateAction } from "react";

// Base video element references
export interface VideoRefsState {
  videoRef: HTMLVideoElement | null;
  setVideoRef: (ref: HTMLVideoElement) => void;
  videoWrapperRef: HTMLDivElement | null;
  setVideoWrapperRef: (ref: HTMLDivElement) => void;
}

// Video playback state
export interface VideoPlaybackState {
  playing: boolean | ((prevState: boolean) => boolean);
  setPlaying: Dispatch<SetStateAction<boolean>>;
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
}

// Video controls and UI
export interface VideoControlsState {
  controls: boolean;
  setControls: (controls: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

// Video quality and streaming
export interface VideoQualityState {
  hlsInstance?: Hls;
  setHlsInstance: (hlsInstance: Hls) => void;
  qualityLevels?: Hls["levels"];
  setQualityLevels: (qualityLevels: Hls["levels"]) => void;
  activeQuality: string;
  setActiveQuality: (activeQuality: string) => void;
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

// Combined video store state
export interface VideoState 
  extends VideoRefsState,
          VideoPlaybackState,
          VideoTimingState,
          VideoControlsState,
          VideoQualityState,
          SubtitlesState,
          EpisodesState,
          IntroState {}
