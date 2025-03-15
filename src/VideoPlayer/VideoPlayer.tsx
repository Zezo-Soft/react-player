import React, { useEffect } from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import Hls from "hls.js";
import { getExtensionFromUrl } from "./utils";
import { TimeCode } from "./_components/TimeLine/TimeLine";

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
}) => {
  const {
    setVideoRef,
    setCurrentTime,
    setVideoWrapperRef,
    videoRef,
    setQualityLevels,
    setHlsInstance,
    setDuration,
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
            setDuration(e?.currentTarget?.duration);
          }
        }}
      />
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
