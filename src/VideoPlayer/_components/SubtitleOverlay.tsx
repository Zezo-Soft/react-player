import React, { useEffect, useState } from "react";
import { useVideoStore } from "../../store/VideoState";
import { SubtitleStyleConfig } from "../hooks/useSubtitleStyling";

interface SubtitleOverlayProps {
  styleConfig?: SubtitleStyleConfig;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ styleConfig }) => {
  const { videoRef, activeSubtitle } = useVideoStore();
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!videoRef) return;

    const handleTimeUpdate = () => {
      if (!activeSubtitle) {
        setCurrentSubtitle("");
        setIsVisible(false);
        return;
      }
      const currentTime = videoRef.currentTime;

      const textTracks = Array.from(videoRef.textTracks);
      console.log(
        "Available text tracks:",
        textTracks.map((t) => ({
          label: t.label,
          mode: t.mode,
          cues: t.cues?.length,
        }))
      );

      const activeTrack = textTracks.find(
        (track) =>
          track.mode === "showing" && track.label === activeSubtitle.label
      );

      console.log(
        "Active track found:",
        !!activeTrack,
        "Current time:",
        currentTime
      );

      if (activeTrack && activeTrack.cues) {
        const activeCues = Array.from(activeTrack.cues).filter(
          (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
        );

        if (activeCues.length > 0) {
          const cue = activeCues[0];
          let cueText = "";

          try {
            if ("text" in cue) {
              cueText = (cue as any).text;
            } else if (typeof (cue as any).getCueAsHTML === "function") {
              const htmlElement = (cue as any).getCueAsHTML();
              cueText =
                htmlElement?.textContent || htmlElement?.innerText || "";
            } else {
              cueText = cue.toString() || "";
            }
          } catch (error) {
            console.warn("Error getting subtitle text:", error);
            cueText = "";
          }

          setCurrentSubtitle(cueText);
          setIsVisible(!!cueText);
        } else {
          setCurrentSubtitle("");
          setIsVisible(false);
        }
      }
    };

    videoRef.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoRef.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoRef, activeSubtitle]);

  useEffect(() => {
    if (!activeSubtitle) {
      setCurrentSubtitle("");
      setIsVisible(false);
    }
  }, [activeSubtitle]);

  if (!isVisible || !currentSubtitle) return null;

  const getPositionStyles = () => {
    const position = styleConfig?.position || "bottom";

    switch (position) {
      case "top":
        return {
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "center":
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      case "bottom":
      default:
        return {
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
        };
    }
  };

  const subtitleStyle = {
    position: "absolute" as const,
    ...getPositionStyles(),
    fontSize: styleConfig?.fontSize || "1.2rem",
    fontWeight: "500",
    lineHeight: "1.2",
    textAlign: "center" as const,
    background: styleConfig?.backgroundColor || "rgba(0, 0, 0, 0.4)",
    color: styleConfig?.textColor || "#fff",
    padding: styleConfig?.padding || "8px 16px",
    borderRadius: styleConfig?.borderRadius || "5px",
    maxWidth: styleConfig?.maxWidth || "60%",
    minWidth: "fit-content",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.2s ease-in-out",
    opacity: isVisible ? 1 : 0,
    zIndex: 10,
    pointerEvents: "none" as const,
  };

  return <div style={subtitleStyle}>{currentSubtitle}</div>;
};

export default SubtitleOverlay;
