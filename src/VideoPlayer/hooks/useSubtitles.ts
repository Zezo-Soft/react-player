import { useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";
import { SubtitleTrack } from "../../store/types/StoreTypes";

export const useSubtitles = (subtitles?: SubtitleTrack[]) => {
  const { videoRef, activeSubtitle, setSubtitles } = useVideoStore();

  useEffect(() => {
    if (videoRef) {
      // Remove existing tracks
      const tracks = videoRef.getElementsByTagName("track");
      while (tracks.length > 0) {
        videoRef.removeChild(tracks[0]);
      }

      // Disable all text tracks
      Array.from(videoRef.textTracks).forEach((track) => {
        track.mode = "disabled";
      });

      // Add active subtitle if available
      if (activeSubtitle && subtitles) {
        const index = subtitles.findIndex(
          (s) => s.label === activeSubtitle.label
        );
        if (index !== -1) {
          const trackElement = document.createElement("track");
          trackElement.kind = "subtitles";
          trackElement.label = activeSubtitle.label;
          trackElement.srclang = activeSubtitle.lang;
          trackElement.src = activeSubtitle.url;
          trackElement.default = false;
          videoRef.appendChild(trackElement);

          const textTrack = Array.from(videoRef.textTracks).find(
            (track) => track.label === activeSubtitle.label
          );
          // Set up event listeners for track loading
          const handleTrackLoad = () => {
            const textTrack = Array.from(videoRef.textTracks).find(
              (track) => track.label === activeSubtitle.label
            );
            if (textTrack) {
              textTrack.mode = "showing"; // Use showing mode for our custom overlay
              console.log("Subtitle track loaded for custom rendering:", activeSubtitle.label);
            }
          };

          trackElement.addEventListener('load', handleTrackLoad);
          
          // Also try multiple times to ensure it loads
          const attempts = [100, 500, 1000];
          attempts.forEach(delay => {
            setTimeout(() => {
              const textTrack = Array.from(videoRef.textTracks).find(
                (track) => track.label === activeSubtitle.label
              );
              if (textTrack && textTrack.mode !== "showing") {
                textTrack.mode = "showing";
              }
            }, delay);
          });
        }
      } else {
        // When no active subtitle, ensure all tracks are disabled
        Array.from(videoRef.textTracks).forEach((track) => {
          track.mode = "disabled";
        });
      }
    }
  }, [videoRef, activeSubtitle, subtitles]);

  // Set subtitles in store when prop changes
  useEffect(() => {
    if (subtitles) {
      setSubtitles(subtitles);
    }
  }, [subtitles, setSubtitles]);
};
