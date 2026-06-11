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
import { IPlayerConfig } from "../../types";
import { useOverlayAutoHide } from "../hooks/useOverlayAutoHide";
import AdOverlayChrome from "./AdOverlayChrome";

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

    const { showControls, onMouseEnter, onMouseLeave, onMouseMove } =
      useOverlayAutoHide();

    const [adDuration, setAdDuration] = useState(0);
    const [requiresInteraction, setRequiresInteraction] = useState(false);
    const [adLoadError, setAdLoadError] = useState(false);

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
        playPromise.catch(() => {
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

      const handleError = () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }

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
        } catch {
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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
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

        <AdOverlayChrome
          config={config}
          showControls={showControls}
          progressPercent={progressPercent}
          skipable={adBreak.skipable}
          canSkipAd={canSkipAd}
          skipCountdown={skipCountdown}
          onSkip={handleSkip}
          sponsoredUrl={sponsoredUrl}
        />
      </div>
    );
  }
);

AdOverlay.displayName = "AdOverlay";

export default AdOverlay;
