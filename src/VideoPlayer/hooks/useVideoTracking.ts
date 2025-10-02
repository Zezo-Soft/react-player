import { useEffect, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import { VideoPlayerProps } from "../types/VideoPlayerTypes";

export const useVideoTracking = (
  tracking?: VideoPlayerProps["tracking"],
  episodeList?: VideoPlayerProps["episodeList"],
  currentEpisodeIndex?: number,
  onClose?: () => void
) => {
  const { videoRef, setIsPlaying, setShowCountdown } = useVideoStore();
  const startTime = useRef<number | null>(null);
  const isViewCounted = useRef(false);

  // Handle video events (play, pause, ended)
  useEffect(() => {
    if (!videoRef) return;

    const onPlay = () => {
      if (!isViewCounted.current) {
        isViewCounted.current = true;
        tracking?.onViewed?.();
      }
      startTime.current = Date.now();
      setIsPlaying(true);
    };

    const onPause = () => {
      if (startTime.current) {
        const elapsedTime = (Date.now() - startTime.current) / 1000;
        const getCurrentTime = localStorage.getItem("current_time");
        localStorage.setItem(
          "current_time",
          (Number(getCurrentTime || 0) + elapsedTime).toString()
        );
        startTime.current = null;
      }
      setIsPlaying(false);
    };

    const onEnded = () => {
      if (
        episodeList &&
        episodeList.length > 0 &&
        currentEpisodeIndex !== undefined
      ) {
        const nextIndex = currentEpisodeIndex + 1;
        if (nextIndex < episodeList.length) {
          setShowCountdown(true);
        } else if (onClose) {
          onClose();
        }
      } else if (onClose) {
        onClose();
      }
    };

    videoRef.addEventListener("play", onPlay);
    videoRef.addEventListener("pause", onPause);
    videoRef.addEventListener("ended", onEnded);

    return () => {
      videoRef.removeEventListener("play", onPlay);
      videoRef.removeEventListener("pause", onPause);
      videoRef.removeEventListener("ended", onEnded);
    };
  }, [videoRef, episodeList, currentEpisodeIndex, onClose, tracking, setIsPlaying, setShowCountdown]);

  // Handle page unload tracking
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      if (startTime.current) {
        const elapsedTime = (Date.now() - startTime.current) / 1000;
        const getCurrentTime = localStorage.getItem("current_time");
        localStorage.setItem(
          "current_time",
          (Number(getCurrentTime || 0) + elapsedTime).toString()
        );
      }

      const totalTimeWatched = Number(localStorage.getItem("current_time") || 0);
      if (totalTimeWatched >= 30) {
        tracking?.onWatchTimeUpdated?.({
          watchTime: totalTimeWatched,
        });
      }
      localStorage.setItem("current_time", "0");
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [tracking]);
};
