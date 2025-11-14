import React from "react";

interface ThumbProps {
  max: number;
  currentTime: number;
  isThumbActive: boolean;
  trackColor?: string;
}

export const Thumb: React.FC<ThumbProps> = ({
  max,
  currentTime,
  isThumbActive,
  trackColor,
}) => {
  const getThumbHandlerPosition = (): {
    left: string;
  } => {
    const thumbConstantOffset = -6;
    const leftPosition = (currentTime / max) * 100;

    return {
      left: `calc(${leftPosition}% + ${thumbConstantOffset}px)`,
    };
  };

  return (
    <div
      className="thumb active"
      data-testid="testThumb"
      style={getThumbHandlerPosition()}
    >
      <div
        className="handler"
        style={{
          backgroundColor: trackColor || "#ff0000",
        }}
      />
    </div>
  );
};

