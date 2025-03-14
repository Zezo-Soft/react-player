import * as React from "react";
import {
  Maximize,
  Settings,
  Shrink,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import Popover from "../../components/ui/Popover";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const className = "w-5 h-5 lg:w-8 lg:h-8";
  const { videoWrapperRef, videoRef, qualityLevels, hlsInstance } =
    useVideoStore();
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoWrapperRef?.requestFullscreen();
    }
  };

  const isFullscreen = document.fullscreenElement !== null;

  const handleMute = () => {
    if (videoRef?.muted) {
      if (videoRef) {
        videoRef.muted = false;
      }
    } else {
      if (videoRef) {
        videoRef.muted = true;
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-10 bg-gradient-to-b from-black">
      <div>
        {config?.title && (
          <h1 className="text-white lg:text-2xl font-bold">{config.title}</h1>
        )}
        {config?.isTrailer && (
          <h1 className="text-white lg:text-lg">Trailer</h1>
        )}
      </div>

      <div className="flex items-center gap-7 text-white">
        <div>
          <Tooltip title="Settings">
            <Popover button={<Settings className={className} />}>
              <div className="bg-white text-black">
                {qualityLevels?.map((level, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      if (hlsInstance) {
                        hlsInstance.currentLevel = index;
                      }
                    }}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                  >
                    {level.height}
                  </p>
                ))}
              </div>
            </Popover>
          </Tooltip>
        </div>
        <div onClick={handleMute}>
          {videoRef?.muted ? (
            <Tooltip title="Unmute">
              <VolumeOff className={className} />
            </Tooltip>
          ) : (
            <Tooltip title="Mute">
              <Volume2 className={className} />
            </Tooltip>
          )}
        </div>
        <div onClick={handleFullscreen}>
          {isFullscreen ? (
            <Tooltip title="Exit">
              <Shrink className={className} />
            </Tooltip>
          ) : (
            <Tooltip title="Fullscreen">
              <Maximize className={className} />
            </Tooltip>
          )}
        </div>
        <div className="w-[2px] h-10 bg-white mx-1" />
        <div>
          <Tooltip title="Close">
            <X className={className} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
export default ControlsHeader;
