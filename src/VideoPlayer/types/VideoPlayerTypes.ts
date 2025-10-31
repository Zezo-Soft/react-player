import { TimeCode } from "../_components/TimeLine/TimeLine";
import { IOnWatchTimeUpdated } from "../../types";
import { SubtitleStyleConfig } from "../hooks/useSubtitleStyling";

export interface VideoPlayerProps {
  trackSrc: string;
  showControls?: boolean;
  isMute?: boolean;
  onEnded?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onError?: (e?: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  trackTitle?: string;
  trackPoster?: string;
  isTrailer?: boolean;
  className?: string;
  type?: "hls" | "mp4" | "other" | "youtube" | undefined;
  width?: string;
  height?: string;
  onClose?: () => void;
  timeCodes?: TimeCode[];
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
  tracking?: {
    onViewed?: () => void;
    onWatchTimeUpdated?: (e: IOnWatchTimeUpdated) => void;
  };
  subtitles?: {
    lang: string;
    label: string;
    url: string;
  }[];
  episodeList?: { id: number; title: string; url: string }[];
  currentEpisodeIndex?: number;
  intro?: {
    start: number;
    end: number;
  };
  nextEpisodeConfig?: { showAtTime?: number; showAtEnd?: boolean };
  subtitleStyle?: SubtitleStyleConfig;

}

export type { SubtitleTrack, Episode } from "../../store/types/StoreTypes";

export interface IntroConfig {
  start: number;
  end: number;
}

export interface NextEpisodeConfig {
  showAtTime?: number;
  showAtEnd?: boolean;
}
