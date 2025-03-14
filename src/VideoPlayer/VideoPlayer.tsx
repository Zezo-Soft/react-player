import * as React from "react";
import "../index.css";
import { useVideoStore } from "../store/VideoState";
import Overlay from "./_components/Overlay";

const VideoPlayer = () => {
  const { setVideoRef, setCurrentTime, setVideoWrapperRef } = useVideoStore();
  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  return (
    <div ref={setVideoWrapperRef} className="w-fit h-fit mx-auto relative">
      <video
        ref={setVideoRef}
        className="w-full h-full"
        poster="https://i.ytimg.com/vi/FB8gESo9EVs/maxresdefault.jpg"
        src="https://res.cloudinary.com/dm4uaqlio/video/upload/v1727263375/Teri_Baaton_Mein___Shahid_Kapoor_Kriti_Sanon___Full_Hindi_Video_Songs_in_8K___4K_Ultra_HD_HDR_tuqfei.mp4"
        onContextMenu={onRightClick}
        // On currunt time update
        onTimeUpdate={(e) => {
          if (e?.currentTarget?.currentTime) {
            setCurrentTime(e?.currentTarget?.currentTime);
          }
        }}
      />
      <Overlay />
    </div>
  );
};

export default VideoPlayer;
