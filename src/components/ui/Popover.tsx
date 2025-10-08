import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  button: React.ReactNode;
  children: React.ReactNode;
  closeOnButtonClick?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

const Popover: React.FC<PopoverProps> = ({
  button,
  children,
  closeOnButtonClick = false,
  className = "",
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const togglePopover = () => {
    setIsOpen((prev) => (closeOnButtonClick ? !prev : true));
  };

  // Get alignment classes
  const getAlignmentClasses = () => {
    switch (align) {
      case "center":
        return "left-1/2 -translate-x-1/2";
      case "right":
        return "right-0";
      case "left":
      default:
        return "left-0";
    }
  };

  // Arrow is always centered regardless of popover alignment
  const getArrowPositionClasses = () => {
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <div className="relative inline-block">
      <div ref={buttonRef} onClick={togglePopover} tabIndex={0} role="button">
        {button}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute ${getAlignmentClasses()} mt-2 w-fit bg-[#3a4049] text-white shadow-2xl rounded-lg border border-white/10 z-50 p-0 transition-all duration-200 ${className}`}
        >
          {/* Optional Arrow */}
          <div
            className={`absolute -top-2 ${getArrowPositionClasses()} w-3 h-3 bg-[#3a4049] transform rotate-45 border-l border-t border-white/10 z-[-1]`}
          />
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
