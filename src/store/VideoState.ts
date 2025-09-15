import Hls from "hls.js";
import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface VideoState {
  videoRef: HTMLVideoElement | null;
  setVideoRef: (ref: HTMLVideoElement) => void;

  playing: boolean | ((prevState: boolean) => boolean);
  setPlaying: Dispatch<SetStateAction<boolean>>;

  videoWrapperRef: HTMLDivElement | null;
  setVideoWrapperRef: (ref: HTMLDivElement) => void;

  isBuffering?: boolean;
  setIsBuffering: (isBuffering: boolean) => void;

  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;

  muted: boolean;
  setMuted: (muted: boolean) => void;

  volume: number;
  setVolume: (volume: number) => void;

  controls: boolean;
  setControls: (controls: boolean) => void;

  currentTime: number;
  setCurrentTime: (currentTime: number) => void;

  duration: number;
  setDuration: (duration: number) => void;

  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;

  hlsInstance?: Hls;
  setHlsInstance: (hlsInstance: Hls) => void;

  qualityLevels?: Hls["levels"];
  setQualityLevels: (qualityLevels: Hls["levels"]) => void;

  activeQuality?: string;
  setActiveQuality: (activeQuality: string) => void;

  activeSubtitle?: { lang: string; label: string; url: string } | null;
  setActiveSubtitle: (
    subtitle: { lang: string; label: string; url: string } | null
  ) => void;

  subtitles: { lang: string; label: string; url: string }[];
  setSubtitles: (
    subtitles: { lang: string; label: string; url: string }[]
  ) => void;

  showIntroSkip: boolean;
  setShowIntroSkip: (show: boolean) => void;

  autoPlayNext: boolean;
  setAutoPlayNext: (value: boolean) => void;

  //  Next Episode
  episodeList: { id: number; title: string; url: string }[];
  setEpisodeList: (list: { id: number; title: string; url: string }[]) => void;
  currentEpisodeIndex: number;
  setCurrentEpisodeIndex: (index: number) => void;
  showCountdown: boolean;
  setShowCountdown: (show: boolean) => void;
  countdownTime: number;
  setCountdownTime: (time: number) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoRef: null,
  setVideoRef: (ref) => set({ videoRef: ref }),

  videoWrapperRef: null,
  setVideoWrapperRef: (ref) => set({ videoWrapperRef: ref }),

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

  controls: false,
  setControls: (controls) => set({ controls }),

  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),

  duration: 0,
  setDuration: (duration) => set({ duration }),

  isFullscreen: false,
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  hlsInstance: undefined,
  setHlsInstance: (hlsInstance) => set({ hlsInstance }),

  qualityLevels: undefined,
  setQualityLevels: (qualityLevels) => set({ qualityLevels }),

  activeQuality: "auto",
  setActiveQuality: (activeQuality) => set({ activeQuality }),

  activeSubtitle: null,
  setActiveSubtitle: (subtitle) => set({ activeSubtitle: subtitle }),

  subtitles: [],
  setSubtitles: (subtitles) => set({ subtitles }),

  showIntroSkip: false,
  setShowIntroSkip: (show) => set({ showIntroSkip: show }),

  autoPlayNext: false,
  setAutoPlayNext: (value) => set({ autoPlayNext: value }),

  //  Next Episode
  episodeList: [],
  setEpisodeList: (list) => set({ episodeList: list }),
  currentEpisodeIndex: 0,
  setCurrentEpisodeIndex: (index) => set({ currentEpisodeIndex: index }),
  showCountdown: false,
  setShowCountdown: (show) => set({ showCountdown: show }),
  countdownTime: 10,
  setCountdownTime: (time) => set({ countdownTime: time }),
}));
