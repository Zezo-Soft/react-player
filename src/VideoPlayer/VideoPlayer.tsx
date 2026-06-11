import React from "react";
import { useShallow } from "zustand/react/shallow";
import { Loader } from "lucide-react";
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
  useImaAds,
  usePrimaryVideoLifecycle,
  useVideoError,
} from "./hooks";
import AdOverlay from "./components/AdOverlay";
import ImaAdOverlay from "./components/ImaAdOverlay";
import ErrorOverlay from "./components/ErrorOverlay";
import "../index.css";
import "./styles/subtitles.css";
import "./styles/ads.css";

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(
  ({ video, style, events, features }) => {
    const {
      src: trackSrc,
      title: trackTitle,
      poster: trackPoster,
      type,
      isTrailer,
      showControls = true,
      isMute = false,
      startFrom,
      isLive: isLiveProp = false,
    } = video;

    const {
      className,
      width,
      height,
      subtitleStyle,
      qualityConfig,
      seekBarConfig: styleSeekBarConfig,
      playPauseButtonConfig,
    } = style || {};

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

    const {
      setVideoWrapperRef,
      setActiveQuality,
      setIsLive,
      setImaAdContainerRef,
      adProvider,
    } = useVideoStore(
      useShallow((state) => ({
        setVideoWrapperRef: state.setVideoWrapperRef,
        setActiveQuality: state.setActiveQuality,
        setIsLive: state.setIsLive,
        setImaAdContainerRef: state.setImaAdContainerRef,
        adProvider: state.adProvider,
      }))
    );

    React.useEffect(() => {
      setIsLive(isLiveProp);
    }, [isLiveProp, setIsLive]);

    React.useEffect(() => {
      if (qualityConfig?.defaultQuality) {
        setActiveQuality(qualityConfig.defaultQuality);
      }
    }, [qualityConfig?.defaultQuality, setActiveQuality]);

    const effectiveAds = React.useMemo(
      () => (isTrailer ? undefined : ads),
      [ads, isTrailer]
    );
    const hasImaPreRoll = React.useMemo(
      () =>
        Boolean(effectiveAds?.ima?.adTagUrl) &&
        effectiveAds?.ima?.preRoll !== false,
      [effectiveAds?.ima]
    );
    const hasPreRoll = React.useMemo(() => {
      const hasCustomPreRoll = Boolean(effectiveAds?.preRoll?.adUrl);
      return hasCustomPreRoll || hasImaPreRoll;
    }, [effectiveAds?.preRoll, hasImaPreRoll]);
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
      hasImaPreRoll,
      trackSrc,
    });

    const onWatchHistoryUpdateRef = React.useRef(onWatchHistoryUpdate);

    React.useEffect(() => {
      onWatchHistoryUpdateRef.current = onWatchHistoryUpdate;
    }, [onWatchHistoryUpdate]);

    const getWatchHistoryData =
      React.useCallback((): WatchHistoryData | null => {
        const video = useVideoStore.getState().videoRef;
        if (!video || !video.duration || isNaN(video.duration)) return null;

        const currentTime = video.currentTime || 0;
        const duration = video.duration;
        const progress = Math.round((currentTime / duration) * 100);
        const isCompleted = progress >= 90;

        return {
          currentTime,
          duration,
          progress,
          isCompleted,
          watchedAt: Date.now(),
        };
      }, []);

    const handleClose = React.useCallback(() => {
      const historyData = getWatchHistoryData();
      if (historyData && onWatchHistoryUpdate) {
        onWatchHistoryUpdate(historyData);
      }
      onClose?.();
    }, [getWatchHistoryData, onWatchHistoryUpdate, onClose]);

    const overlayConfig = React.useMemo(
      () => ({
        isLive: isLiveProp,
        headerConfig: {
          config: {
            isTrailer: isTrailer,
            title: trackTitle,
            onClose: handleClose,
            videoRef: videoRef ?? undefined,
            qualityConfig,
          },
        },
        bottomConfig: {
          config: {
            seekBarConfig: {
              timeCodes: timeCodes,
              trackColor: styleSeekBarConfig?.trackColor ?? "#ff0000",
              bufferColor: styleSeekBarConfig?.bufferColor,
              hoverColor: styleSeekBarConfig?.hoverColor,
              thumbColor: styleSeekBarConfig?.thumbColor,
              trackBackgroundColor: styleSeekBarConfig?.trackBackgroundColor,
              getPreviewScreenUrl,
            },
          },
        },
        middleConfig: {
          config: { playPauseButtonConfig },
        },
      }),
      [
        isTrailer,
        trackTitle,
        handleClose,
        videoRef,
        timeCodes,
        getPreviewScreenUrl,
        qualityConfig,
        styleSeekBarConfig,
        playPauseButtonConfig,
      ]
    );

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

    useVideoSource(trackSrc, type, isLiveProp);
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
    const { startImaPreRoll, hasImaPreRoll: imaPreRollActive } =
      useImaAds(effectiveAds);
    const { error, handleVideoError, retry } = useVideoError();

    const hasResumedRef = React.useRef(false);

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
            className="poster-bg absolute inset-0 bg-center bg-cover hidden"
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
        {effectiveAds?.ima?.adTagUrl && (
          <div
            ref={setImaAdContainerRef}
            className={`ima-ad-slot absolute inset-0 ${
              isAdPlaying && adProvider === "ima"
                ? "z-[46]"
                : "z-0 pointer-events-none"
            }`}
            aria-hidden={!(isAdPlaying && adProvider === "ima")}
          />
        )}
        {shouldShowPlaceholder && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={
              imaPreRollActive
                ? "Start advertisement playback"
                : "Loading video"
            }
            onClick={imaPreRollActive ? startImaPreRoll : undefined}
            onKeyDown={(e) => {
              if (
                imaPreRollActive &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault();
                startImaPreRoll();
              }
            }}
          >
            <Loader className="w-14 h-14 lg:w-18 lg:h-18 animate-spin text-white pointer-events-none" />
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
        {isAdPlaying && currentAd && adProvider === "ima" && (
          <ImaAdOverlay adBreak={currentAd} config={adOverlayConfig} />
        )}
        {isAdPlaying && currentAd && adProvider !== "ima" && (
          <AdOverlay
            adBreak={currentAd}
            onSkip={skipAd}
            config={adOverlayConfig}
          />
        )}
        {error && onError && <ErrorOverlay error={error} onRetry={retry} />}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
