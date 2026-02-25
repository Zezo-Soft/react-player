import { SubtitleTrack } from "../store";
import { TimeCode } from "../VideoPlayer/components/time-line/TimeLine";
import {
  VideoQualityConfig,
  SeekBarConfig,
  PlayPauseButtonConfig,
} from "../VideoPlayer/types/VideoPlayerTypes";

export interface IControlsHeaderProps {
  config?: {
    title?: string;
    isTrailer?: boolean;
    onClose?: () => void;
    subtitles?: SubtitleTrack[];
    activeSubtitle?: { lang: string; label: string; url: string } | null;
    videoRef?: any;
    qualityConfig?: VideoQualityConfig;
  };
}

export interface ISeekBarConfig {
  timeCodes?: TimeCode[];
  trackColor?: string;
  bufferColor?: string;
  hoverColor?: string;
  thumbColor?: string;
  trackBackgroundColor?: string;
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
}

export interface IControlsBottomProps {
  config?: {
    seekBarConfig?: ISeekBarConfig;
  };
}

export interface IControlsMiddleProps {
  config?: {
    playPauseButtonConfig?: PlayPauseButtonConfig;
  };
}

export interface IPlayerConfig {
  width?: string;
  height?: string;
  config?: {
    isLive?: boolean;
    headerConfig?: IControlsHeaderProps;
    bottomConfig?: IControlsBottomProps;
    middleConfig?: IControlsMiddleProps;
  };
}

export interface IOnWatchTimeUpdated {
  watchTime?: number;
  currentTime: number;
  duration: number;
}
