import React from "react";
import Tooltip from "../../components/ui/tooltip";
import PiPictureInPictureToggle from "../../components/ui/PiPictureInPictureToggle";

interface PiPToggleButtonProps {
  isPipActive: boolean;
  onTogglePip: () => void;
  iconClassName: string;
}

const PiPToggleButton: React.FC<PiPToggleButtonProps> = ({
  isPipActive,
  onTogglePip,
  iconClassName,
}) => {
  return (
    <Tooltip title={isPipActive ? "Exit PiP" : "Enter PiP"}>
      <div onClick={onTogglePip}>
        <PiPictureInPictureToggle className={iconClassName} />
      </div>
    </Tooltip>
  );
};

export default PiPToggleButton;
