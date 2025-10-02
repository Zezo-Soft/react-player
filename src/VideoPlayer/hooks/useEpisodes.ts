import { useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";
import { Episode } from "../../store/types/StoreTypes";
import { NextEpisodeConfig } from "../types/VideoPlayerTypes";

export const useEpisodes = (
  episodeList?: Episode[],
  currentEpisodeIndex?: number,
  nextEpisodeConfig?: NextEpisodeConfig
) => {
  const { 
    videoRef, 
    setEpisodeList, 
    setCurrentEpisodeIndex, 
    setShowCountdown 
  } = useVideoStore();

  // Set episodes and current index in store
  useEffect(() => {
    if (episodeList) {
      setEpisodeList(episodeList);
    }
    if (currentEpisodeIndex !== undefined) {
      setCurrentEpisodeIndex(currentEpisodeIndex);
    }
  }, [episodeList, currentEpisodeIndex, setEpisodeList, setCurrentEpisodeIndex]);

  // Handle next episode logic based on config
  useEffect(() => {
    if (!videoRef || !nextEpisodeConfig) return;

    const checkNextEpisode = () => {
      const currentTime = videoRef.currentTime || 0;

      // Show countdown based on backend config
      if (nextEpisodeConfig.showAtEnd && videoRef.ended) {
        setShowCountdown(true);
      } else if (
        nextEpisodeConfig.showAtTime &&
        currentTime >= nextEpisodeConfig.showAtTime
      ) {
        setShowCountdown(true);
      }
    };

    videoRef.addEventListener("timeupdate", checkNextEpisode);
    videoRef.addEventListener("ended", checkNextEpisode);
    
    return () => {
      videoRef.removeEventListener("timeupdate", checkNextEpisode);
      videoRef.removeEventListener("ended", checkNextEpisode);
    };
  }, [videoRef, nextEpisodeConfig, setShowCountdown]);
};
