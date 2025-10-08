import { useEffect, useState } from "react";
import { useVideoStore } from "../../store/VideoState";
import { IntroConfig } from "../types/VideoPlayerTypes";

export const useIntroSkip = (intro?: IntroConfig) => {
  const { videoRef } = useVideoStore();
  const [showSkipIntro, setShowSkipIntro] = useState(false);

  useEffect(() => {
    if (!videoRef || !intro) return;

    const checkIntro = () => {
      if (
        videoRef.currentTime >= intro.start &&
        videoRef.currentTime < intro.end
      ) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }
    };

    videoRef.addEventListener("timeupdate", checkIntro);
    return () => {
      videoRef.removeEventListener("timeupdate", checkIntro);
    };
  }, [videoRef, intro]);

  const handleSkipIntro = () => {
    if (videoRef && intro) {
      videoRef.currentTime = intro.end;
      setShowSkipIntro(false);
    }
  };

  return {
    showSkipIntro,
    handleSkipIntro,
  };
};
