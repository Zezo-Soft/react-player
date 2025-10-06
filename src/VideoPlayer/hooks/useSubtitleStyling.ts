import { useEffect } from "react";
import { useVideoStore } from "../../store/VideoState";

export interface SubtitleStyleConfig {
  fontSize?: string;
  backgroundColor?: string;
  textColor?: string;
  position?: "top" | "center" | "bottom";
  borderRadius?: string;
  padding?: string;
  maxWidth?: string;
}

export const useSubtitleStyling = (config?: SubtitleStyleConfig) => {
  const { videoRef } = useVideoStore();

  useEffect(() => {
    if (!videoRef) return;

    const applySubtitleStyles = () => {
      const style = document.createElement("style");
      style.id = "custom-subtitle-styles";

      const existingStyle = document.getElementById("custom-subtitle-styles");
      if (existingStyle) {
        existingStyle.remove();
      }

      const styles = `
        .video-player video::cue {
          font-size: ${config?.fontSize || "1.75rem"} !important;
          background: ${
            config?.backgroundColor ||
            "linear-gradient(135deg, #fbbf24, #f59e0b)"
          } !important;
          color: ${config?.textColor || "#000000"} !important;
          border-radius: ${config?.borderRadius || "12px"} !important;
          padding: ${config?.padding || "12px 20px"} !important;
          max-width: ${config?.maxWidth || "80%"} !important;
          ${
            config?.position === "top"
              ? "top: 10% !important; bottom: auto !important;"
              : ""
          }
          ${
            config?.position === "center"
              ? "top: 50% !important; bottom: auto !important; transform: translateX(-50%) translateY(-50%) !important;"
              : ""
          }
          ${
            config?.position === "bottom" || !config?.position
              ? "bottom: 15% !important; top: auto !important;"
              : ""
          }
        }
      `;

      style.textContent = styles;
      document.head.appendChild(style);
    };

    applySubtitleStyles();

    return () => {
      const existingStyle = document.getElementById("custom-subtitle-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [videoRef, config]);
};
