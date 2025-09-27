import * as React from "react";
import { FaCheck } from "react-icons/fa";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import Popover from "../../components/ui/Popover";
import FullScreenToggle from "../../components/ui/FullScreenToggle";
import { Settings } from "lucide-react";
import PiPictureInPictureToggle from "../../components/ui/PiPictureInPictureToggle";
import { IoMdClose } from "react-icons/io";
import "../_components/styles/video-controls.css";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const iconClassName = "icon-button";

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

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef) {
      videoRef.playbackRate = newSpeed;
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

  const uniqueQualityLevels = React.useMemo(() => {
    if (!qualityLevels) return [];
    const seenHeights = new Set<number>();
    return qualityLevels.filter((level) => {
      if (seenHeights.has(level.height)) {
        return false;
      } else {
        seenHeights.add(level.height);
        return true;
      }
    });
  }, [qualityLevels]);

  return (
    <div className="flex items-center justify-between p-10 bg-gradient-to-b from-black">
      <div className="flex">
        <div>
          {config?.title && (
            <h1 className="text-gray-200 text-xl lg:text-4xl font-bold">
              {config.title}
            </h1>
          )}
          {config?.isTrailer && (
            <h1 className="text-gray-200 text-base lg:text-lg font-medium">
              Trailer
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-7 text-white">
        {/* Settings */}
        <div>
          <Tooltip title="Settings">
            <Popover button={<Settings className={iconClassName} />}>
              <div className="bg-white/90 backdrop-blur-md text-gray-900 rounded-md w-56 p-2">
                {/* Quality */}
                <div className="mb-2">
                  <p className="font-semibold mb-1 px-3 py-1 text-gray-700">
                    Quality
                  </p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        if (hlsInstance) {
                          hlsInstance.currentLevel = -1;
                          setActiveQuality("auto");
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 ${
                        activeQuality === "auto"
                          ? "bg-green-100 font-semibold"
                          : ""
                      }`}
                    >
                      {activeQuality === "auto" && (
                        <FaCheck className="text-green-500" />
                      )}
                      Auto
                    </button>
                    {uniqueQualityLevels
                      .map((level, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (hlsInstance) {
                              hlsInstance.currentLevel = index;
                              setActiveQuality(String(level.height));
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 ${
                            activeQuality === String(level.height)
                              ? "bg-green-100 font-semibold"
                              : ""
                          }`}
                        >
                          {activeQuality === String(level.height) && (
                            <FaCheck className="text-green-500" />
                          )}
                          {level.height}p
                        </button>
                      ))
                      .reverse()}
                  </div>
                </div>

                {/* Subtitles */}
                <div className="mb-2">
                  <p className="font-semibold mb-1 px-3 py-1 text-gray-700">
                    Subtitles
                  </p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setActiveSubtitle(null)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 ${
                        !activeSubtitle ? "bg-green-100 font-semibold" : ""
                      }`}
                    >
                      {!activeSubtitle && (
                        <FaCheck className="text-green-500" />
                      )}
                      Off
                    </button>
                    {subtitles?.map((subtitle, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSubtitle(subtitle)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 ${
                          activeSubtitle?.label === subtitle.label
                            ? "bg-green-100 font-semibold"
                            : ""
                        }`}
                      >
                        {activeSubtitle?.label === subtitle.label && (
                          <FaCheck className="text-green-500" />
                        )}
                        {subtitle.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed */}
                <div>
                  <p className="font-semibold mb-1 px-3 py-1 text-gray-700">
                    Speed
                  </p>
                  <div className="flex flex-col gap-1">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 ${
                          speed === s ? "bg-green-100 font-semibold" : ""
                        }`}
                      >
                        {speed === s && <FaCheck className="text-green-500" />}
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Popover>
          </Tooltip>
        </div>

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
