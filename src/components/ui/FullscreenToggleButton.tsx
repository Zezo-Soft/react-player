import React from "react";
import Tooltip from "../../components/ui/tooltip";
import FullScreenToggle from "../../components/ui/FullScreenToggle";

interface FullscreenToggleButtonProps {
  isPipActive: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  iconClassName: string;
}

const FullscreenToggleButton: React.FC<FullscreenToggleButtonProps> = ({
  isPipActive,
  isFullscreen,
  onToggleFullscreen,
  iconClassName,
}) => {
  return (
    <Tooltip
      title={
        isPipActive ? "Disabled in PiP" : isFullscreen ? "Exit" : "Fullscreen"
      }
      className={`${iconClassName} ${
        isPipActive ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        onClick={onToggleFullscreen}
        className={isPipActive ? "pointer-events-none" : ""}
      >
        <FullScreenToggle
          isFullScreen={isFullscreen}
          className={iconClassName}
        />
      </div>
    </Tooltip>
  );
};

export default FullscreenToggleButton;
