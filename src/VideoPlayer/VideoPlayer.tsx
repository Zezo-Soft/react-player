import React from "react";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";
import SubtitleOverlay from "./_components/SubtitleOverlay";
import TestSubtitleOverlay from "./_components/TestSubtitleOverlay";
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
import "../../src/index.css";
import "./styles/subtitles.css";

const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  subtitleStyle,
}) => {
  const { setVideoRef, setVideoWrapperRef, videoRef } = useVideoStore();

  // Initialize all video functionality through custom hooks
  useVideoSource(trackSrc, type);
  useSubtitles(subtitles);
  useSubtitleStyling(subtitleStyle); // Apply enhanced subtitle styling
  useVideoTracking(tracking, episodeList, currentEpisodeIndex, onClose);
  const { showSkipIntro, handleSkipIntro } = useIntroSkip(intro);
  useEpisodes(episodeList, currentEpisodeIndex, nextEpisodeConfig);
  const { onRightClick, onSeeked, onTimeUpdate, onLoadedMetadata } =
    useVideoEvents();

  return (
    <div
      ref={setVideoWrapperRef}
      className={`video-player ${height || "h-full"} ${
        width || "w-full"
      } mx-auto absolute`}
    >
      <video
        ref={setVideoRef}
        className={`w-full h-full relative ${className}`}
        poster={trackPoster}
        autoPlay
        crossOrigin="anonymous"
        onContextMenu={onRightClick}
        playsInline
        preload="auto"
        onSeeked={onSeeked}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
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
      {/* Custom Subtitle Overlay */}
      <SubtitleOverlay styleConfig={subtitleStyle} />

      {/* Skip Intro Button */}
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
