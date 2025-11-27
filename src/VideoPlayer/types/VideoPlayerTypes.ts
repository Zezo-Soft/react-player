import { TimeCode } from "../components/time-line/TimeLine";
import { IOnWatchTimeUpdated } from "../../types";
import { SubtitleStyleConfig } from "../hooks/useSubtitleStyling";
import { AdConfig } from "./AdTypes";


export interface VideoProps {
  src: string;
  title?: string;
  poster?: string;
  type?: "hls" | "dash" | "mp4" | "other" | "youtube" | undefined;
  isTrailer?: boolean;
  showControls?: boolean;
  isMute?: boolean;
  startFrom?: number;
}

export interface StyleProps {
  className?: string;
  width?: string;
  height?: string;
  subtitleStyle?: SubtitleStyleConfig;
}

export interface EventProps {
  onEnded?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onError?: (e?: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  onClose?: () => void;
}

export interface FeatureProps {
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
  ads?: AdConfig;
}

export interface VideoPlayerProps {
  video: VideoProps;
  style?: StyleProps;
  events?: EventProps;
  features?: FeatureProps;
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
