import * as React from "react";
import { IoMdClose } from "react-icons/io";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import Tooltip from "../../components/ui/tooltip";
import { useVideoStore } from "../../store/VideoState";
import { IControlsHeaderProps } from "../../types";
import Popover from "../../components/ui/Popover";
import FullScreenToggle from "./FullScreenToggle";
import { Settings } from "lucide-react";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const className = "w-5 h-5 lg:w-8 lg:h-8";
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

  React.useEffect(() => {}, [subtitles, activeSubtitle]);

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
              <IoVolumeMuteOutline className={className} />
            </Tooltip>
          ) : (
            <Tooltip title="Mute">
              <IoVolumeHighOutline className={className} />
            </Tooltip>
          )}
        </div>
        <Tooltip title={isFullscreen ? "Exit" : "Fullscreen"}>
          <div onClick={handleFullscreen}>
            <FullScreenToggle
              isFullScreen={isFullscreen}
              className={className}
            />
          </div>
        </Tooltip>
        {config?.onClose && (
          <>
            <div className="w-[2px] h-10 bg-white mx-1" />
            <div onClick={config.onClose}>
              <Tooltip title="Close">
                <IoMdClose className={className} />
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlsHeader;
