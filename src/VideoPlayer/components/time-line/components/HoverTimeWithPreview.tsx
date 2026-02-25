import React, { useRef } from "react";
import { getHoverTimePosition } from "../utils/getHoverTimePosition";
import { timeToTimeString } from "../utils/timeToTimeString";

interface HoverTimeWithPreviewProps {
  max: number;
  hoverTimeValue: number;
  trackWidth: number;
  seekHoverPosition: number;
  offset: number;
  isThumbActive: boolean;
  limitTimeTooltipBySides: boolean;
  label: string;
  secondsPrefix?: string;
  minutesPrefix?: string;
  getPreviewScreenUrl?: (hoverTimeValue: number) => string;
  isLive?: boolean;
}

export const HoverTimeWithPreview: React.FC<HoverTimeWithPreviewProps> = ({
  max,
  hoverTimeValue,
  offset,
  trackWidth,
  seekHoverPosition,
  isThumbActive,
  limitTimeTooltipBySides,
  label,
  minutesPrefix,
  secondsPrefix,
  getPreviewScreenUrl,
  isLive = false,
}) => {
  const hoverTimeElement = useRef<HTMLDivElement>(null);
  const hoverTimeClassName = isThumbActive ? "hover-time active" : "hover-time";

  const hoverTimePosition = getHoverTimePosition(
    seekHoverPosition,
    hoverTimeElement?.current,
    trackWidth,
    limitTimeTooltipBySides
  );

  const hoverTimeString = timeToTimeString(
    max,
    hoverTimeValue,
    offset,
    minutesPrefix,
    secondsPrefix
  );

  return (
    <div
      className={hoverTimeClassName}
      style={hoverTimePosition}
      ref={hoverTimeElement}
      data-testid="hover-time"
    >
      {isThumbActive && getPreviewScreenUrl && (
        <div
          className="preview-screen"
          style={{
            backgroundImage: `url(${getPreviewScreenUrl(hoverTimeValue)})`,
          }}
        />
      )}
      {label && !isLive && <div>{label}</div>}
      {isLive ? (
        <span className="inline-flex items-center gap-2 rounded-[5px] bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/25 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-live-blink" />
          </span>
          LIVE
        </span>
      ) : (
        hoverTimeString
      )}
    </div>
  );
};

