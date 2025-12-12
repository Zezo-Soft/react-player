import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVideoStore } from "../../store/VideoState";
import { useShallow } from "zustand/react/shallow";
import { AdBreak } from "../types/AdTypes";
import { SkipForward } from "lucide-react";
import { ControlsHeader, MiddleControls } from "./controls";
import { IPlayerConfig } from "../../types";

interface AdOverlayProps {
  adBreak: AdBreak;
  onSkip?: () => void;
  config?: IPlayerConfig;
}

const AdOverlay: React.FC<AdOverlayProps> = React.memo(
  ({ adBreak, onSkip, config }) => {
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
    } = useVideoStore(
      useShallow((state) => ({
        adVideoRef: state.adVideoRef,
        setAdVideoRef: state.setAdVideoRef,
        adCurrentTime: state.adCurrentTime,
        setAdCurrentTime: state.setAdCurrentTime,
        canSkipAd: state.canSkipAd,
        setCanSkipAd: state.setCanSkipAd,
        skipCountdown: state.skipCountdown,
        setSkipCountdown: state.setSkipCountdown,
        videoRef: state.videoRef,
        muted: state.muted,
        setIsPlaying: state.setIsPlaying,
      }))
    );

    const [showControls, setShowControls] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const [adDuration, setAdDuration] = useState(0);
    const [requiresInteraction, setRequiresInteraction] = useState(false);
    const [adLoadError, setAdLoadError] = useState(false);

    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setAdLoadError(false);
      setAdCurrentTime(0);

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      if (adBreak.skipable !== undefined) {
        setCanSkipAd(false);
        setSkipCountdown(0);
      }
    }, [
      adBreak.id,
      adBreak.skipable,
      setAdCurrentTime,
      setCanSkipAd,
      setSkipCountdown,
    ]);

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
      setAdLoadError(false);

      if (!adVideoRef.src && adBreak.adUrl) {
        adVideoRef.src = adBreak.adUrl;
        adVideoRef.load();
        return;
      }

      const playPromise = adVideoRef.play();
      if (playPromise && "catch" in playPromise) {
        playPromise.catch((error) => {
          console.warn("Ad play failed:", error);
          setRequiresInteraction(true);
          setIsPlaying(false);
        });
      }
    }, [adVideoRef, adBreak.adUrl, setIsPlaying]);

    const timeUpdateRafRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef(0);

    useEffect(() => {
      if (!adVideoRef) return;

      const handleTimeUpdate = () => {
        if (timeUpdateRafRef.current !== null) return;

        timeUpdateRafRef.current = requestAnimationFrame(() => {
          timeUpdateRafRef.current = null;
          const currentTime = adVideoRef.currentTime;

          if (Math.abs(currentTime - lastUpdateTimeRef.current) < 0.1) {
            return;
          }

          lastUpdateTimeRef.current = currentTime;
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
        });
      };

      const handleLoadedMetadata = () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }

        const duration = Number.isFinite(adVideoRef.duration)
          ? adVideoRef.duration
          : 0;
        setAdDuration(duration);
        setAdLoadError(false);
        setIsPlaying(!adVideoRef.paused);
        attemptAdPlayback();
      };

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(() => {
        if (adVideoRef && adVideoRef.readyState < 2) {
          console.warn("Ad load timeout:", adBreak.id);
          setAdLoadError(true);
          setRequiresInteraction(true);
        }
      }, 30000);

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

      const handleError = (e: Event) => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }

        const error = e.target as HTMLVideoElement;
        const errorCode = error.error?.code;
        const errorMessage = error.error?.message || "Unknown ad error";

        console.error("Ad playback error:", {
          adId: adBreak.id,
          errorCode,
          errorMessage,
          src: adVideoRef.src,
        });

        setAdLoadError(true);
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

        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }

        if (timeUpdateRafRef.current !== null) {
          cancelAnimationFrame(timeUpdateRafRef.current);
          timeUpdateRafRef.current = null;
        }

        lastUpdateTimeRef.current = 0;
      };
    }, [
      adVideoRef,
      adBreak.skipable,
      adBreak.id,
      skipAfter,
      canSkipAd,
      setAdCurrentTime,
      setIsPlaying,
      safelySetSkipCountdown,
      safelySetCanSkipAd,
      attemptAdPlayback,
    ]);

    useEffect(() => {
      if (!adVideoRef || !videoRef) return;

      // Sync volume and muted state
      adVideoRef.volume = videoRef.volume;
      adVideoRef.muted = muted;

      // Check if src needs to be updated
      const currentSrc = adVideoRef.src || adVideoRef.currentSrc || "";
      const needsReload = !currentSrc || currentSrc !== adBreak.adUrl;

      // Load ad if needed
      if (needsReload && adBreak.adUrl) {
        // Clear previous src
        try {
          adVideoRef.pause();
          adVideoRef.removeAttribute("src");
          adVideoRef.src = "";

          // Set new src
          adVideoRef.src = adBreak.adUrl;
          adVideoRef.load();
        } catch (error) {
          console.warn("Error loading ad:", error);
          setAdLoadError(true);
        }
      }

      const handleCanPlay = () => {
        if (!adVideoRef || adVideoRef.paused === false) return;
        attemptAdPlayback();
      };

      const handleLoadedData = () => {
        // Ensure volume is synced after load
        if (videoRef && adVideoRef) {
          try {
            adVideoRef.volume = videoRef.volume;
            adVideoRef.muted = muted;
          } catch (error) {
            // Ignore errors during cleanup
          }
        }
      };

      adVideoRef.addEventListener("canplay", handleCanPlay);
      adVideoRef.addEventListener("loadeddata", handleLoadedData);

      // Try to play if already ready and src matches
      if (adVideoRef.readyState >= 3 && !needsReload) {
        attemptAdPlayback();
      }

      return () => {
        if (adVideoRef) {
          adVideoRef.removeEventListener("canplay", handleCanPlay);
          adVideoRef.removeEventListener("loadeddata", handleLoadedData);
        }
      };
    }, [adVideoRef, videoRef, muted, adBreak.adUrl, attemptAdPlayback]);

    useEffect(() => {
      if (!adVideoRef) return;

      try {
        // Sync muted state
        adVideoRef.muted = muted;

        // Sync volume with main video
        if (videoRef) {
          adVideoRef.volume = videoRef.volume;
        }
      } catch (error) {
        // Ignore errors during state sync
      }
    }, [adVideoRef, muted, videoRef]);

    const handleSkip = () => {
      if (canSkipAd && onSkip) {
        onSkip();
      }
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
        <div className="relative flex-1 w-full flex items-center justify-center">
          <video
            ref={(ref) => {
              if (!ref) return;

              if (ref !== adVideoRef) {
                setAdVideoRef(ref);
              }

              ref.muted = muted;

              if (videoRef) {
                ref.volume = videoRef.volume;
              }

              if (adBreak.adUrl) {
                const currentSrc = ref.src || ref.currentSrc || "";
                if (currentSrc !== adBreak.adUrl) {
                  ref.src = adBreak.adUrl;
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
          {(requiresInteraction || adLoadError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                {adLoadError && (
                  <p className="text-red-400 text-sm">Ad failed to load</p>
                )}
                <button
                  onClick={attemptAdPlayback}
                  className="px-5 py-3 rounded bg-white/20 text-white font-semibold border border-white/40 hover:bg-white/30 transition"
                >
                  {adLoadError ? "Retry Ad" : "Tap to Play Ad"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90 flex flex-col justify-between">
            <div className="shrink-0 relative">
              <ControlsHeader
                config={{
                  title:
                    config?.config?.headerConfig?.config?.title ||
                    "Advertisement",
                  isTrailer: config?.config?.headerConfig?.config?.isTrailer,
                  onClose: config?.config?.headerConfig?.config?.onClose,
                }}
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <MiddleControls />
            </div>

            <div className="shrink-0 relative">
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

              {sponsoredUrl && (
                <div className="px-10 pb-6 flex items-center justify-end">
                  <a
                    href={sponsoredUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-sky-300 hover:text-white transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AdOverlay.displayName = "AdOverlay";

export default AdOverlay;
