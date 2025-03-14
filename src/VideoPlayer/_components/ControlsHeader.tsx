import * as React from "react";
import { Maximize, Shrink, Volume2, VolumeOff, X } from "lucide-react";
import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";

interface IControlsHeaderProps {
  onClose?: () => void;
  title?: string;
  isTrailer?: boolean;
}

const ControlsHeader: React.FC<IControlsHeaderProps> = ({
  onClose,
  title,
  isTrailer,
}) => {
  const className = "w-5 h-5 lg:w-8 lg:h-8";
  const { videoWrapperRef, videoRef } = useVideoStore();
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
        {title && <h1 className="text-white lg:text-2xl font-bold">{title}</h1>}
        {isTrailer && <h1 className="text-white lg:text-lg">Trailer</h1>}
      </div>

      <div className="flex items-center gap-7 text-white">
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
        <div onClick={onClose && onClose}>
          <Tooltip title="Close">
            <X className={className} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
export default ControlsHeader;
