import * as React from "react";
import BottomControls from "./BottomControls";
import ControlsHeader from "./ControlsHeader";
import MiddleControls from "./MiddleControls";
import { IPlayerConfig } from "../../types";

const VideoPlayerControls: React.FC<IPlayerConfig> = ({
  config,
}) => {
  return (
    <div className="px-20">
      <div
        className="absolute top-0 left-0 h-full w-full bg-[rgba(0,0,0,0.5)] flex flex-col justify-between"
      >
        <ControlsHeader config={config?.headerConfig?.config} />
        <MiddleControls />
        <BottomControls config={config?.bottomConfig?.config} />
      </div>
    </div>
  );
};

export default VideoPlayerControls;
