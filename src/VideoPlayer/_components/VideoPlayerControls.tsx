import * as React from "react";
import BottomControls from "./BottomControls";
import ControlsHeader from "./ControlsHeader";
import MiddleControls from "./MiddleControls";

interface IVideoPlayerControlsProps {
  className?: string;
  header?: {
    isFullscreen?: boolean;
    handleFullscreen?: () => void;
    handleMute?: () => void;
    isMute?: boolean;
    onClose?: () => void;
    isTrailer?: boolean;
    title?: string;
  };
  middle?: {
    handleBackword?: () => void;
    handleForword?: () => void;
    handlePlayAndPause?: () => void;
    isPlaying?: boolean;
    isBuffering?: boolean;
  };
  bottom?: {
    currentTime: number;
    duration: number;
    bufferTime: number;
    onChange: (currentTime: number) => void;
  };
}

const VideoPlayerControls: React.FC<IVideoPlayerControlsProps> = () => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex flex-col justify-between`}
    >
      <ControlsHeader title="The Dark Knight Rises" isTrailer />
      <MiddleControls />
      <BottomControls />
    </div>
  );
};

export default VideoPlayerControls;
