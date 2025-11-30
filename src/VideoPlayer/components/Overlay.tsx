import React, { useCallback, useRef, useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";
import { useShallow } from "zustand/react/shallow";
import { VideoPlayerControls } from "./controls";
import { IPlayerConfig } from "../../types";
import VideoActionButton from "../../components/ui/VideoActionButton";
import { ArrowRight } from "lucide-react";
import {
  CONTROL_INTERACTION_EVENT,
  CONTROLS_HIDE_DELAY_MS,
} from "../constants";

const Overlay: React.FC<IPlayerConfig> = React.memo(({ config }) => {
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    isAdPlaying,
  } = useVideoStore(
    useShallow((state) => ({
      setControls: state.setControls,
      controls: state.controls,
      showCountdown: state.showCountdown,
      countdownTime: state.countdownTime,
      setShowCountdown: state.setShowCountdown,
      setAutoPlayNext: state.setAutoPlayNext,
      setCurrentEpisodeIndex: state.setCurrentEpisodeIndex,
      episodeList: state.episodeList,
      setCountdownTime: state.setCountdownTime,
      videoRef: state.videoRef,
      currentEpisodeIndex: state.currentEpisodeIndex,
      isAdPlaying: state.isAdPlaying,
    }))
  );

  const { onClose } = config?.headerConfig?.config || {};

  const hideControls = useCallback(() => {
    setControls(false);
    containerRef.current?.classList.add("noCursor");
  }, [setControls]);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(hideControls, CONTROLS_HIDE_DELAY_MS);
  }, [hideControls]);

  const handleControlsInteraction = useCallback(() => {
    containerRef.current?.classList.remove("noCursor");
    setControls(true);
    resetControlsTimer();
  }, [resetControlsTimer, setControls]);

  const handleMouseEnter = useCallback(() => {
    handleControlsInteraction();
  }, [handleControlsInteraction]);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleExternalInteraction = () => {
      handleControlsInteraction();
    };

    window.addEventListener(
      CONTROL_INTERACTION_EVENT,
      handleExternalInteraction as EventListener
    );

    return () => {
      window.removeEventListener(
        CONTROL_INTERACTION_EVENT,
        handleExternalInteraction as EventListener
      );
    };
  }, [handleControlsInteraction]);

  const handleNextEpisodeManually = useCallback(() => {
    const nextIndex = currentEpisodeIndex + 1;
    if (nextIndex < episodeList.length && videoRef && episodeList[nextIndex]) {
      setCurrentEpisodeIndex(nextIndex);
      setAutoPlayNext(true);
      videoRef.src = episodeList[nextIndex].url;
      videoRef.play().catch(() => undefined);
      setShowCountdown(false);
      setCountdownTime(10);

      handleControlsInteraction();
    } else if (onClose) {
      onClose();
    }
  }, [
    currentEpisodeIndex,
    episodeList,
    videoRef,
    setCurrentEpisodeIndex,
    setAutoPlayNext,
    setShowCountdown,
    setCountdownTime,
    handleControlsInteraction,
    onClose,
  ]);

  return (
    <div
      id="videoPlayerControls"
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={handleMouseEnter}
    >
      {controls && !isAdPlaying && <VideoPlayerControls config={config} />}

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
});

Overlay.displayName = "Overlay";

export default Overlay;
