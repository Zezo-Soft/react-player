import { useCallback } from "react";
import { useVideoStore } from "../../store/VideoState";
import { VideoError } from "../../store/types/StoreTypes";

const getErrorType = (
  code: number
): "network" | "decode" | "src" | "unknown" => {
  // MediaError codes: https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code
  switch (code) {
    case 1: // MEDIA_ERR_ABORTED
      return "unknown";
    case 2: // MEDIA_ERR_NETWORK
      return "network";
    case 3: // MEDIA_ERR_DECODE
      return "decode";
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return "src";
    default:
      return "unknown";
  }
};

const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return "Video playback was aborted.";
    case 2:
      return "A network error occurred while loading the video.";
    case 3:
      return "An error occurred while decoding the video.";
    case 4:
      return "The video format is not supported.";
    default:
      return "An unknown error occurred.";
  }
};

export const useVideoError = () => {
  const { setError, clearError, error } = useVideoStore();

  const handleVideoError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const video = e.currentTarget;
      const mediaError = video.error;

      if (mediaError) {
        const errorData: VideoError = {
          code: mediaError.code,
          message: mediaError.message || getErrorMessage(mediaError.code),
          type: getErrorType(mediaError.code),
        };
        setError(errorData);
      } else {
        setError({
          code: 0,
          message: "An unknown error occurred.",
          type: "unknown",
        });
      }
    },
    [setError]
  );

  const retry = useCallback(() => {
    clearError();
    const { videoRef } = useVideoStore.getState();
    if (videoRef) {
      videoRef.load();
      videoRef.play().catch(() => undefined);
    }
  }, [clearError]);

  return {
    error,
    handleVideoError,
    clearError,
    retry,
  };
};

