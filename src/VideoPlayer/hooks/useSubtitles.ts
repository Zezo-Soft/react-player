import { useEffect, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import { SubtitleTrack } from "../../store/types/StoreTypes";

export const useSubtitles = (subtitles?: SubtitleTrack[]) => {
  const { videoRef, activeSubtitle, setSubtitles } = useVideoStore();
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any pending timeouts from previous effect runs
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];

    if (!videoRef) return;

    const tracks = videoRef.getElementsByTagName("track");
    while (tracks.length > 0) {
      videoRef.removeChild(tracks[0]);
    }

    Array.from(videoRef.textTracks).forEach((track) => {
      track.mode = "disabled";
    });

    let trackElement: HTMLTrackElement | null = null;
    let handleTrackLoad: (() => void) | null = null;

    if (activeSubtitle && subtitles) {
      const index = subtitles.findIndex(
        (s) => s.label === activeSubtitle.label
      );
      if (index !== -1) {
        trackElement = document.createElement("track");
        trackElement.kind = "subtitles";
        trackElement.label = activeSubtitle.label;
        trackElement.srclang = activeSubtitle.lang;
        trackElement.src = activeSubtitle.url;
        trackElement.default = false;
        videoRef.appendChild(trackElement);

        handleTrackLoad = () => {
          const textTrack = Array.from(videoRef.textTracks).find(
            (track) => track.label === activeSubtitle.label
          );
          if (textTrack) {
            textTrack.mode = "showing";
          }
        };

        trackElement.addEventListener("load", handleTrackLoad);

        // Fallback attempts with proper cleanup tracking
        const attempts = [100, 500, 1000];
        attempts.forEach((delay) => {
          const timeoutId = setTimeout(() => {
            const textTrack = Array.from(videoRef.textTracks).find(
              (track) => track.label === activeSubtitle.label
            );
            if (textTrack && textTrack.mode !== "showing") {
              textTrack.mode = "showing";
            }
          }, delay);
          timeoutIdsRef.current.push(timeoutId);
        });
      }
    }

    // Cleanup function
    return () => {
      // Clear all pending timeouts
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];

      // Remove event listener if it was added
      if (trackElement && handleTrackLoad) {
        trackElement.removeEventListener("load", handleTrackLoad);
      }
    };
  }, [videoRef, activeSubtitle, subtitles]);

  useEffect(() => {
    if (subtitles) {
      setSubtitles(subtitles);
    }
  }, [subtitles, setSubtitles]);
};
