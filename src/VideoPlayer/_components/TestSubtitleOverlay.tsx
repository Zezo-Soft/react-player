import React, { useState, useEffect } from "react";
import { SubtitleStyleConfig } from "../hooks/useSubtitleStyling";

interface TestSubtitleOverlayProps {
  styleConfig?: SubtitleStyleConfig;
}

// Test component to verify positioning works
const TestSubtitleOverlay: React.FC<TestSubtitleOverlayProps> = ({ styleConfig }) => {
  const [testText, setTestText] = useState("Test Subtitle - Position Working!");

  useEffect(() => {
    // Cycle through different test texts
    const texts = [
      "Test Subtitle - Position Working!",
      "यह एक परीक्षण उपशीर्षक है",
      "This is a test subtitle with longer text to check wrapping",
      "🎬 Emoji test subtitle 🎭"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setTestText(texts[index]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    fontSize: styleConfig?.fontSize || "1.75rem",
    fontWeight: "600",
    lineHeight: "1.3",
    textAlign: "center" as const,
    background: styleConfig?.backgroundColor || "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: styleConfig?.textColor || "#000000",
    padding: styleConfig?.padding || "12px 20px",
    borderRadius: styleConfig?.borderRadius || "12px",
    maxWidth: styleConfig?.maxWidth || "80%",
    minWidth: "fit-content",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(2px)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.2s ease-in-out",
    zIndex: 10,
    pointerEvents: "none" as const,
  };

  return (
    <div style={subtitleStyle}>
      {testText}
    </div>
  );
};

export default TestSubtitleOverlay;
