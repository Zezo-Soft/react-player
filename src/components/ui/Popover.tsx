import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  button: React.ReactNode;
  children: React.ReactNode;
  closeOnButtonClick?: boolean;
  className?: string;
}

const Popover: React.FC<PopoverProps> = ({
  button,
  children,
  closeOnButtonClick = false,
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

  return (
    <div className="relative inline-block">
      <div ref={buttonRef} onClick={togglePopover} tabIndex={0} role="button">
        {button}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 mt-2 w-fit bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-4 transition-all duration-200"
        >
          {/* Optional Arrow */}
          <div className="absolute -top-2 left-4 w-3 h-3 bg-white transform rotate-45 border-l border-t border-gray-200 z-[-1]" />
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
