import { useVideoStore } from "../../store/VideoState";

export const useVideoEvents = () => {
  const { setCurrentTime, setDuration, setBufferedProgress, setIsPlaying } =
    useVideoStore();

  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  const onSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e?.currentTarget?.currentTime) {
      setCurrentTime(e?.currentTarget?.currentTime);
    }
  };

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e?.currentTarget?.currentTime) {
      setCurrentTime(e?.currentTarget?.currentTime);
    }
  };

  const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e?.currentTarget?.duration) {
      localStorage.setItem("current_time", "0");
      setDuration(e?.currentTarget?.duration);
    }
  };

  const onProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (
      video.buffered.length > 0 &&
      video.duration > 0 &&
      !isNaN(video.duration)
    ) {
      let bufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        if (
          video.currentTime >= video.buffered.start(i) &&
          video.currentTime <= video.buffered.end(i)
        ) {
          bufferedEnd = video.buffered.end(i);
          break;
        }
      }

      if (bufferedEnd === 0 && video.buffered.length > 0) {
        bufferedEnd = video.buffered.end(video.buffered.length - 1);
      }

      const bufferedProgress = Math.min(
        (bufferedEnd / video.duration) * 100,
        100
      );
      setBufferedProgress(bufferedProgress);
    }
  };

  const onPlay = () => {
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
  };

  const onEnded = () => {
    setIsPlaying(false);
  };

  return {
    onRightClick,
    onSeeked,
    onTimeUpdate,
    onLoadedMetadata,
    onProgress,
    onPlay,
    onPause,
    onEnded,
  };
};
