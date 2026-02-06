import React, { useEffect, useCallback, useState, memo } from "react";
import { Loader } from "lucide-react";
import { useVideoStore } from "../../../store/VideoState";
import { useShallow } from "zustand/react/shallow";
import {
  CONTROL_INTERACTION_EVENT,
  SKIP_INTERVAL_SECONDS,
} from "../../constants";

const BackwardIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon-class"
    fill="currentColor"
    viewBox="0 0 67 67"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M33.5 0C52 0 67 15 67 33.5S52 67 33.5 67 0 52 0 33.5c.03-1.4 1.17-2.53 2.58-2.53 1.4 0 2.55 1.13 2.57 2.53 0 15.65 12.7 28.35 28.35 28.35 15.66 0 28.35-12.7 28.35-28.35 0-15.66-12.69-28.35-28.35-28.35h-.04c-7 0-13.76 2.61-18.94 7.3-.46.42-.91.85-1.34 1.29h6.58c1.42 0 2.57 1.16 2.57 2.58 0 1.42-1.15 2.58-2.57 2.58H6.01c-1.42 0-2.57-1.16-2.57-2.58V2.58C3.44 1.15 4.59 0 6.01 0c1.43 0 2.58 1.15 2.58 2.58v8.52c.78-.86 1.61-1.7 2.47-2.47A33.407 33.407 0 0 1 33.46 0h.04zM33.98 41.34c-1.6-2.21-2-5.2-2-7.85 0-2.65.4-5.63 2-7.83 1.44-1.97 3.47-2.84 5.88-2.84 2.41 0 4.42.87 5.86 2.84 1.61 2.21 2.03 5.16 2.03 7.83 0 2.66-.4 5.64-2 7.85-1.43 1.97-3.47 2.84-5.89 2.84-2.41 0-4.45-.86-5.88-2.84zm-9.73-12.77l-5 1.58v-4.21l5.87-2.65h4.28v20.47h-5.15V28.57zm17.61 9.96c.61-1.33.68-3.6.68-5.04s-.07-3.7-.68-5.02c-.4-.86-1.04-1.29-2-1.29-.95 0-1.59.42-1.99 1.29-.61 1.32-.68 3.58-.68 5.02 0 1.44.07 3.71.68 5.04.4.87 1.04 1.29 1.99 1.29.96 0 1.6-.42 2-1.29z"
    ></path>
  </svg>
));
BackwardIcon.displayName = "BackwardIcon";

const ForwardIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon-class"
    fill="currentColor"
    viewBox="0 0 67 67"
  >
    <path
      fillRule="evenodd"
      d="M33.5 0C15 0 0 15 0 33.5S15 67 33.5 67 67 52 67 33.5a2.583 2.583 0 0 0-2.58-2.53c-1.4 0-2.55 1.13-2.57 2.53 0 15.66-12.69 28.35-28.35 28.35-15.65 0-28.35-12.7-28.35-28.35 0-15.66 12.7-28.35 28.35-28.35 7.3 0 13.96 2.76 18.99 7.3.46.42.9.85 1.34 1.29h-6.59a2.58 2.58 0 0 0 0 5.16h13.75c1.42 0 2.57-1.16 2.57-2.58V2.58c0-1.43-1.15-2.58-2.57-2.58-1.43 0-2.58 1.15-2.58 2.58v8.52c-.78-.87-1.61-1.7-2.47-2.48A33.446 33.446 0 0 0 33.54 0h-.04zM33.98 41.34c-1.6-2.21-2-5.2-2-7.85 0-2.65.4-5.63 2-7.83 1.44-1.97 3.47-2.84 5.88-2.84 2.41 0 4.42.87 5.86 2.84 1.61 2.21 2.03 5.16 2.03 7.83 0 2.66-.4 5.64-2 7.85-1.43 1.97-3.47 2.84-5.89 2.84-2.41 0-4.45-.87-5.88-2.84zm-9.73-12.77l-5 1.58v-4.21l5.87-2.65h4.28v20.47h-5.15V28.57zm17.61 9.96c.61-1.33.68-3.6.68-5.04s-.07-3.7-.68-5.02c-.4-.87-1.04-1.29-2-1.29-.95 0-1.59.42-1.99 1.29-.61 1.32-.68 3.58-.68 5.02 0 1.44.07 3.71.68 5.04.4.86 1.04 1.28 1.99 1.28.96 0 1.6-.42 2-1.28z"
    ></path>
  </svg>
));
ForwardIcon.displayName = "ForwardIcon";

const PauseIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon-class"
    fill="currentColor"
    viewBox="0 0 67 67"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M46.332 5.773a4.125 4.125 0 0 0-4.125 4.125v46.75a4.127 4.127 0 0 0 4.125 4.125 4.127 4.127 0 0 0 4.125-4.125V9.898a4.125 4.125 0 0 0-4.125-4.125zM25.707 9.898v46.75a4.125 4.125 0 1 1-8.25 0V9.898a4.123 4.123 0 0 1 4.125-4.125 4.123 4.123 0 0 1 4.125 4.125z"
    ></path>
  </svg>
));
PauseIcon.displayName = "PauseIcon";

const PlayIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon-class"
    fill="currentColor"
    viewBox="0 0 67 67"
  >
    <path d="M20.28 9.65c-2.205-1.268-4.026-.228-4.026 2.307v43.805c0 2.535 1.82 3.574 4.027 2.307l38.471-21.903a2.556 2.556 0 0 0 1.094-.935 2.514 2.514 0 0 0 0-2.743 2.556 2.556 0 0 0-1.093-.936L20.28 9.65z"></path>
  </svg>
));
PlayIcon.displayName = "PlayIcon";

interface ControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}

const ControlButtonComponent: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  className,
}) => (
  <button
    onClick={onClick}
    className={`flex justify-center items-center h-full cursor-pointer ${className}`}
  >
    {icon}
  </button>
);

const ControlButton = memo(ControlButtonComponent);
ControlButton.displayName = "ControlButton";

const MiddleControls: React.FC = () => {
  const { videoRef, adVideoRef, isPlaying, setIsPlaying, isAdPlaying } =
    useVideoStore(
      useShallow((state) => ({
        videoRef: state.videoRef,
        adVideoRef: state.adVideoRef,
        isPlaying: state.isPlaying,
        setIsPlaying: state.setIsPlaying,
        isAdPlaying: state.isAdPlaying,
      }))
    );
  const { setIsBuffering } = useVideoStore(
    useShallow((state) => ({
      setIsBuffering: state.setIsBuffering,
    }))
  );
  const [isBuffering, setIsBufferingLocal] = useState(false);

  const videoElement = isAdPlaying ? adVideoRef : videoRef;

  const resetControlsVisibility = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new Event(CONTROL_INTERACTION_EVENT));
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement
        .play()
        .then(() => {
          setIsPlaying(true);
          resetControlsVisibility();
        })
        .catch(() => undefined);
    } else {
      videoElement.pause();
      setIsPlaying(false);
      resetControlsVisibility();
    }
  }, [videoElement, setIsPlaying, resetControlsVisibility]);

  const handleBackward = useCallback(() => {
    if (!videoElement) return;
    videoElement.currentTime = Math.max(
      0,
      videoElement.currentTime - SKIP_INTERVAL_SECONDS
    );
    resetControlsVisibility();
  }, [videoElement, resetControlsVisibility]);

  const handleForward = useCallback(() => {
    if (!videoElement) return;
    videoElement.currentTime = Math.min(
      videoElement.duration,
      videoElement.currentTime + SKIP_INTERVAL_SECONDS
    );
    resetControlsVisibility();
  }, [videoElement, resetControlsVisibility]);

  useEffect(() => {
    if (!videoElement) return;

    const handleWaiting = () => {
      setIsBufferingLocal(true);
      setIsBuffering(true);
    };
    const handlePlaying = () => {
      setIsBufferingLocal(false);
      setIsBuffering(false);
    };
    const handleCanPlay = () => {
      setIsBufferingLocal(false);
      setIsBuffering(false);
    };
    const handleStalled = () => {
      setIsBufferingLocal(true);
      setIsBuffering(true);
    };

    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("stalled", handleStalled);

    return () => {
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("stalled", handleStalled);
    };
  }, [videoElement, isAdPlaying, setIsBuffering]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoElement || isAdPlaying) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePlayPause();
          resetControlsVisibility();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleForward();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    videoElement,
    handlePlayPause,
    handleBackward,
    handleForward,
    isAdPlaying,
  ]);

  if (isAdPlaying) {
    return (
      <div className="flex justify-center items-center">
        <ControlButton
          onClick={handlePlayPause}
          className="w-[10vw]"
          icon={
            isBuffering ? (
              <div className="relative">
                <Loader className="w-14 h-14 lg:w-18 lg:h-18 animate-spin text-white" />
              </div>
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <ControlButton
        onClick={handleBackward}
        className="w-[15vw]"
        icon={<BackwardIcon />}
      />

      <ControlButton
        onClick={handlePlayPause}
        className="w-[10vw]"
        icon={
          isBuffering ? (
            <Loader className="w-14 h-14 lg:w-18 lg:h-18 animate-spin text-white" />
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )
        }
      />

      <ControlButton
        onClick={handleForward}
        className="w-[15vw]"
        icon={<ForwardIcon />}
      />
    </div>
  );
};

export default MiddleControls;
