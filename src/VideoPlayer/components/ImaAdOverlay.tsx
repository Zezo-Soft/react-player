import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SkipForward } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../../store/VideoState";
import { AdBreak } from "../types/AdTypes";
import { ControlsHeader, MiddleControls } from "./controls";
import { IPlayerConfig } from "../../types";

interface ImaAdOverlayProps {
  adBreak: AdBreak;
  config?: IPlayerConfig;
}

const ImaAdOverlay: React.FC<ImaAdOverlayProps> = React.memo(
  ({ config }) => {
    const {
      adCurrentTime,
      canSkipAd,
      skipCountdown,
      imaPlayback,
      imaSkipEnabled,
    } = useVideoStore(
      useShallow((state) => ({
        adCurrentTime: state.adCurrentTime,
        canSkipAd: state.canSkipAd,
        skipCountdown: state.skipCountdown,
        imaPlayback: state.imaPlayback,
        imaSkipEnabled: state.imaSkipEnabled,
      }))
    );

    const [showControls, setShowControls] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
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

    const adDuration = imaPlayback?.getDuration() ?? 0;

    const progressPercent = useMemo(() => {
      if (adDuration <= 0) return 0;
      return Math.min(100, (adCurrentTime / adDuration) * 100);
    }, [adCurrentTime, adDuration]);

    const handleSkip = useCallback(() => {
      const playback = useVideoStore.getState().imaPlayback;
      if (playback?.isSkippable()) {
        playback.skip();
      }
    }, []);

    return (
      <div
        className="absolute inset-0 z-[1200] flex flex-col overflow-hidden pointer-events-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={() => {
          setIsHovered(true);
          setShowControls(true);
        }}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 pointer-events-auto ${
            showControls ? "opacity-100" : "opacity-0"
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
              {imaSkipEnabled && (
                <div className="px-10 pb-3 flex justify-end">
                  <button
                    type="button"
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
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ImaAdOverlay.displayName = "ImaAdOverlay";

export default ImaAdOverlay;
