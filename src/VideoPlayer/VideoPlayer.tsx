import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import Hls from "hls.js";

interface Props {
  trackSrc: string;
  trackTitle?: string;
  trackPoster?: string;
  isTrailer?: boolean;
  className?: string;
  type?: "hls" | "mp4" | "other";
  width?: string;
  height?: string;
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
}) => {
  const {
    setVideoRef,
    setCurrentTime,
    setVideoWrapperRef,
    videoRef,
    setQualityLevels,
    setHlsInstance,
  } = useVideoStore();
  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!videoRef) {
      return;
    }

    if (type === "mp4") {
      videoRef.src = trackSrc;
    } else if (type === "hls") {
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
        }}
      />
    </div>
  );
};

export default VideoPlayer;
