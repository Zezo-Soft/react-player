import { SubtitleTrack } from "../store";
import { TimeCode } from "../VideoPlayer/components/time-line/TimeLine";
import { VideoQualityConfig } from "../VideoPlayer/types/VideoPlayerTypes";

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
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
}

export interface IControlsBottomProps {
  config?: {
    seekBarConfig?: ISeekBarConfig;
  };
}

export interface IPlayerConfig {
  width?: string;
  height?: string;
  config?: {
    headerConfig?: IControlsHeaderProps;
    bottomConfig?: IControlsBottomProps;
  };
}

export interface IOnWatchTimeUpdated {
  watchTime?: number;
  currentTime: number;
  duration: number;
}
