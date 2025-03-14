export interface IControlsHeaderProps {
  config?: {
    title?: string;
    isTrailer?: boolean;
  };
}

export interface IPlayerConfig {
  width?: string;
  height?: string;
  config?: {
    headerConfig?: IControlsHeaderProps;
  };
}
