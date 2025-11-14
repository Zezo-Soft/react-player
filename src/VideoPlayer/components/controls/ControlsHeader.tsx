import * as React from "react";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import FullScreenToggle from "../../../components/ui/FullScreenToggle";
import PiPictureInPictureToggle from "../../../components/ui/PiPictureInPictureToggle";
import Settings from "../../../components/ui/Settings";
import { useVideoStore } from "../../../store/VideoState";
import { IControlsHeaderProps } from "../../../types";
import "../styles/video-controls.css";
import screenfull from "screenfull";
import Tooltip from "../../../components/ui/Tooltip";
import { useShallow } from "zustand/react/shallow";

const ControlsHeader: React.FC<IControlsHeaderProps> = ({ config }) => {
  const iconClassName = "icon-button";

  const {
    videoWrapperRef,
    videoRef,
    adVideoRef,
    episodeList,
    currentEpisodeIndex,
    resetStore,
    isAdPlaying,
    muted,
    setMuted,
  } = useVideoStore(
    useShallow((state) => ({
      videoWrapperRef: state.videoWrapperRef,
      videoRef: state.videoRef,
      adVideoRef: state.adVideoRef,
      episodeList: state.episodeList,
      currentEpisodeIndex: state.currentEpisodeIndex,
      resetStore: state.resetStore,
      isAdPlaying: state.isAdPlaying,
      muted: state.muted,
      setMuted: state.setMuted,
    }))
  );

  const [isPipActive, setIsPipActive] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleFullscreen = () => {
    if (!screenfull.isEnabled || isPipActive) return;

    if (screenfull.isFullscreen) {
      screenfull.exit();
    } else if (videoWrapperRef) {
      screenfull.request(videoWrapperRef);
    }
  };

  React.useEffect(() => {
    if (!screenfull.isEnabled) return;

    const changeHandler = () => setIsFullscreen(screenfull.isFullscreen);
    screenfull.on("change", changeHandler);

    return () => {
      screenfull.off("change", changeHandler);
    };
  }, []);

  const handleMute = () => {
    const targetElement = isAdPlaying ? adVideoRef ?? videoRef : videoRef;
    if (!targetElement) return;

    const nextMuted = !targetElement.muted;

    if (videoRef && videoRef.muted !== nextMuted) {
      videoRef.muted = nextMuted;
    }
    if (adVideoRef && adVideoRef.muted !== nextMuted) {
      adVideoRef.muted = nextMuted;
    }

    setMuted(nextMuted);
  };

  const handlePipToggle = async () => {
    if (!videoRef) return;
    try {
      if (!document.pictureInPictureElement && !isPipActive) {
        await videoRef.requestPictureInPicture();
        setIsPipActive(true);
      } else if (document.pictureInPictureElement && isPipActive) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      }
    } catch (_error) {}
  };

  React.useEffect(() => {
    const handlePipChange = () =>
      setIsPipActive(!!document.pictureInPictureElement);
    document.addEventListener("enterpictureinpicture", handlePipChange);
    document.addEventListener("leavepictureinpicture", handlePipChange);
    return () => {
      document.removeEventListener("enterpictureinpicture", handlePipChange);
      document.removeEventListener("leavepictureinpicture", handlePipChange);
    };
  }, []);

  const handleClose = () => {
    resetStore();
    if (config?.onClose) {
      config.onClose();
    }
  };

  const renderAdHeader = () => (
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center rounded bg-[#2D2F31] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-500">
        Ad
      </span>
    </div>
  );

  const renderVideoHeader = () => (
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
  );

  return (
    <div className="flex items-center justify-between p-10 bg-linear-to-b from-black">
      {isAdPlaying ? renderAdHeader() : renderVideoHeader()}

      <div className="flex items-center gap-7 text-white">
        {!isAdPlaying && <Settings iconClassName={iconClassName} />}

        <div onClick={handleMute}>
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

        <Tooltip
          title={
            isPipActive
              ? "Disabled in PiP"
              : isFullscreen
              ? "Exit Fullscreen"
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

        {!isAdPlaying && (
          <Tooltip
            className="whitespace-nowrap"
            title={isPipActive ? "Exit PiP" : "Enter PiP"}
          >
            <div onClick={handlePipToggle}>
              <PiPictureInPictureToggle className={iconClassName} />
            </div>
          </Tooltip>
        )}

        {config?.onClose && (
          <>
            <div className="w-[2px] h-10 bg-gray-500 hover:bg-gray-300 mx-2" />
            <div onClick={handleClose}>
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
