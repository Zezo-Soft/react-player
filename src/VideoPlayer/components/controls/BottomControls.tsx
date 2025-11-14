import React, { useCallback, useMemo } from "react";
import { secondsToMilliseconds, timeFormat } from "../../utils";
import { useVideoStore } from "../../../store/VideoState";
import { VideoSeekSlider } from "../time-line/TimeLine";
import "../time-line/time-line.css";
import { IControlsBottomProps } from "../../../types";
import { useShallow } from "zustand/react/shallow";

const BottomControls: React.FC<IControlsBottomProps> = ({ config }) => {
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
      if (!videoRef) {
        return;
      }
      videoRef.currentTime = currentTimeInMs / 1000;
    },
    [videoRef]
  );

  const bufferTime = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return secondsToMilliseconds(duration * (bufferedValue / 100));
  }, [bufferedValue, duration]);

  const durationFormatted = useMemo(() => timeFormat(duration), [duration]);
  const currentTimeFormatted = useMemo(
    () => timeFormat(currentTimeValue),
    [currentTimeValue]
  );

  if (isAdPlaying) {
    return null;
  }

  return (
    <div className="px-10">
      <VideoSeekSlider
        max={secondsToMilliseconds(duration)}
        currentTime={secondsToMilliseconds(currentTimeValue)}
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
};

export default BottomControls;


