import React from "react";
import { SkipForward } from "lucide-react";
import { ControlsHeader, MiddleControls } from "./controls";
import { IPlayerConfig } from "../../types";

interface AdOverlayChromeProps {
  config?: IPlayerConfig;
  showControls: boolean;
  progressPercent: number;
  skipable?: boolean;
  canSkipAd?: boolean;
  skipCountdown?: number;
  onSkip?: () => void;
  sponsoredUrl?: string;
  fadeClassName?: string;
}

const AdOverlayChrome: React.FC<AdOverlayChromeProps> = ({
  config,
  showControls,
  progressPercent,
  skipable = false,
  canSkipAd = false,
  skipCountdown = 0,
  onSkip,
  sponsoredUrl,
  fadeClassName = "",
}) => {
  const headerConfig = {
    title: config?.config?.headerConfig?.config?.title || "Advertisement",
    isTrailer: config?.config?.headerConfig?.config?.isTrailer,
    onClose: config?.config?.headerConfig?.config?.onClose,
  };

  return (
    <div
      className={`absolute inset-0 transition-all duration-300 ${fadeClassName} ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90 flex flex-col justify-between">
        <div className="shrink-0 relative">
          <ControlsHeader config={headerConfig} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <MiddleControls />
        </div>

        <div className="shrink-0 relative">
          {skipable && (
            <div className="px-10 pb-3 flex justify-end">
              <button
                type="button"
                onClick={onSkip}
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
  );
};

export default AdOverlayChrome;
