import * as React from "react";
import { useCallback, useRef, useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";
import VideoPlayerControls from "../MediaControls/VideoPlayerControls";
import { IPlayerConfig } from "../../types";
import VideoActionButton from "../../components/ui/VideoActionButton";
import { ArrowRight } from "lucide-react";

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

  const HIDE_DELAY = 2000;

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setControls(false);
      const videoPlayerControls = document?.getElementById(
        "videoPlayerControls"
      );
      if (videoPlayerControls) {
        videoPlayerControls.classList.add("noCursor");
      }
    }, HIDE_DELAY);
  }, [setControls]);

  const handleMouseEnter = useCallback(() => {
    const videoPlayerControls = document?.getElementById("videoPlayerControls");
    if (videoPlayerControls) {
      videoPlayerControls.classList.remove("noCursor");
    }
    setControls(true);
    resetControlsTimer();
  }, [setControls, resetControlsTimer]);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCountdown && countdownTime > 0 && episodeList.length > 0) {
      timer = setInterval(() => {
        setCountdownTime(countdownTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showCountdown, countdownTime, episodeList.length, setCountdownTime]);

  const handleNextEpisodeManually = () => {
    const nextIndex = currentEpisodeIndex + 1;
    if (nextIndex < episodeList.length && videoRef && episodeList[nextIndex]) {
      setCurrentEpisodeIndex(nextIndex);
      setAutoPlayNext(true);
      videoRef.src = episodeList[nextIndex].url;
      videoRef
        .play()
        .catch((err: Error) => console.error("Manual play failed:", err));
      setShowCountdown(false);
      setCountdownTime(10);

      setControls(true);
      resetControlsTimer();
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
            icon={<ArrowRight className="h-5 w-5 text-gray-900" />}
            disabled={currentEpisodeIndex + 1 >= episodeList.length}
            position="right"
          />
        )}
    </div>
  );
};

export default Overlay;
