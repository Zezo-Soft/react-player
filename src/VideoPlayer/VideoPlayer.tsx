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
}) => {
  const {
    setVideoRef,
    setVideoWrapperRef,
    videoRef,
    isAdPlaying,
    currentAd,
    adType,
    setMuted,
  } = useVideoStore(
    useShallow((state) => ({
      setVideoRef: state.setVideoRef,
      setVideoWrapperRef: state.setVideoWrapperRef,
      videoRef: state.videoRef,
      isAdPlaying: state.isAdPlaying,
      currentAd: state.currentAd,
      adType: state.adType,
      setMuted: state.setMuted,
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
  const [initialAdStarted, setInitialAdStarted] = React.useState(
    () => !hasPreRoll
  );
  const [initialAdFinished, setInitialAdFinished] = React.useState(
    () => !hasPreRoll
  );

  React.useEffect(() => {
    if (hasPreRoll) {
      setInitialAdStarted(false);
      setInitialAdFinished(false);
    } else {
      setInitialAdStarted(true);
      setInitialAdFinished(true);
    }
  }, [trackSrc, hasPreRoll]);

  React.useEffect(() => {
    if (
      hasPreRoll &&
      !initialAdStarted &&
      isAdPlaying &&
      adType === "pre-roll"
    ) {
      setInitialAdStarted(true);
    }
  }, [hasPreRoll, initialAdStarted, isAdPlaying, adType]);

  const previousIsAdPlayingRef = React.useRef(isAdPlaying);
  React.useEffect(() => {
    const previouslyPlaying = previousIsAdPlayingRef.current;
    if (
      hasPreRoll &&
      initialAdStarted &&
      previouslyPlaying &&
      !isAdPlaying &&
      !initialAdFinished
    ) {
      setInitialAdFinished(true);
    }
    previousIsAdPlayingRef.current = isAdPlaying;
  }, [hasPreRoll, initialAdStarted, initialAdFinished, isAdPlaying]);

  React.useEffect(() => {
    if (hasPreRoll && !initialAdFinished && videoRef) {
      videoRef.pause();
    }
  }, [hasPreRoll, initialAdFinished, videoRef]);

  React.useEffect(() => {
    if (!videoRef) return;

    const syncMutedState = () => {
      setMuted(videoRef.muted);
    };

    // Ensure the global store mirrors the element's mute flag — this keeps UI controls and both media elements aligned.
    syncMutedState();
    videoRef.addEventListener("volumechange", syncMutedState);

    return () => {
      videoRef.removeEventListener("volumechange", syncMutedState);
    };
  }, [videoRef, setMuted]);

  const shouldCoverMainVideo = hasPreRoll && !initialAdFinished;
  const shouldShowPlaceholder = shouldCoverMainVideo && !isAdPlaying;

  React.useEffect(() => {
    const element = videoRef;
    return () => {
      if (!element) return;
      // Ensure the primary media element stops buffering/playing when the player unmounts
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [videoRef]);

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

  // Ad management
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
