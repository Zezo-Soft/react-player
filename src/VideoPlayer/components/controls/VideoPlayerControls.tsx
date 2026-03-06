import * as React from "react";
import BottomControls from "./BottomControls";
import ControlsHeader from "./ControlsHeader";
import MiddleControls from "./MiddleControls";
import { IPlayerConfig } from "../../../types";

interface VideoPlayerControlsProps extends IPlayerConfig {
  isLive?: boolean;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  config,
  isLive = false,
}) => {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] flex flex-col justify-between">
        <ControlsHeader config={config?.headerConfig?.config} />
        <MiddleControls config={config?.middleConfig?.config} />
        <BottomControls
          config={config?.bottomConfig?.config}
          isLive={isLive}
        />
      </div>
    </div>
  );
};

export default VideoPlayerControls;


