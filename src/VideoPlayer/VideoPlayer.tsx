import React, { useEffect, useRef, useState } from "react";
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
  episodeList?: { id: number; title: string; url: string }[];
  currentEpisodeIndex?: number;
  intro?: {
    start: number;
    end: number;
  };
  nextEpisodeConfig?: { showAtTime?: number; showAtEnd?: boolean };
}

const VideoPlayer: React.FC<Props> = ({
  trackSrc,
  trackTitle,
  intro,
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
  episodeList,
  currentEpisodeIndex = 0,
  nextEpisodeConfig,
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
    setEpisodeList,
    setCurrentEpisodeIndex,
    setShowCountdown,
  } = useVideoStore();

  const [showSkipIntro, setShowSkipIntro] = useState(false);

  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  // === VIDEO SOURCE INIT ===
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
  }, [trackSrc, videoRef]);

  // === SUBTITLES ===
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

  // === TRACKING (play/pause/watchtime) ===
  const startTime = useRef<number | null>(null);
  const isViewCounted = useRef(false);

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
  }, [videoRef, episodeList, currentEpisodeIndex, onClose]);

  // === BEFORE UNLOAD ===
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
    if (episodeList) {
      setEpisodeList(episodeList);
    }
    if (currentEpisodeIndex !== undefined) {
      setCurrentEpisodeIndex(currentEpisodeIndex);
    }
  }, [subtitles, episodeList, currentEpisodeIndex]);

  // === INTRO LOGIC ===
  useEffect(() => {
    if (!videoRef || !intro) return;

    const checkIntro = () => {
      if (
        videoRef.currentTime >= intro.start &&
        videoRef.currentTime < intro.end
      ) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }
    };

    videoRef.addEventListener("timeupdate", checkIntro);
    return () => {
      videoRef.removeEventListener("timeupdate", checkIntro);
    };
  }, [videoRef, intro]);

  const handleSkipIntro = () => {
    if (videoRef && intro) {
      videoRef.currentTime = intro.end;
      setShowSkipIntro(false);
    }
  };

  // === NEXT EPISODE LOGIC (Backend Dependent) ===
  useEffect(() => {
    if (!videoRef || !nextEpisodeConfig) return;

    const checkNextEpisode = () => {
      const currentTime = videoRef.currentTime || 0;

      // Show based on backend config
      if (nextEpisodeConfig.showAtEnd && videoRef.ended) {
        setShowCountdown(true);
      } else if (
        nextEpisodeConfig.showAtTime &&
        currentTime >= nextEpisodeConfig.showAtTime
      ) {
        setShowCountdown(true);
      }
    };

    videoRef.addEventListener("timeupdate", checkNextEpisode);
    videoRef.addEventListener("ended", checkNextEpisode);
    return () => {
      videoRef.removeEventListener("timeupdate", checkNextEpisode);
      videoRef.removeEventListener("ended", checkNextEpisode);
    };
  }, [videoRef, nextEpisodeConfig]);

  return (
    <div
      ref={setVideoWrapperRef}
      className={`${height || "h-full"} ${width || "w-full"} mx-auto absolute`}
    >
      <video
        ref={setVideoRef}
        className={`w-full h-full relative ${className} [&::cue]:absolute 
  [&::cue]:top-[6%] 
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

      {/* Overlay UI */}
      <Overlay
        config={{
          headerConfig: {
            config: {
              isTrailer: isTrailer,
              title: trackTitle,
              onClose: onClose,
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
      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-36 left-32
             bg-white/60 text-gray-900 px-6 py-2 
             rounded-[5px] text-sm font-medium
             backdrop-blur-sm
             hover:bg-white/80
             transition
             shadow-lg
             focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
