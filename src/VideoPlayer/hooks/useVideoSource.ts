import { useEffect } from "react";
import Hls from "hls.js";
import { useVideoStore } from "../../store/VideoState";
import { getExtensionFromUrl } from "../utils";

export const useVideoSource = (
  trackSrc: string,
  type?: "hls" | "mp4" | "other" | "youtube" | undefined
) => {
  const { videoRef, setQualityLevels, setHlsInstance } = useVideoStore();

  useEffect(() => {
    if (!videoRef) return;

    const getVideoExtension = getExtensionFromUrl(trackSrc);
    const contentType = type || getVideoExtension;

    if (contentType === "mp4") {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    } else if (contentType === "hls") {
      if (videoRef?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.src = trackSrc;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(trackSrc);
        hls.attachMedia(videoRef as HTMLMediaElement);
        setHlsInstance(hls);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setQualityLevels(hls.levels);
        });

        return () => {
          hls.destroy();
        };
      }
    } else {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    }
  }, [trackSrc, videoRef, type, setQualityLevels, setHlsInstance]);
};
