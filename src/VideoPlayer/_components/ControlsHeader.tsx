import * as React from "react";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import FullScreenToggle from "../../components/ui/FullScreenToggle";
import PiPictureInPictureToggle from "../../components/ui/PiPictureInPictureToggle";
import { IoMdClose } from "react-icons/io";
import Settings from "../../components/ui/Settings";
import "../_components/styles/video-controls.css";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const iconClassName = "icon-button";

  const { videoWrapperRef, videoRef, episodeList, currentEpisodeIndex } =
    useVideoStore();

  const [isPipActive, setIsPipActive] = React.useState(false);
  const isFullscreen = document.fullscreenElement !== null;

  const handleFullscreen = () => {
    if (isPipActive) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoWrapperRef?.requestFullscreen();
    }
  };

  const handleMute = () => {
    if (videoRef) {
      videoRef.muted = !videoRef.muted;
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

  return (
    <div className="flex items-center justify-between p-10 bg-gradient-to-b from-black">
      <div className="flex">
        <div>
          <h1 className="text-gray-200 text-lg lg:text-2xl font-semibold">
            {episodeList.length > 0
              ? episodeList[currentEpisodeIndex]?.title
              : config?.title}
          </h1>

          {config?.isTrailer && (
            <p className="text-gray-300 text-sm lg:text-base font-normal">
              Trailer
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-7 text-white">
        {/* Settings */}
        <Settings iconClassName={iconClassName} />

        {/* Volume */}
        <div onClick={handleMute}>
          {videoRef?.muted ? (
            <Tooltip title="Unmute">
              <IoVolumeMuteOutline className={iconClassName} />
            </Tooltip>
          ) : (
            <Tooltip title="Mute">
              <IoVolumeHighOutline className={iconClassName} />
            </Tooltip>
          )}
        </div>

        {/* Fullscreen */}
        <Tooltip
          title={
            isPipActive
              ? "Disabled in PiP"
              : isFullscreen
              ? "Exit"
              : "Fullscreen"
          }
          className={`${iconClassName} ${
            isPipActive ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div
            onClick={handleFullscreen}
            className={isPipActive ? "pointer-events-none" : ""}
          >
            <FullScreenToggle
              isFullScreen={isFullscreen}
              className={iconClassName}
            />
          </div>
        </Tooltip>

        {/* PiP */}
        <Tooltip title={isPipActive ? "Exit PiP" : "Enter PiP"}>
          <div onClick={handlePipToggle}>
            <PiPictureInPictureToggle className={iconClassName} />
          </div>
        </Tooltip>

        {/* Close */}
        {config?.onClose && (
          <>
            <div className="w-[2px] h-10 bg-gray-500 hover:bg-gray-300 mx-2" />
            <div onClick={config.onClose}>
              <Tooltip title="Close">
                <IoMdClose className={iconClassName} />
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlsHeader;
