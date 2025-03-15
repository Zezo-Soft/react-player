import { TimeCode } from "../VideoPlayer/_components/TimeLine/TimeLine";

export interface IControlsHeaderProps {
  config?: {
    title?: string;
    isTrailer?: boolean;
    onClose?: () => void;
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
