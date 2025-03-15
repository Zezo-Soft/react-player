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
    <div className="px-10 text-white">
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
        } lg:pb-10 flex gap-2 items-center`}
      >
        <p className="lg:text-xl font-semibold">
          {timeFormat(currentTime || 0)}
        </p>{" "}
        <p className="lg:text-2xl">/</p>{" "}
        <p className="lg:text-xl font-semibold">{timeFormat(duration || 0)}</p>
      </div>
    </div>
  );
};

export default BottomControls;
