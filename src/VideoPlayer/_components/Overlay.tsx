import * as React from "react";
import { useCallback, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import VideoPlayerControls from "./VideoPlayerControls";

const Overlay = () => {
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setControls, controls } = useVideoStore();
  const handleMouseEnter = useCallback(() => {
    const videoPlayerControls = document?.getElementById("videoPlayerControls");
    if (videoPlayerControls) {
      videoPlayerControls.classList.remove("noCursor");
    }
    setControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setControls(false);
      if (videoPlayerControls) {
        videoPlayerControls.classList.add("noCursor");
      }
    }, 3000); // 3 seconds
  }, [setControls]);

  return (
    <div
      id="videoPlayerControls"
      className="absolute inset-0"
      onMouseMove={handleMouseEnter}
    >
      {controls && <VideoPlayerControls />}
    </div>
  );
};

export default Overlay;
