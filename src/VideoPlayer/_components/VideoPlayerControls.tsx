import * as React from "react";
import BottomControls from "./BottomControls";
import ControlsHeader from "./ControlsHeader";
import MiddleControls from "./MiddleControls";
import { IPlayerConfig } from "../../types";

const VideoPlayerControls: React.FC<IPlayerConfig> = ({
  config,
  height,
  width,
}) => {
  return (
    <div
      className={`absolute top-0 left-0 ${height || "h-full"} ${
        width || "w-full"
      } bg-[rgba(0,0,0,0.5)] flex flex-col justify-between`}
    >
      <div className="flex flex-col justify-between px-6 lg:px-10 h-full w-full">
        <ControlsHeader config={config?.headerConfig?.config} />
        <MiddleControls />
        <BottomControls config={config?.bottomConfig?.config} />
      </div>
    </div>
  );
};

export default VideoPlayerControls;
