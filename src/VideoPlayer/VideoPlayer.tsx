import React from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import SubtitleOverlay from "./_components/SubtitleOverlay";
import VideoActionButton from "../components/ui/VideoActionButton";
import { VideoPlayerProps } from "./types/VideoPlayerTypes";
import {
  useVideoSource,
  useSubtitles,
  useSubtitleStyling,
  useVideoTracking,
  useIntroSkip,
  useEpisodes,
  useVideoEvents,
} from "./hooks";
import "../index.css";
import "./styles/subtitles.css";

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  trackSrc,
  trackTitle,
  intro,
  onClose,
  onError,
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
  onEnded,
  nextEpisodeConfig,
  subtitleStyle,
  showControls = true,
  isMute = false,
}) => {
  const { setVideoRef, setVideoWrapperRef, videoRef } = useVideoStore();

  useVideoSource(trackSrc, type);
  useSubtitles(subtitles);
  useSubtitleStyling(subtitleStyle);
  useVideoTracking(tracking, episodeList, currentEpisodeIndex, onClose);
  const { showSkipIntro, handleSkipIntro } = useIntroSkip(intro);
  useEpisodes(episodeList, currentEpisodeIndex, nextEpisodeConfig);
  const {
    onSeeked,
    onTimeUpdate,
    onLoadedMetadata,
    onProgress,
    onPlay,
    onPause,
    onEnded: onEndedHook,
  } = useVideoEvents();

  return (
    <div
      ref={setVideoWrapperRef}
      className={`video-player ${height || "h-full"} ${
        width || "w-full"
      } mx-auto absolute`}
    >
      {trackPoster && (
        <div
          className="pip-poster absolute inset-0 bg-center bg-cover hidden"
          style={{ backgroundImage: `url(${trackPoster})` }}
        />
      )}

      <video
        autoPlay
        playsInline
        preload="metadata"
        ref={setVideoRef}
        onSeeked={onSeeked}
        poster={trackPoster}
        crossOrigin="anonymous"
        controls={false}
        disableRemotePlayback
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onProgress={onProgress}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={(e) => {
          onEndedHook(e);
          onEnded?.(e);
        }}
        onError={(e) => {
          onError?.(e);
        }}
        muted={isMute}
        className={`w-full h-full relative ${className}`}
      />
      {showControls && (
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
      )}
      <SubtitleOverlay styleConfig={subtitleStyle} />
      {showSkipIntro && (
        <VideoActionButton
          text="Skip Intro"
          onClick={handleSkipIntro}
          position="left"
        />
      )}
    </div>
  );
};

export default VideoPlayer;
