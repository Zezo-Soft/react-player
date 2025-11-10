import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVideoStore } from "../../store/VideoState";
import { AdBreak } from "../types/AdTypes";
import { SkipForward } from "lucide-react";
import ControlsHeader from "../MediaControls/ControlsHeader";
import MiddleControls from "../MediaControls/MiddleControls";
import { IPlayerConfig } from "../../types";

interface AdOverlayProps {
  adBreak: AdBreak;
  onSkip?: () => void;
  config?: IPlayerConfig;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ adBreak, onSkip, config }) => {
  const {
    adVideoRef,
    setAdVideoRef,
    adCurrentTime,
    setAdCurrentTime,
    canSkipAd,
    setCanSkipAd,
    skipCountdown,
    setSkipCountdown,
    videoRef,
    muted,
    setIsPlaying,
  } = useVideoStore();

  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [adDuration, setAdDuration] = useState(0);
  const [requiresInteraction, setRequiresInteraction] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safelySetCanSkipAd = useCallback(
    (value: boolean) => {
      if (useVideoStore.getState().canSkipAd !== value) {
        setCanSkipAd(value);
      }
    },
    [setCanSkipAd]
  );

  const safelySetSkipCountdown = useCallback(
    (value: number) => {
      if (useVideoStore.getState().skipCountdown !== value) {
        setSkipCountdown(value);
      }
    },
    [setSkipCountdown]
  );

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isHovered) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      return;
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isHovered]);

  const skipAfter = useMemo(() => {
    const rawSkipAfter = Number.isFinite(adBreak.skipAfter)
      ? Math.max(0, Number(adBreak.skipAfter))
      : 0;

    if (adDuration > 0) {
      return Math.min(rawSkipAfter, adDuration);
    }

    return rawSkipAfter;
  }, [adBreak.skipAfter, adDuration]);

  const sponsoredUrl = adBreak.sponsoredUrl;

  useEffect(() => {
    setAdDuration(0);
    setRequiresInteraction(false);
  }, [adBreak.id]);

  // Initialize skip countdown based on ad playback time
  useEffect(() => {
    if (!adBreak.skipable) {
      safelySetCanSkipAd(false);
      safelySetSkipCountdown(0);
      return;
    }

    safelySetCanSkipAd(false);
    safelySetSkipCountdown(Math.max(Math.ceil(skipAfter), 0));

    if (skipAfter <= 0) {
      safelySetCanSkipAd(true);
      safelySetSkipCountdown(0);
    }
  }, [
    adBreak.id,
    adBreak.skipable,
    skipAfter,
    safelySetCanSkipAd,
    safelySetSkipCountdown,
  ]);

  const attemptAdPlayback = useCallback(() => {
    if (!adVideoRef) return;
    setRequiresInteraction(false);
    const playPromise = adVideoRef.play();
    if (playPromise && "catch" in playPromise) {
      playPromise.catch(() => {
        setRequiresInteraction(true);
        setIsPlaying(false);
      });
    }
  }, [adVideoRef, setIsPlaying]);

  // Handle ad video time updates and keep the ad-specific store state in sync without touching the main playback timeline.
  useEffect(() => {
    if (!adVideoRef) return;

    const handleTimeUpdate = () => {
      const currentTime = adVideoRef.currentTime;
      setAdCurrentTime(currentTime);

      if (adBreak.skipable) {
        const remaining = skipAfter - currentTime;
        if (remaining <= 0) {
          safelySetCanSkipAd(true);
          safelySetSkipCountdown(0);
        } else {
          const remainingForDisplay = Math.max(Math.ceil(remaining), 0);
          safelySetSkipCountdown(remainingForDisplay);
          if (canSkipAd) {
            safelySetCanSkipAd(false);
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(adVideoRef.duration)
        ? adVideoRef.duration
        : 0;
      setAdDuration(duration);
      setIsPlaying(!adVideoRef.paused);
      attemptAdPlayback();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setRequiresInteraction(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsPlaying(false);
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setRequiresInteraction(false);
    };

    const handleError = () => {
      setRequiresInteraction(true);
      setIsPlaying(false);
    };

    adVideoRef.addEventListener("timeupdate", handleTimeUpdate);
    adVideoRef.addEventListener("loadedmetadata", handleLoadedMetadata);
    adVideoRef.addEventListener("play", handlePlay);
    adVideoRef.addEventListener("pause", handlePause);
    adVideoRef.addEventListener("waiting", handleWaiting);
    adVideoRef.addEventListener("playing", handlePlaying);
    adVideoRef.addEventListener("error", handleError);

    return () => {
      adVideoRef.removeEventListener("timeupdate", handleTimeUpdate);
      adVideoRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
      adVideoRef.removeEventListener("play", handlePlay);
      adVideoRef.removeEventListener("pause", handlePause);
      adVideoRef.removeEventListener("waiting", handleWaiting);
      adVideoRef.removeEventListener("playing", handlePlaying);
      adVideoRef.removeEventListener("error", handleError);
    };
  }, [
    adVideoRef,
    adBreak.skipable,
    skipAfter,
    canSkipAd,
    setAdCurrentTime,
    setIsPlaying,
    safelySetSkipCountdown,
    safelySetCanSkipAd,
    attemptAdPlayback,
  ]);

  // Sync volume with main video and load ad
  useEffect(() => {
    if (!adVideoRef || !videoRef) return;

    if (adVideoRef.readyState === 0) {
      adVideoRef.volume = videoRef.volume;
      adVideoRef.muted = muted;
      adVideoRef.load();
    }

    const handleCanPlay = () => {
      if (adVideoRef && !adVideoRef.paused) return;
      attemptAdPlayback();
    };

    adVideoRef.addEventListener("canplay", handleCanPlay);

    if (adVideoRef.readyState >= 3) {
      attemptAdPlayback();
    }

    return () => {
      adVideoRef.removeEventListener("canplay", handleCanPlay);
    };
  }, [adVideoRef, videoRef, attemptAdPlayback]);

  // Keep the ad's mute flag aligned with the shared store so the header toggle behaves consistently.
  useEffect(() => {
    if (adVideoRef) {
      adVideoRef.muted = muted;
    }
  }, [adVideoRef, muted]);

  const handleSkip = () => {
    if (canSkipAd && onSkip) {
      onSkip();
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    adDuration > 0 ? (adCurrentTime / adDuration) * 100 : 0;

  return (
    <div
      className="absolute inset-0 bg-black z-50 flex flex-col overflow-hidden transition-opacity duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={() => {
        setIsHovered(true);
        setShowControls(true);
      }}
    >
      {/* Ad Video */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <video
          ref={(ref) => {
            if (ref && ref !== adVideoRef) {
              ref.muted = muted;
              setAdVideoRef(ref);
              if (ref.src !== adBreak.adUrl) {
                ref.src = adBreak.adUrl;
                ref.load();
              }
            }
          }}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          muted={muted}
          preload="auto"
          key={adBreak.id}
        />
        {requiresInteraction && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <button
              onClick={attemptAdPlayback}
              className="px-5 py-3 rounded bg-white/20 text-white font-semibold border border-white/40 hover:bg-white/30 transition"
            >
              Tap to Play Ad
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay - Using existing components */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 flex flex-col justify-between">
          {/* Header - Using ControlsHeader (ad badge is shown in ControlsHeader) */}
          <div className="flex-shrink-0 relative">
            <ControlsHeader
              config={{
                title:
                  adBreak.title ||
                  config?.config?.headerConfig?.config?.title ||
                  "Advertisement",
                isTrailer: config?.config?.headerConfig?.config?.isTrailer,
                onClose: config?.config?.headerConfig?.config?.onClose,
              }}
            />
          </div>

          {/* Middle - Using MiddleControls (only play/pause during ads) */}
          <div className="flex-1 flex items-center justify-center">
            <MiddleControls />
          </div>

          {/* Bottom - Sponsored label, seek slider and timers */}
          <div className="flex-shrink-0 relative">
            {/* Skip button above slider */}
            {adBreak.skipable && (
              <div className="px-10 pb-3 flex justify-end">
                <button
                  onClick={handleSkip}
                  disabled={!canSkipAd}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 ${
                    canSkipAd
                      ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-white/30 hover:border-white/50 backdrop-blur-md"
                      : "bg-black/60 text-gray-400 cursor-not-allowed border border-gray-700/60"
                  }`}
                  style={{ borderRadius: "4px" }}
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {canSkipAd
                      ? "Skip Ad"
                      : `Skip in ${Math.max(skipCountdown, 0)}s`}
                  </span>
                </button>
              </div>
            )}

            {/* Read-only seek slider */}
            <div className="px-10 pb-4">
              <div className="relative h-1 bg-white/20 rounded-full overflow-hidden pointer-events-none select-none">
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-300 ease-out pointer-events-none"
                  style={{ left: `calc(${progressPercent}% - 6px)` }}
                />
              </div>
            </div>

            {/* Bottom controls with skip button */}
            <div className="px-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4 text-white">
                <span className="text-lg lg:text-2xl font-semibold">
                  {formatTime(adCurrentTime)}
                </span>
                <span className="text-lg lg:text-3xl font-semibold text-gray-500">
                  /
                </span>
                <span className="text-lg lg:text-2xl font-semibold text-gray-400">
                  {formatTime(adDuration)}
                </span>
              </div>
              {sponsoredUrl && (
                <a
                  href={sponsoredUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-sky-300 hover:text-white transition-colors"
                >
                  Learn More
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdOverlay;
