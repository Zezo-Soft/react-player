import { useCallback, useEffect, useRef, useState } from "react";

const HIDE_DELAY_MS = 3000;

export const useOverlayAutoHide = () => {
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);
  const onMouseMove = useCallback(() => {
    setIsHovered(true);
    setShowControls(true);
  }, []);

  useEffect(() => {
    if (isHovered) {
      setShowControls(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    timeoutRef.current = setTimeout(() => setShowControls(false), HIDE_DELAY_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  return { showControls, onMouseEnter, onMouseLeave, onMouseMove };
};
