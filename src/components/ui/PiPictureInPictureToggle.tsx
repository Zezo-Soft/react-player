import React from "react";
import "../../VideoPlayer/components/styles/video-controls.css";

interface PiPictureInPictureToggleProps {
  onClick?: () => void;
  className?: string;
}

const PiPictureInPictureToggle: React.FC<PiPictureInPictureToggleProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <div onClick={onClick} className={`pip-toggle`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        className={`pip-icon ${className}`}
      >
        <rect width="9" height="6" x="11" y="11.99" fill="#fff" rx="1" />
        <rect
          width="22"
          height="18"
          x="1"
          y="3"
          stroke="#B3B3B3"
          strokeWidth="2"
          rx="3"
        />
      </svg>
    </div>
  );
};

export default PiPictureInPictureToggle;
