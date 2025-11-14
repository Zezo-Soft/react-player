import { useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";
import { SubtitleTrack } from "../../store/types/StoreTypes";

export const useSubtitles = (subtitles?: SubtitleTrack[]) => {
  const { videoRef, activeSubtitle, setSubtitles } = useVideoStore();

  useEffect(() => {
    if (videoRef) {
      const tracks = videoRef.getElementsByTagName("track");
      while (tracks.length > 0) {
        videoRef.removeChild(tracks[0]);
      }

      Array.from(videoRef.textTracks).forEach((track) => {
        track.mode = "disabled";
      });

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
          const handleTrackLoad = () => {
            const textTrack = Array.from(videoRef.textTracks).find(
              (track) => track.label === activeSubtitle.label
            );
            if (textTrack) {
              textTrack.mode = "showing";
            }
          };

          trackElement.addEventListener("load", handleTrackLoad);

          const attempts = [100, 500, 1000];
          attempts.forEach((delay) => {
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
        Array.from(videoRef.textTracks).forEach((track) => {
          track.mode = "disabled";
        });
      }
    }
  }, [videoRef, activeSubtitle, subtitles]);

  useEffect(() => {
    if (subtitles) {
      setSubtitles(subtitles);
    }
  }, [subtitles, setSubtitles]);
};
