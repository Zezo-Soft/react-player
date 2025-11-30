import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./components/Overlay";
import SubtitleOverlay from "./components/SubtitleOverlay";
import VideoActionButton from "../components/ui/VideoActionButton";
import { VideoPlayerProps, WatchHistoryData } from "./types/VideoPlayerTypes";
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
  useVideoError,
} from "./hooks";
import AdOverlay from "./components/AdOverlay";
import ErrorOverlay from "./components/ErrorOverlay";
import "../index.css";
import "./styles/subtitles.css";
import "./styles/ads.css";

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ video, style, events, features }) => {
  const {
    src: trackSrc,
    title: trackTitle,
    poster: trackPoster,
    type,
    isTrailer,
    showControls = true,
    isMute = false,
    startFrom,
  } = video;

  const { className, width, height, subtitleStyle } = style || {};

  const { onEnded, onError, onClose, onWatchHistoryUpdate } = events || {};

  const {
    timeCodes,
    getPreviewScreenUrl,
    tracking,
    subtitles,
    episodeList,
    currentEpisodeIndex = 0,
    intro,
    nextEpisodeConfig,
    ads,
  } = features || {};

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
    initialAdFinished,
    shouldCoverMainVideo,
    shouldShowPlaceholder,
  } = usePrimaryVideoLifecycle({
    hasPreRoll,
    trackSrc,
  });

  const onWatchHistoryUpdateRef = React.useRef(onWatchHistoryUpdate);

  // Keep ref updated with latest callback
  React.useEffect(() => {
    onWatchHistoryUpdateRef.current = onWatchHistoryUpdate;
  }, [onWatchHistoryUpdate]);

  // Function to gather watch history data
  const getWatchHistoryData = React.useCallback((): WatchHistoryData | null => {
    const video = useVideoStore.getState().videoRef;
    if (!video || !video.duration || isNaN(video.duration)) return null;

    const currentTime = video.currentTime || 0;
    const duration = video.duration;
    const progress = Math.round((currentTime / duration) * 100);
    const isCompleted = progress >= 90; // 90% or more = completed

    return {
      currentTime,
      duration,
      progress,
      isCompleted,
      watchedAt: Date.now(),
    };
  }, []);

  // Enhanced onClose handler that also saves history
  const handleClose = React.useCallback(() => {
    const historyData = getWatchHistoryData();
    if (historyData && onWatchHistoryUpdate) {
      onWatchHistoryUpdate(historyData);
    }
    onClose?.();
  }, [getWatchHistoryData, onWatchHistoryUpdate, onClose]);

  // Memoize overlay config to prevent unnecessary re-renders
  const overlayConfig = React.useMemo(
    () => ({
      headerConfig: {
        config: {
          isTrailer: isTrailer,
          title: trackTitle,
          onClose: handleClose,
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
    }),
    [isTrailer, trackTitle, handleClose, videoRef, timeCodes, getPreviewScreenUrl]
  );

  // Memoize ad overlay config
  const adOverlayConfig = React.useMemo(
    () => ({
      config: {
        headerConfig: {
          config: {
            isTrailer: isTrailer,
            title: trackTitle,
            onClose: handleClose,
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
    }),
    [isTrailer, trackTitle, handleClose, timeCodes, getPreviewScreenUrl]
  );

  useVideoSource(trackSrc, type);
  useSubtitles(subtitles);
  useSubtitleStyling(subtitleStyle);
  useVideoTracking(tracking, episodeList, currentEpisodeIndex, handleClose);
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

  const { skipAd } = useAdManager(effectiveAds);
  const { error, handleVideoError, retry } = useVideoError();

  const hasResumedRef = React.useRef(false);

  // Call onWatchHistoryUpdate when component unmounts
  React.useEffect(() => {
    return () => {
      const historyData = getWatchHistoryData();
      if (historyData && onWatchHistoryUpdateRef.current) {
        onWatchHistoryUpdateRef.current(historyData);
      }
    };
  }, [getWatchHistoryData]);

  React.useEffect(() => {
    if (!videoRef || !startFrom || hasResumedRef.current) return;

    const handleCanPlay = () => {
      if (!hasResumedRef.current && startFrom > 0) {
        videoRef.currentTime = startFrom;
        hasResumedRef.current = true;
      }
    };

    videoRef.addEventListener("canplay", handleCanPlay);
    return () => videoRef.removeEventListener("canplay", handleCanPlay);
  }, [videoRef, startFrom]);

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
          handleVideoError(e);
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
        <Overlay config={overlayConfig} />
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
          config={adOverlayConfig}
        />
      )}
      {/* Error Overlay - only show when consumer has provided onError */}
      {error && onError && <ErrorOverlay error={error} onRetry={retry} />}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
