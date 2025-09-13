import * as React from "react";
import { FaCheck } from "react-icons/fa";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";

import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import Popover from "../../components/ui/Popover";
import FullScreenToggle from "./FullScreenToggle";
import { Settings } from "lucide-react";
import PiPictureInPictureToggle from "./PiPictureInPictureToggle";
import { IoMdClose } from "react-icons/io";

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

  const handleFullscreen = () => {
    if (isPipActive) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoWrapperRef?.requestFullscreen();
    }
  };

  const isFullscreen = document.fullscreenElement !== null;

  const handleMute = () => {
    if (videoRef?.muted) {
      if (videoRef) videoRef.muted = false;
    } else {
      if (videoRef) videoRef.muted = true;
    }
  };

  const [speed, setSpeed] = React.useState(1);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef) {
      videoRef.playbackRate = newSpeed;
    }
  };

  // PiP Mode State and Handler
  const [isPipActive, setIsPipActive] = React.useState(false);

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

  // Event listener for PiP changes
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
        {/* <div>
        {config?.title && (
          <h1 className="text-gray-200 text-base lg:text-xl font-semibold">
            {config.title}
          </h1>
        )}
        {config?.isTrailer && (
          <h1 className="text-gray-200 text-sm lg:text-base font-normal">
            Trailer
          </h1>
        )}
      </div> */}
      </div>

      <div className="flex items-center gap-7 text-white">
        <div>
          <Tooltip title="Settings">
            <Popover button={<Settings className={iconClassName} />}>
              <div className="text-black">
                <div>
                  <p className="p-2 font-bold">Quality</p>
                  <p
                    onClick={() => {
                      if (hlsInstance) {
                        hlsInstance.currentLevel = -1;
                        setActiveQuality("auto");
                      }
                    }}
                    className="p-2 cursor-pointer flex items-center gap-1.5"
                  >
                    {activeQuality === "auto" && <FaCheck />} Auto
                  </p>
                  {qualityLevels
                    ?.map((level, index) => (
                      <p
                        key={index}
                        onClick={() => {
                          if (hlsInstance) {
                            hlsInstance.currentLevel = index;
                            setActiveQuality(String(level.height));
                          }
                        }}
                        className="p-2 cursor-pointer flex items-center gap-1.5"
                      >
                        {activeQuality === String(level.height) && <FaCheck />}{" "}
                        {level.height}p
                      </p>
                    ))
                    .reverse()}
                </div>
                <div>
                  <p className="p-2 font-bold">Subtitles</p>
                  <p
                    onClick={() => {
                      setActiveSubtitle(null);
                      console.log("Subtitle set to Off");
                    }}
                    className="p-2 cursor-pointer flex items-center gap-1.5"
                  >
                    {!activeSubtitle && <FaCheck />} Off
                  </p>
                  {subtitles?.map((subtitle, index) => (
                    <p
                      key={index}
                      onClick={() => {
                        setActiveSubtitle(subtitle);
                        console.log("Subtitle selected:", subtitle.label);
                      }}
                      className="p-2 cursor-pointer flex items-center gap-1.5"
                    >
                      {activeSubtitle?.label === subtitle.label && <FaCheck />}{" "}
                      {subtitle.label}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="p-2 font-bold">Speed</p>
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <p
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className="p-2 cursor-pointer flex items-center gap-1.5"
                    >
                      {speed === s && <FaCheck />} {s}x
                    </p>
                  ))}
                </div>
              </div>
            </Popover>
          </Tooltip>
        </div>
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
        <Tooltip title={isPipActive ? "Exit PiP" : "Enter PiP"}>
          <div onClick={handlePipToggle}>
            <PiPictureInPictureToggle className={iconClassName} />
          </div>
        </Tooltip>
        {config?.onClose && (
          <>
            <div className="w-[2px] h-10 bg-gray-500 hover:bg-gray-300 transition-colors duration-200 mx-2" />
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
