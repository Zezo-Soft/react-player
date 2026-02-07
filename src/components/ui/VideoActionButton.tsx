import React from "react";

interface VideoActionButtonProps {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  position?: "left" | "right";
}

const VideoActionButton: React.FC<VideoActionButtonProps> = React.memo(({
  text,
  onClick,
  icon,
  disabled = false,
  position = "left",
}) => {
  const renderedIcon = icon
    ? React.cloneElement(
        icon as React.ReactElement,
        {
          className: "h-5 w-5 text-gray-900",
        } as React.HTMLAttributes<React.ReactElement>
      )
    : null;

  return (
    <div
      className={`absolute bottom-36 ${
        position === "left" ? "left-32" : "right-32"
      }`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className="
          bg-white/80 text-gray-900 font-semibold px-6 py-2 
          rounded-md text-sm flex items-center
          backdrop-blur-sm shadow-md
          hover:bg-white/90
          transition
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/50
        "
      >
        {renderedIcon && <span className="inline mr-2">{renderedIcon}</span>}
        {text}
      </button>
    </div>
  );
});

VideoActionButton.displayName = "VideoActionButton";

export default VideoActionButton;
