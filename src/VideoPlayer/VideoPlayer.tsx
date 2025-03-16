import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import Hls from "hls.js";
import { getExtensionFromUrl } from "./utils";
import { TimeCode } from "./_components/TimeLine/TimeLine";
import { IOnWatchTimeUpdated } from "../types";

interface Props {
  trackSrc: string;
  trackTitle?: string;
  trackPoster?: string;
  isTrailer?: boolean;
  className?: string;
  type?: "hls" | "mp4" | "other";
  width?: string;
  height?: string;
  timeCodes?: TimeCode[];
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
  tracking?: {
    onViewed?: () => void;
    onWatchTimeUpdated?: (e: IOnWatchTimeUpdated) => void;
  };
}

const VideoPlayer: React.FC<Props> = ({
  trackSrc,
  trackTitle,
  trackPoster,
  isTrailer,
  className,
  type,
  height,
  width,
  timeCodes,
  getPreviewScreenUrl,
  tracking,
}) => {
  const {
    setVideoRef,
    setCurrentTime,
    setVideoWrapperRef,
    videoRef,
    setQualityLevels,
    setHlsInstance,
    setDuration,
    setIsPlaying,
  } = useVideoStore();
  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!videoRef) {
      return;
    }

    const getVideoExtension = getExtensionFromUrl(trackSrc);
    const contentType = type || getVideoExtension;
    if (contentType === "mp4") {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    } else if (contentType === "hls") {
      if (videoRef?.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        videoRef.src = trackSrc;
      } else if (Hls.isSupported()) {
        // Use hls.js for other browsers
        const hls = new Hls();
        hls.loadSource(trackSrc);
        hls.attachMedia(videoRef as HTMLMediaElement);
        setHlsInstance(hls);
        // Get quality levels when HLS loads
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setQualityLevels(hls.levels);
        });

        return () => {
          hls.destroy(); // Cleanup on unmount
        };
      }
    } else {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    }
  }, [trackSrc, videoRef]);

  // Analytics Start
  const startTime = useRef<number | null>(null);
  const isViewCounted = useRef(false);

  useEffect(() => {
    if (videoRef) {
      videoRef.addEventListener("play", () => {
        if (!isViewCounted.current) {
          isViewCounted.current = true;
          if (tracking?.onViewed) {
            tracking.onViewed();
          }
        }
        startTime.current = Date.now();
        setIsPlaying(true);
      });
      videoRef.addEventListener("pause", () => {
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
      });

      return () => {
        videoRef.removeEventListener("play", () => {});
        videoRef.removeEventListener("pause", () => {});
      };
    }
  }, [videoRef]);

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
      if (tracking?.onWatchTimeUpdated) {
        tracking.onWatchTimeUpdated({
          watchTime: totalTimeWatched,
        });
      }
    }
    localStorage.setItem("current_time", "0");
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [startTime]);

  return (
    <div
      ref={setVideoWrapperRef}
      className={`${height || "h-full"} ${width || "w-full"} mx-auto relative`}
    >
      <video
        ref={setVideoRef}
        className={`w-full h-full ${className}`}
        poster={trackPoster}
        onContextMenu={onRightClick}
        onTimeUpdate={(e) => {
          if (e?.currentTarget?.currentTime) {
            setCurrentTime(e?.currentTarget?.currentTime);
          }
        }}
        onLoad={(e) => {
          if (e?.currentTarget?.duration) {
            localStorage.setItem("current_time", "0");
            setDuration(e?.currentTarget?.duration);
          }
        }}
      >
        <track
          kind="captions"
          srcLang="en"
          label="English"
          default
          src="https://res.cloudinary.com/dm4uaqlio/raw/upload/v1742096015/sintel-captions-en_ehel5s.vtt"
        />
      </video>
      <Overlay
        height={height}
        width={width}
        config={{
          headerConfig: {
            config: {
              isTrailer: isTrailer,
              title: trackTitle,
            },
          },
          bottomConfig: {
            config: {
              seekBarConfig: {
                timeCodes: timeCodes,
                trackColor: "white",
                getPreviewScreenUrl,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
