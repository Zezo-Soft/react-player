import { useEffect, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";
import { useShallow } from "zustand/react/shallow";

export const useVideoEvents = () => {
  const { setCurrentTime, setDuration, setBufferedProgress, setIsPlaying } =
    useVideoStore(
      useShallow((state) => ({
        setCurrentTime: state.setCurrentTime,
        setDuration: state.setDuration,
        setBufferedProgress: state.setBufferedProgress,
        setIsPlaying: state.setIsPlaying,
      }))
    );
  // Cache the most recent values so we can short-circuit duplicate store writes that were causing needless renders.
  const lastTimeUpdateRef = useRef(0);
  const lastBufferedProgressRef = useRef(0);
  const pendingTimeRef = useRef<number | null>(null);
  const pendingBufferedRef = useRef<number | null>(null);
  const timeUpdateRafRef = useRef<number | null>(null);
  const bufferedRafRef = useRef<number | null>(null);
  const stopMediaElement = (media?: HTMLMediaElement | null) => {
    if (!media) return;
    try {
      media.pause();
    } catch (_error) {
      // Ignored: the element might already be paused or unavailable.
    }
    try {
      media.currentTime = 0;
    } catch (_error) {
      // Some streams throw while seeking when metadata is missing; safe to ignore.
    }
    media.removeAttribute("src");
    media.load();
  };

  const flushPendingTimeUpdate = (time: number) => {
    if (timeUpdateRafRef.current !== null) {
      cancelAnimationFrame(timeUpdateRafRef.current);
      timeUpdateRafRef.current = null;
    }
    pendingTimeRef.current = null;
    lastTimeUpdateRef.current = time;
    setCurrentTime(time);
  };

  const scheduleTimeUpdate = (time: number) => {
    pendingTimeRef.current = time;
    if (timeUpdateRafRef.current !== null) {
      return;
    }

    // Coalesce multiple rapid events into a single rAF-aligned update to reduce layout thrash.
    timeUpdateRafRef.current = requestAnimationFrame(() => {
      timeUpdateRafRef.current = null;
      const nextTime = pendingTimeRef.current;
      if (typeof nextTime === "number") {
        pendingTimeRef.current = null;
        lastTimeUpdateRef.current = nextTime;
        setCurrentTime(nextTime);
      }
    });
  };

  const scheduleBufferedUpdate = (bufferedProgress: number) => {
    pendingBufferedRef.current = bufferedProgress;
    if (bufferedRafRef.current !== null) {
      return;
    }

    bufferedRafRef.current = requestAnimationFrame(() => {
      bufferedRafRef.current = null;
      const nextBuffered = pendingBufferedRef.current;
      if (typeof nextBuffered === "number") {
        pendingBufferedRef.current = null;
        lastBufferedProgressRef.current = nextBuffered;
        setBufferedProgress(nextBuffered);
      }
    });
  };

  const onRightClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  const onSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = e?.currentTarget?.currentTime;
    if (typeof time === "number" && !Number.isNaN(time)) {
      flushPendingTimeUpdate(time);
    }
  };

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = e?.currentTarget?.currentTime;
    if (typeof time === "number" && !Number.isNaN(time)) {
      if (Math.abs(time - lastTimeUpdateRef.current) >= 0.1 || time === 0) {
        // Reduce the frequency of global state updates and batch them on the next animation frame for smoother playback.
        scheduleTimeUpdate(time);
      }
    }
  };

  const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e?.currentTarget?.duration;
    if (typeof duration === "number" && !Number.isNaN(duration)) {
      setDuration(duration);
    }
  };

  const onProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (
      video.buffered.length > 0 &&
      video.duration > 0 &&
      !isNaN(video.duration)
    ) {
      let bufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        if (
          video.currentTime >= video.buffered.start(i) &&
          video.currentTime <= video.buffered.end(i)
        ) {
          bufferedEnd = video.buffered.end(i);
          break;
        }
      }

      if (bufferedEnd === 0 && video.buffered.length > 0) {
        bufferedEnd = video.buffered.end(video.buffered.length - 1);
      }

      const bufferedProgress = Math.min(
        (bufferedEnd / video.duration) * 100,
        100
      );
      if (Math.abs(bufferedProgress - lastBufferedProgressRef.current) >= 1) {
        // Skip tiny buffer deltas and dispatch the update on the next animation frame to avoid blocking the UI thread.
        scheduleBufferedUpdate(bufferedProgress);
      }
    }
  };

  const onPlay = () => {
    const state = useVideoStore.getState();
    if (state.adVideoRef) {
      // Defensive guard: ensure any ad media tears down before the primary stream resumes so stray audio cannot continue.
      stopMediaElement(state.adVideoRef);
      state.setAdVideoRef(null);
    }
    if (state.isAdPlaying || state.currentAd) {
      state.setIsAdPlaying(false);
      state.setCurrentAd(null);
      state.setAdType(null);
      state.setAdCurrentTime(0);
      state.setCanSkipAd(false);
      state.setSkipCountdown(0);
    }
    if (!state.isPlaying) {
      setIsPlaying(true);
    }
  };

  const onPause = () => {
    const state = useVideoStore.getState();
    if (state.isPlaying) {
      setIsPlaying(false);
    }
  };

  const onEnded = (e: unknown) => {
    const state = useVideoStore.getState();
    if (state.isPlaying) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    // Cancel any pending animation frame callbacks when the hook unmounts or dependencies change.
    return () => {
      if (timeUpdateRafRef.current !== null) {
        cancelAnimationFrame(timeUpdateRafRef.current);
        timeUpdateRafRef.current = null;
      }
      if (bufferedRafRef.current !== null) {
        cancelAnimationFrame(bufferedRafRef.current);
        bufferedRafRef.current = null;
      }
    };
  }, []);

  return {
    onRightClick,
    onSeeked,
    onTimeUpdate,
    onLoadedMetadata,
    onProgress,
    onPlay,
    onPause,
    onEnded,
  };
};
