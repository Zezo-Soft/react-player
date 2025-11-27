import { useEffect, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import { FeatureProps } from "../types/VideoPlayerTypes";

export const useVideoTracking = (
  tracking?: FeatureProps["tracking"],
  episodeList?: FeatureProps["episodeList"],
  currentEpisodeIndex?: number,
  onClose?: () => void
) => {
  const { videoRef, setShowCountdown } = useVideoStore();
  const isViewCounted = useRef(false);
  const lastVideoSrcRef = useRef<string | null>(null);

  // Reset view count when video source changes
  useEffect(() => {
    if (!videoRef) return;

    const currentSrc = videoRef.src || videoRef.currentSrc;

    // If video source changed, reset the view count
    if (lastVideoSrcRef.current !== currentSrc) {
      isViewCounted.current = false;
      lastVideoSrcRef.current = currentSrc;
    }
  }, [videoRef?.src, videoRef?.currentSrc, videoRef]);

  useEffect(() => {
    if (!videoRef) return;

    // Only handle view tracking on play - setIsPlaying is handled by useVideoEvents
    const onPlay = () => {
      if (!isViewCounted.current) {
        isViewCounted.current = true;
        tracking?.onViewed?.();
      }
    };

    // Handle episode end logic - playback state is handled by useVideoEvents
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
    videoRef.addEventListener("ended", onEnded);

    return () => {
      videoRef.removeEventListener("play", onPlay);
      videoRef.removeEventListener("ended", onEnded);
    };
  }, [
    videoRef,
    episodeList,
    currentEpisodeIndex,
    onClose,
    tracking,
    setShowCountdown,
  ]);
};
