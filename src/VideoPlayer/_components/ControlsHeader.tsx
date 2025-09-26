import React from "react";
import Tooltip from "../../components/ui/tooltip";
import Popover from "../../components/ui/Popover";
import { Settings } from "lucide-react";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import QualitySelector from "../../components/ui/QualitySelector";
import SubtitleSelector, {
  Subtitle,
} from "../../components/ui/SubtitleSelector";
import SpeedSelector from "../../components/ui/SpeedSelector";
import MuteToggle from "../../components/ui/MuteToggle";
import FullscreenToggleButton from "../../components/ui/FullscreenToggleButton";
import PiPToggleButton from "../../components/ui/PiPToggleButton";
import CloseButton from "../../components/ui/CloseButton";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const iconClassName =
    "w-5 h-5 lg:w-8 lg:h-8 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors duration-200";

  const {
    videoWrapperRef,
    videoRef,
    qualityLevels,
    hlsInstance,
    setActiveQuality,
    activeQuality,
    subtitles,
    activeSubtitle,
    setActiveSubtitle,
  } = useVideoStore();

  const [speed, setSpeed] = React.useState(1);
  const [isPipActive, setIsPipActive] = React.useState(false);

  const isFullscreen = document.fullscreenElement !== null;

  React.useEffect(() => {
    const handlePipChange = () => {
      setIsPipActive(!!document.pictureInPictureElement);
    };
    document.addEventListener("enterpictureinpicture", handlePipChange);
    document.addEventListener("leavepictureinpicture", handlePipChange);
    return () => {
      document.removeEventListener("enterpictureinpicture", handlePipChange);
      document.removeEventListener("leavepictureinpicture", handlePipChange);
    };
  }, []);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef) {
      videoRef.playbackRate = newSpeed;
    }
  };

  const handleMute = () => {
    if (videoRef?.muted) {
      if (videoRef) videoRef.muted = false;
    } else {
      if (videoRef) videoRef.muted = true;
    }
  };

  const handleFullscreen = () => {
    if (isPipActive) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoWrapperRef?.requestFullscreen();
    }
  };

  const handlePipToggle = async () => {
    if (videoRef) {
      if (!document.pictureInPictureElement && !isPipActive) {
        try {
          await videoRef.requestPictureInPicture();
          setIsPipActive(true);
        } catch (error) {
          console.error("PiP mode failed:", error);
        }
      } else if (document.pictureInPictureElement && isPipActive) {
        try {
          await document.exitPictureInPicture();
          setIsPipActive(false);
        } catch (error) {
          console.error("Exit PiP failed:", error);
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-10 bg-gradient-to-b from-black">
      <div className="flex">
        <div>
          {config?.title && (
            <h1 className="text-gray-200 text-lg lg:text-2xl font-semibold">
              {config.title}
            </h1>
          )}
          {config?.isTrailer && (
            <h1 className="text-gray-200 text-sm lg:text-base font-normal">
              Trailer
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-7 text-white">
        <Tooltip title="Settings">
          <Popover button={<Settings className={iconClassName} />}>
            <div className="bg-white/90 backdrop-blur-md text-gray-900 rounded-md w-56 p-2">
              {hlsInstance && (
                <QualitySelector
                  qualityLevels={qualityLevels || []}
                  activeQuality={activeQuality || "auto"}
                  setActiveQuality={setActiveQuality}
                  hlsInstance={hlsInstance}
                />
              )}

              <SubtitleSelector
                subtitles={subtitles}
                activeSubtitle={activeSubtitle ?? null}
                setActiveSubtitle={
                  setActiveSubtitle as (subtitle: Subtitle | null) => void
                }
              />
              <SpeedSelector speed={speed} onSpeedChange={handleSpeedChange} />
            </div>
          </Popover>
        </Tooltip>

        <MuteToggle
          muted={videoRef?.muted || false}
          onToggleMute={handleMute}
          iconClassName={iconClassName}
        />
        <FullscreenToggleButton
          isPipActive={isPipActive}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleFullscreen}
          iconClassName={iconClassName}
        />
        <PiPToggleButton
          isPipActive={isPipActive}
          onTogglePip={handlePipToggle}
          iconClassName={iconClassName}
        />
        {config?.onClose && (
          <CloseButton onClose={config.onClose} iconClassName={iconClassName} />
        )}
      </div>
    </div>
  );
};

export default ControlsHeader;
