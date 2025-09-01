import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import Hls from "hls.js";
import { getExtensionFromUrl } from "./utils";
import { TimeCode } from "./_components/TimeLine/TimeLine";
import { IOnWatchTimeUpdated } from "../types";

export interface Props {
  trackSrc: string;
  trackTitle?: string;
  trackPoster?: string;
  isTrailer?: boolean;
  className?: string;
  type?: "hls" | "mp4" | "other" | "youtube" | undefined;
  width?: string;
  height?: string;
  onClose?: () => void;
  timeCodes?: TimeCode[];
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
  tracking?: {
    onViewed?: () => void;
    onWatchTimeUpdated?: (e: IOnWatchTimeUpdated) => void;
  };
  subtitles?: {
    lang: string;
    label: string;
    url: string;
  }[];
}

const VideoPlayer: React.FC<Props> = ({
  trackSrc,
  trackTitle,
  onClose,
  trackPoster,
  isTrailer,
  className,
  type,
  height,
  width,
  timeCodes,
  getPreviewScreenUrl,
  tracking,
  subtitles,
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
    activeSubtitle,
    setSubtitles,
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
  }, [trackSrc, videoRef]);

  useEffect(() => {
    if (videoRef) {
      const tracks = videoRef.getElementsByTagName("track");
      while (tracks.length > 0) {
        videoRef.removeChild(tracks[0]);
      }

      Array.from(videoRef.textTracks).forEach((track) => {
        track.mode = "disabled";
      });

      if (activeSubtitle && subtitles) {
        const index = subtitles.findIndex(
          (s) => s.label === activeSubtitle.label
        );
        if (index !== -1) {
          const trackElement = document.createElement("track");
          trackElement.kind = "subtitles";
          trackElement.label = activeSubtitle.label;
          trackElement.srclang = activeSubtitle.lang;
          trackElement.src = activeSubtitle.url;
          trackElement.default = false;
          videoRef.appendChild(trackElement);

          const textTrack = Array.from(videoRef.textTracks).find(
            (track) => track.label === activeSubtitle.label
          );
          if (textTrack) {
            textTrack.mode = "showing";
            console.log("Subtitle track activated:", activeSubtitle.label);
          }
        }
      } else {
        Array.from(videoRef.textTracks).forEach((track) => {
          track.mode = "disabled";
        });
      }
    }
  }, [activeSubtitle, videoRef, subtitles]);

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

  useEffect(() => {
    if (subtitles) {
      setSubtitles(subtitles);
    }
  }, [subtitles]);

  return (
    <div
      ref={setVideoWrapperRef}
      className={`${height || "h-full"} ${width || "w-full"} mx-auto absolute`}
    >
      <video
        ref={setVideoRef}
        className={`w-full h-full relative ${className} [&::cue]:absolute 
  [&::cue]:top-[10%] 
  [&::cue]:text-xl 
  [&::cue]:bg-gray-50 
  [&::cue]:text-[#1E1E1E] 
  [&::cue]:px-2 
  [&::cue]:py-1 
  [&::cue]:rounded-md`}
        poster={trackPoster}
        autoPlay
        crossOrigin="anonymous"
        onContextMenu={onRightClick}
        onTimeUpdate={(e) => {
          if (e?.currentTarget?.currentTime) {
            setCurrentTime(e?.currentTarget?.currentTime);
          }
        }}
        onLoadedMetadata={(e) => {
          if (e?.currentTarget?.duration) {
            localStorage.setItem("current_time", "0");
            setDuration(e?.currentTarget?.duration);
          }
        }}
      ></video>
      <Overlay
        height={height}
        width={width}
        config={{
          headerConfig: {
            config: {
              isTrailer: isTrailer,
              title: trackTitle,
              onClose: onClose,
              // videoRef: videoRef,
              videoRef: videoRef as any,
            },
          },
          bottomConfig: {
            config: {
              seekBarConfig: {
                timeCodes: timeCodes,
                trackColor: "red",
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
