import React, { useCallback, useMemo, memo } from "react";
import { secondsToMilliseconds, timeFormat } from "../../utils";
import { useVideoStore } from "../../../store/VideoState";
import { VideoSeekSlider } from "../time-line/TimeLine";
import "../time-line/time-line.css";
import { IControlsBottomProps } from "../../../types";
import { useShallow } from "zustand/react/shallow";

const formatTimeMemo = (() => {
  const cache = new Map<number, string>();
  return (seconds: number): string => {
    if (cache.has(seconds)) return cache.get(seconds)!;
    const formatted = timeFormat(seconds);
    cache.set(seconds, formatted);
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
    return formatted;
  };
})();

const BottomControls: React.FC<IControlsBottomProps> = memo(({ config }) => {
  const { videoRef, currentTime, isFullscreen, bufferedProgress, isAdPlaying } =
    useVideoStore(
      useShallow((state) => ({
        videoRef: state.videoRef,
        currentTime: state.currentTime,
        isFullscreen: state.isFullscreen,
        bufferedProgress: state.bufferedProgress,
        isAdPlaying: state.isAdPlaying,
      }))
    );

  const duration = videoRef?.duration ?? 0;
  const currentTimeValue = currentTime || 0;
  const bufferedValue = bufferedProgress || 0;

  const handleSeek = useCallback(
    (currentTimeInMs: number) => {
      if (!videoRef) return;
      videoRef.currentTime = currentTimeInMs / 1000;
    },
    [videoRef]
  );

  const bufferTime = useMemo(() => {
    if (!duration) return 0;
    return secondsToMilliseconds(duration * (bufferedValue / 100));
  }, [bufferedValue, duration]);

  const roundedCurrentTime = useMemo(
    () => Math.floor(currentTimeValue),
    [currentTimeValue]
  );
  const roundedDuration = useMemo(() => Math.floor(duration), [duration]);

  const durationFormatted = useMemo(
    () => formatTimeMemo(roundedDuration),
    [roundedDuration]
  );
  const currentTimeFormatted = useMemo(
    () => formatTimeMemo(roundedCurrentTime),
    [roundedCurrentTime]
  );

  const seekSliderMax = useMemo(
    () => secondsToMilliseconds(duration),
    [duration]
  );
  const seekSliderCurrentTime = useMemo(
    () => secondsToMilliseconds(currentTimeValue),
    [currentTimeValue]
  );

  if (isAdPlaying) return null;

  return (
    <div className="px-10">
      <VideoSeekSlider
        max={seekSliderMax}
        currentTime={seekSliderCurrentTime}
        bufferTime={bufferTime}
        onChange={handleSeek}
        secondsPrefix="00:00:"
        minutesPrefix="00:"
        getPreviewScreenUrl={config?.seekBarConfig?.getPreviewScreenUrl}
        timeCodes={config?.seekBarConfig?.timeCodes}
        trackColor={config?.seekBarConfig?.trackColor}
      />

      <div
        className={`pt-6 ${
          isFullscreen ? "pb-10" : "pb-16"
        } lg:pb-12 flex items-center gap-4 text-white`}
      >
        <span className="text-lg lg:text-2xl font-semibold text-white cursor-pointer hover:text-gray-200 transition-colors duration-200">
          {currentTimeFormatted}
        </span>
        <span className="text-lg lg:text-3xl font-semibold text-gray-500 cursor-pointer hover:text-gray-200 transition-colors duration-200">
          /
        </span>
        <span className="text-lg lg:text-2xl font-semibold text-gray-400 cursor-pointer hover:text-gray-200 transition-colors duration-200">
          {durationFormatted}
        </span>
      </div>
    </div>
  );
});

BottomControls.displayName = "BottomControls";

export default BottomControls;
