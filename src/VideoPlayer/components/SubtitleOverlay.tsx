import React, { useEffect, useState, useRef, useMemo } from "react";
import { useVideoStore } from "../../store/VideoState";
import { useShallow } from "zustand/react/shallow";
import {
  SubtitleStyleConfig,
  isTailwindBackground,
} from "../hooks/useSubtitleStyling";

interface SubtitleOverlayProps {
  styleConfig?: SubtitleStyleConfig;
}

const getPositionStyles = (position?: "top" | "center" | "bottom") => {
  const pos = position || "bottom";
  switch (pos) {
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

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ styleConfig }) => {
  const { videoRef, activeSubtitle } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      activeSubtitle: state.activeSubtitle,
    }))
  );
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!videoRef) return;

    const handleTimeUpdate = () => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        if (!activeSubtitle) {
          setCurrentSubtitle("");
          setIsVisible(false);
          return;
        }
        const currentTime = videoRef.currentTime;
        const textTracks = Array.from(videoRef.textTracks);
        const activeTrack = textTracks.find(
          (track) =>
            track.mode === "showing" && track.label === activeSubtitle.label
        );

        if (activeTrack?.cues) {
          const activeCues = Array.from(activeTrack.cues).filter(
            (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
          );

          if (activeCues.length > 0) {
            const cue = activeCues[0];
            let cueText = "";
            try {
              if ("text" in cue) {
                cueText = (cue as VTTCue).text;
              } else if (typeof (cue as VTTCue & { getCueAsHTML?: () => DocumentFragment }).getCueAsHTML === "function") {
                const fragment = (cue as VTTCue & { getCueAsHTML: () => DocumentFragment }).getCueAsHTML();
                cueText = fragment?.textContent ?? "";
              } else {
                cueText = cue.toString() ?? "";
              }
            } catch {
              cueText = "";
            }
            setCurrentSubtitle(cueText);
            setIsVisible(!!cueText);
          } else {
            setCurrentSubtitle("");
            setIsVisible(false);
          }
        } else {
          setCurrentSubtitle("");
          setIsVisible(false);
        }
      });
    };

    videoRef.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoRef.removeEventListener("timeupdate", handleTimeUpdate);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [videoRef, activeSubtitle]);

  useEffect(() => {
    if (!activeSubtitle) {
      setCurrentSubtitle("");
      setIsVisible(false);
    }
  }, [activeSubtitle]);

  const bgValue = styleConfig?.backgroundColor ?? "rgba(0, 0, 0, 0.4)";
  const isTailwindBg = isTailwindBackground(bgValue);
  const bgClassName = isTailwindBg
    ? (bgValue.trim().toLowerCase() === "transparent" ? "bg-transparent" : bgValue.trim())
    : undefined;
  const isTransparentBg =
    bgValue.trim().toLowerCase() === "transparent" ||
    bgClassName === "bg-transparent";

  const subtitleStyle = useMemo(
    () => {
      const base: React.CSSProperties = {
        position: "absolute",
        ...getPositionStyles(styleConfig?.position),
        fontSize: styleConfig?.fontSize ?? "1.2rem",
        fontWeight: "500",
        lineHeight: "1.2",
        textAlign: "center",
        color: styleConfig?.textColor ?? "#fff",
        padding: styleConfig?.padding ?? "8px 16px",
        borderRadius: styleConfig?.borderRadius ?? "5px",
        maxWidth: styleConfig?.maxWidth ?? "60%",
        minWidth: "fit-content",
        boxShadow: isTransparentBg ? "none" : "0 6px 20px rgba(0, 0, 0, 0.4)",
        backdropFilter: isTransparentBg ? "none" : "blur(6px)",
        border: isTransparentBg ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.2s ease-in-out",
        opacity: isVisible ? 1 : 0,
        zIndex: 10,
        pointerEvents: "none",
      };
      if (!isTailwindBg) base.background = bgValue;
      return base;
    },
    [styleConfig, isVisible, bgValue, isTailwindBg, isTransparentBg]
  );

  if (!isVisible || !currentSubtitle) return null;

  return (
    <div className={bgClassName} style={subtitleStyle}>
      {currentSubtitle}
    </div>
  );
};

SubtitleOverlay.displayName = "SubtitleOverlay";

export default SubtitleOverlay;
