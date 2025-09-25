import * as React from "react";
import { useCallback, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import VideoPlayerControls from "./VideoPlayerControls";
import { IPlayerConfig } from "../../types";
import { FaGooglePlay } from "react-icons/fa";
import VideoActionButton from "../../components/ui/VideoActionButton";

const Overlay: React.FC<IPlayerConfig> = ({ config }) => {
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    setControls,
    controls,
    showCountdown,
    countdownTime,
    setShowCountdown,
    setAutoPlayNext,
    setCurrentEpisodeIndex,
    episodeList,
    setCountdownTime,
    videoRef,
    currentEpisodeIndex,
  } = useVideoStore();
  const { onClose } = config?.headerConfig?.config || {};

  const handleMouseEnter = useCallback(() => {
    const videoPlayerControls = document?.getElementById("videoPlayerControls");
    if (videoPlayerControls) {
      videoPlayerControls.classList.remove("noCursor");
    }
    setControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setControls(false);
      if (videoPlayerControls) {
        videoPlayerControls.classList.add("noCursor");
      }
    }, 2000);
  }, [setControls]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCountdown && countdownTime > 0 && episodeList.length > 0) {
      timer = setInterval(() => {
        setCountdownTime(countdownTime - 1);
      }, 2000);
    } else if (showCountdown && countdownTime === 0 && episodeList.length > 0) {
      const nextIndex = currentEpisodeIndex + 1;
      if (nextIndex < episodeList.length) {
        setCurrentEpisodeIndex(nextIndex);
        setAutoPlayNext(true);
        if (videoRef && episodeList[nextIndex]) {
          videoRef.src = episodeList[nextIndex].url;
          videoRef
            .play()
            .catch((err) => console.error("Auto-play failed:", err));
        }
      } else {
        if (onClose) onClose();
      }
      setShowCountdown(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    showCountdown,
    countdownTime,
    episodeList.length,
    setCountdownTime,
    setCurrentEpisodeIndex,
    currentEpisodeIndex,
    setAutoPlayNext,
    videoRef,
    episodeList,
    onClose,
  ]);

  const handleNextEpisodeManually = () => {
    const nextIndex = currentEpisodeIndex + 1;
    if (nextIndex < episodeList.length && videoRef && episodeList[nextIndex]) {
      setCurrentEpisodeIndex(nextIndex);
      setAutoPlayNext(true);
      videoRef.src = episodeList[nextIndex].url;
      videoRef.play().catch((err) => console.error("Manual play failed:", err));
      setShowCountdown(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div
      id="videoPlayerControls"
      className="absolute inset-0"
      onMouseMove={handleMouseEnter}
    >
      {controls && <VideoPlayerControls config={config} />}

      {showCountdown &&
        episodeList.length > 0 &&
        currentEpisodeIndex + 1 < episodeList.length && (
          <VideoActionButton
            text="Next Episode"
            onClick={handleNextEpisodeManually}
            icon={<FaGooglePlay className="text-black" />}
            disabled={currentEpisodeIndex + 1 >= episodeList.length}
            position="right"
          />
        )}
    </div>
  );
};

export default Overlay;
