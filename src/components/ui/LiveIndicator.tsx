import React from "react";

interface LiveIndicatorProps {
  className?: string;
}

/**
 * Clean LIVE indicator with blinking dot animation for live streams.
 */
const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      data-testid="live-indicator"
    >
      <span
        className="inline-flex items-center gap-2 rounded-[5px] bg-red-500/15 px-3 py-1.5 text-sm font-semibold text-red-400 ring-1 ring-red-500/25 backdrop-blur-sm"
        aria-label="Live stream"
      >
        <span
          className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center"
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-live-blink" />
        </span>
        LIVE
      </span>
    </div>
  );
};

export default LiveIndicator;
