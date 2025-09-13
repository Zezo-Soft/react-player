import React from "react";
import { secondsToMilliseconds, timeFormat } from "../utils";
import { useVideoStore } from "../../store/VideoState";
import { VideoSeekSlider } from "./TimeLine/TimeLine";
import "./TimeLine/time-line.css";
import { IControlsBottomProps } from "../../types";

const BottomControls: React.FC<IControlsBottomProps> = ({ config }) => {
  const { videoRef, currentTime, isFullscreen } = useVideoStore();
  const duration = videoRef?.duration;
  const bufferTime = 0;

  return (
    <div className="px-10">
      <VideoSeekSlider
        max={secondsToMilliseconds(duration || 0)}
        currentTime={secondsToMilliseconds(currentTime || 0)}
        bufferTime={secondsToMilliseconds(bufferTime || 0)}
        onChange={(currentTime: number) => {
          if (videoRef) {
            videoRef.currentTime = currentTime / 1000;
          }
        }}
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
        <span className="text-lg lg:text-3xl font-semibold text-white cursor-pointer hover:text-gray-200 transition-colors duration-200">
          {timeFormat(currentTime || 0)}
        </span>
        <span className="text-lg lg:text-3xl font-semibold text-gray-500 cursor-pointer hover:text-gray-200 transition-colors duration-200">
          /
        </span>
        <span className="text-lg lg:text-3xl font-semibold text-gray-400 cursor-pointer hover:text-gray-200 transition-colors duration-200">
          {timeFormat(duration || 0)}
        </span>
      </div>
    </div>
  );
};

export default BottomControls;
