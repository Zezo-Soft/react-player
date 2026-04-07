import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  button: React.ReactNode;
  children: React.ReactNode;
  closeOnButtonClick?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
  onOpenChange?: (open: boolean) => void;
  triggerAriaLabel?: string;
}

const VIEW_MARGIN = 8;
const GAP_BELOW_TRIGGER = 6;
const POPOVER_Z = 100_060;

const Popover: React.FC<PopoverProps> = ({
  button,
  children,
  closeOnButtonClick = false,
  className = "",
  align = "left",
  onOpenChange,
  triggerAriaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    ready: boolean;
  }>({ top: 0, left: 0, arrowLeft: 0, ready: false });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  /** Only while open: closing the menu must not steal pointer events from the panel. */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const panel = popoverRef.current;
      const trigger = buttonRef.current;
      const node = event.target as Node | null;
      if (!node) return;
      if (panel?.contains(node) || trigger?.contains(node)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement((p) => ({ ...p, ready: false }));
      return;
    }

    let rafAttempts = 0;
    const MAX_RAF_ATTEMPTS = 12;

    const updatePlacement = () => {
      const btn = buttonRef.current;
      const panel = popoverRef.current;
      if (!btn || !panel) {
        if (rafAttempts < MAX_RAF_ATTEMPTS) {
          rafAttempts += 1;
          requestAnimationFrame(updatePlacement);
        }
        return;
      }

      const br = btn.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const vw = window.innerWidth;
      const buttonCenterX = br.left + br.width / 2;

      let left: number;
      if (align === "center") {
        left = buttonCenterX - pr.width / 2;
      } else if (align === "right") {
        left = br.right - pr.width;
      } else {
        left = br.left;
      }

      left = Math.max(
        VIEW_MARGIN,
        Math.min(left, vw - pr.width - VIEW_MARGIN)
      );

      const top = br.bottom + GAP_BELOW_TRIGGER;
      const arrowLeft = buttonCenterX - left;

      setPlacement({
        top,
        left,
        arrowLeft,
        ready: true,
      });
    };

    updatePlacement();
    const raf = requestAnimationFrame(updatePlacement);

    const ro = new ResizeObserver(() => {
      updatePlacement();
    });
    if (buttonRef.current) ro.observe(buttonRef.current);
    if (popoverRef.current) ro.observe(popoverRef.current);

    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isOpen, align]);

  const togglePopover = () => {
    setIsOpen((prev) => (closeOnButtonClick ? !prev : true));
  };

  const stopBubblingToDocument = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative inline-flex w-max max-w-full shrink-0">
      <div
        ref={buttonRef}
        onClick={togglePopover}
        tabIndex={0}
        role="button"
        aria-label={triggerAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {button}
      </div>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal={false}
            className={`fixed w-fit max-w-[min(calc(100vw-16px),320px)] bg-[#3a4049] text-white shadow-2xl rounded-lg border border-white/10 p-0 transition-opacity duration-200 pointer-events-auto touch-manipulation ${className}`}
            style={{
              top: placement.top,
              left: placement.left,
              zIndex: POPOVER_Z,
            }}
            onMouseDown={stopBubblingToDocument}
            onTouchStart={stopBubblingToDocument}
          >
            <div
              className="absolute w-3 h-3 bg-[#3a4049] border-l border-t border-white/10 pointer-events-none"
              style={{
                top: -6,
                left: placement.ready ? placement.arrowLeft : "50%",
                transform: "translateX(-50%) rotate(45deg)",
              }}
            />
            {children}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Popover;
