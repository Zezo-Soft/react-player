import { useVideoStore } from "../../store/VideoState";

export const useVideoEvents = () => {
  const { setCurrentTime, setDuration } = useVideoStore();

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

  return {
    onRightClick,
    onSeeked,
    onTimeUpdate,
    onLoadedMetadata,
  };
};
