import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./components/Overlay";
import SubtitleOverlay from "./components/SubtitleOverlay";
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
  useAdManager,
  usePrimaryVideoLifecycle,
} from "./hooks";
import AdOverlay from "./components/AdOverlay";
import "../index.css";
import "./styles/subtitles.css";
import "./styles/ads.css";

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
  ads,
  resumeFrom,
}) => {
  const { setVideoWrapperRef } = useVideoStore(
    useShallow((state) => ({
      setVideoWrapperRef: state.setVideoWrapperRef,
    }))
  );

  const effectiveAds = React.useMemo(
    () => (isTrailer ? undefined : ads),
    [ads, isTrailer]
  );
  const hasPreRoll = React.useMemo(
    () => Boolean(effectiveAds?.preRoll),
    [effectiveAds?.preRoll]
  );
  const {
    registerVideoRef,
    videoRef,
    isAdPlaying,
    currentAd,
    adType,
    initialAdFinished,
    shouldCoverMainVideo,
    shouldShowPlaceholder,
  } = usePrimaryVideoLifecycle({
    hasPreRoll,
    trackSrc,
  });

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
  } = useVideoEvents(resumeFrom);

  const { skipAd } = useAdManager(effectiveAds);

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
        playsInline
        preload={hasPreRoll ? "metadata" : "auto"}
        ref={registerVideoRef}
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
        autoPlay={!hasPreRoll}
        muted={isMute}
        className={`w-full h-full relative ${className || ""} ${
          shouldCoverMainVideo ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200 ease-out`}
      />
      {shouldShowPlaceholder && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <span className="loader" />
        </div>
      )}
      {showControls && initialAdFinished && (
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
      {showSkipIntro && !isAdPlaying && initialAdFinished && (
        <VideoActionButton
          text="Skip Intro"
          onClick={handleSkipIntro}
          position="left"
        />
      )}
      {/* Ad Overlay */}
      {isAdPlaying && currentAd && (
        <AdOverlay
          adBreak={currentAd}
          onSkip={skipAd}
          config={{
            config: {
              headerConfig: {
                config: {
                  isTrailer: isTrailer,
                  title: trackTitle,
                  onClose: onClose,
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
            },
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
