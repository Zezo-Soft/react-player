import React, { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../../store/VideoState";
import { AdBreak } from "../types/AdTypes";
import { IPlayerConfig } from "../../types";
import { useOverlayAutoHide } from "../hooks/useOverlayAutoHide";
import AdOverlayChrome from "./AdOverlayChrome";

interface ImaAdOverlayProps {
  adBreak: AdBreak;
  config?: IPlayerConfig;
}

const ImaAdOverlay: React.FC<ImaAdOverlayProps> = React.memo(({ config }) => {
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

  const { showControls, onMouseEnter, onMouseLeave, onMouseMove } =
    useOverlayAutoHide();

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <AdOverlayChrome
        config={config}
        showControls={showControls}
        progressPercent={progressPercent}
        skipable={imaSkipEnabled}
        canSkipAd={canSkipAd}
        skipCountdown={skipCountdown}
        onSkip={handleSkip}
        fadeClassName="pointer-events-auto"
      />
    </div>
  );
});

ImaAdOverlay.displayName = "ImaAdOverlay";

export default ImaAdOverlay;
