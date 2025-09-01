import React from "react";

interface FullScreenToggleProps {
  isFullScreen: boolean;
  onClick?: () => void;
  className?: string;
}

const FullScreenToggle: React.FC<FullScreenToggleProps> = ({
  isFullScreen,
  onClick,
  className = "",
}) => {
  return (
    <div onClick={onClick} className={className} style={{ cursor: "pointer" }}>
      {isFullScreen ? (
        // Exit Full Screen Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          fill="none"
          viewBox="0 0 25 25"
        >
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.849 4.71l4.77 4.77H5.857a1.111 1.111 0 1 0 0 2.221H10.3a1.11 1.11 0 0 0 1.111-1.11V6.145a1.111 1.111 0 0 0-2.222 0v1.762l-4.77-4.77A1.111 1.111 0 1 0 2.85 4.709zm19.349 16.206l-4.77-4.77h1.762a1.111 1.111 0 0 0 0-2.223h-4.444c-.614 0-1.111.498-1.111 1.112v4.444a1.111 1.111 0 0 0 2.222 0v-1.762l4.77 4.77a1.111 1.111 0 1 0 1.571-1.571z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Full Screen Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          fill="none"
          viewBox="0 0 25 25"
        >
          <path
            fill="#fff"
            d="M4.746 8.056V6.294L18.73 20.278h-1.762a1.111 1.111 0 1 0 0 2.222h4.444a1.11 1.11 0 0 0 1.111-1.111v-4.445a1.111 1.111 0 0 0-2.222 0v1.762L6.317 4.722h1.762a1.111 1.111 0 1 0 0-2.222H3.635c-.614 0-1.112.497-1.112 1.111v4.445a1.111 1.111 0 1 0 2.223 0z"
          />
        </svg>
      )}
    </div>
  );
};

export default FullScreenToggle;
