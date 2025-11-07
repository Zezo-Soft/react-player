import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  title: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  position = "top",
  className,
}) => {
  const [visible, setVisible] = useState(false);

  const positionStyles: Record<string, string> = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-block cursor-pointer ${className || ""}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-1 text-sm text-white bg-gray-900 rounded-md shadow-md transition-opacity duration-200 ease-in-out whitespace-nowrap ${positionStyles[position]}`}
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
