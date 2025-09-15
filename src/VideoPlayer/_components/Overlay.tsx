import * as React from "react";
import { useCallback, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import VideoPlayerControls from "./VideoPlayerControls";
import { IPlayerConfig } from "../../types";

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
    }, 3000);
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

      {showCountdown && episodeList.length > 0 && (
        <div className="absolute bottom-36 flex justify-end w-full right-32">
          <button
            onClick={handleNextEpisodeManually}
            disabled={currentEpisodeIndex + 1 >= episodeList.length}
            className="bg-white/60 text-gray-900 px-6 py-2 rounded-[6px] text-sm font-medium backdrop-blur-sm hover:bg-white/80 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/40"
          >
            Next Episode
          </button>
        </div>
      )}
    </div>
  );
};

export default Overlay;
