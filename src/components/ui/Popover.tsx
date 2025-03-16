import React from "react";
import { useState, useRef, useEffect } from "react";

const Popover = ({
  button,
  children,
}: {
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{button}</div>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-fit bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
