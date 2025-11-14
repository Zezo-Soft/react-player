import Hls from "hls.js";
import * as dashjs from "dashjs";
import { AdBreak, AdType } from "../../VideoPlayer/types/AdTypes";

export type StreamType = "hls" | "dash" | "mp4" | "other";

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

export interface VideoTimingState {
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  bufferedProgress: number;
  setBufferedProgress: (progress: number) => void;
}

export interface VideoControlsState {
  controls: boolean;
  setControls: (controls: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export interface VideoQualityState {
  hlsInstance: Hls | null;
  setHlsInstance: (hlsInstance: Hls | null) => void;

  dashInstance: dashjs.MediaPlayerClass | null;
  setDashInstance: (dashInstance: dashjs.MediaPlayerClass | null) => void;

  qualityLevels: Array<{
    height: number;
    bitrate?: number;
    originalIndex: number;
    id?: string;
  }>;
  setQualityLevels: (
    qualityLevels: Array<{
      height: number;
      bitrate?: number;
      originalIndex: number;
      id?: string;
    }>
  ) => void;

  activeQuality: string;
  setActiveQuality: (activeQuality: string) => void;

  currentQuality: string;
  setCurrentQuality: (currentQuality: string) => void;

  streamType: StreamType;
  setStreamType: (streamType: StreamType) => void;
}

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

export interface IntroState {
  showIntroSkip: boolean;
  setShowIntroSkip: (show: boolean) => void;
}

export interface StoreResetState {
  resetStore: () => void;
}

export interface AdsState {
  isAdPlaying: boolean;
  setIsAdPlaying: (isAdPlaying: boolean) => void;
  currentAd: AdBreak | null;
  setCurrentAd: (ad: AdBreak | null) => void;
  adType: AdType | null;
  setAdType: (type: AdType | null) => void;
  adCurrentTime: number;
  setAdCurrentTime: (time: number) => void;
  canSkipAd: boolean;
  setCanSkipAd: (canSkip: boolean) => void;
  skipCountdown: number;
  setSkipCountdown: (countdown: number) => void;
  playedAdBreaks: string[];
  addPlayedAdBreak: (id: string) => void;
  midRollQueue: AdBreak[];
  setMidRollQueue: (queue: AdBreak[]) => void;
  adVideoRef: HTMLVideoElement | null;
  setAdVideoRef: (ref: HTMLVideoElement | null) => void;
}

export interface VideoState
  extends VideoRefsState,
    VideoPlaybackState,
    VideoTimingState,
    VideoControlsState,
    VideoQualityState,
    SubtitlesState,
    EpisodesState,
    IntroState,
    AdsState,
    StoreResetState {}
