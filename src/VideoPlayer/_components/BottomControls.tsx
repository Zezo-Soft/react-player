import * as React from "react";
import { VideoSeekSlider } from "react-video-seek-slider";
import "react-video-seek-slider/styles.css";
import { secondsToMilliseconds, timeFormat } from "../utils";
import { useVideoStore } from "../../store/VideoState";

interface IBottomControlsProps {
  onChange?: (currentTime: number) => void;
  isFullscreen?: boolean;
}

const BottomControls: React.FC<IBottomControlsProps> = ({
  onChange,
  isFullscreen,
}) => {
  const { videoRef, currentTime } = useVideoStore();
  const duration = videoRef?.duration;
  const bufferTime = videoRef?.buffered.end(0);

  //   const previewImage = useRef("");
  //   const updatePreviewImage = (hoverTime: number) => {
  //     const url = `https://via.placeholder.com/140x60?text=${hoverTime}`;
  //     const image = document.createElement("img");
  //     image.src = url;

  //     image.onload = () => {
  //       previewImage.current = url;
  //     };
  //   };

  //   const handleGettingPreview = useCallback(
  //     (hoverTime: number) => {
  //       // FIND AND RETURN LOADED!!! VIDEO PREVIEW ACCORDING TO the hoverTime TIME
  //       console.log({ hoverTime, duration });
  //       updatePreviewImage(hoverTime);

  //       return previewImage.current;
  //     },
  //     [duration]
  //   );
  return (
    <div className="px-10 text-white">
      <VideoSeekSlider
        max={secondsToMilliseconds(duration || 0)}
        currentTime={secondsToMilliseconds(currentTime || 0)}
        bufferTime={secondsToMilliseconds(bufferTime || 0)}
        onChange={(currentTime: number) => onChange && onChange(currentTime)}
        secondsPrefix="00:00:"
        minutesPrefix="00:"

        // getPreviewScreenUrl={handleGettingPreview}
        // timeCodes={[
        //   {
        //     fromMs: 0,
        //     description: "This is a very logn first part label you could use",
        //   },
        //   {
        //     fromMs: 130000,
        //     description: "This is the second part",
        //   },
        //   {
        //     fromMs: 270000,
        //     description: "One more part label",
        //   },
        //   {
        //     fromMs: 440000,
        //     description: "Final battle",
        //   },
        //   {
        //     fromMs: 600000,
        //     description: "Cast ",
        //   },
        // ]}
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
