import React from "react";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import Tooltip from "../../components/ui/tooltip";

interface MuteToggleProps {
  muted: boolean;
  onToggleMute: () => void;
  iconClassName: string;
}

const MuteToggle: React.FC<MuteToggleProps> = ({
  muted,
  onToggleMute,
  iconClassName,
}) => {
  return (
    <div onClick={onToggleMute}>
      {muted ? (
        <Tooltip title="Unmute">
          <IoVolumeMuteOutline className={iconClassName} />
        </Tooltip>
      ) : (
        <Tooltip title="Mute">
          <IoVolumeHighOutline className={iconClassName} />
        </Tooltip>
      )}
    </div>
  );
};

export default MuteToggle;
