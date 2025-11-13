import { useEffect, useMemo, useRef } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../../store/VideoState";
import { StreamType } from "../../store/types/StoreTypes";
import { getExtensionFromUrl } from "../utils";

type QualityLevel = {
  height: number;
  bitrate?: number;
  originalIndex: number;
  id?: string;
};

type HlsEngineParams = {
  enabled: boolean;
  source: string;
  videoElement: HTMLVideoElement | null;
  setHlsInstance: (instance: Hls | null) => void;
  setQualityLevels: (levels: QualityLevel[]) => void;
  setCurrentQuality: (quality: string) => void;
};

type DashEngineParams = {
  enabled: boolean;
  source: string;
  videoElement: HTMLVideoElement | null;
  setDashInstance: (instance: dashjs.MediaPlayerClass | null) => void;
  setQualityLevels: (levels: QualityLevel[]) => void;
  setCurrentQuality: (quality: string) => void;
};

const HLS_CONFIG: any = {
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  liveSyncDurationCount: 3,
  maxBufferSize: 80 * 1_000_000,
  maxBufferLength: 30,
  manifestLoadingMaxRetry: 4,
  manifestLoadingRetryDelay: 1000,
  levelLoadingMaxRetry: 4,
  levelLoadingRetryDelay: 1000,
  fragLoadingMaxRetry: 6,
  fragLoadingRetryDelay: 750,
  startLevel: -1,
  startPosition: -1,
  capLevelToPlayerSize: true,
};

const DASH_SETTINGS: any = {
  streaming: {
    abr: {
      autoSwitchBitrate: {
        video: true,
        audio: true,
      },
      limitBitrateByPortal: true,
      ABRStrategy: "abrThroughput",
      bandwidthSafetyFactor: 0.9,
    },
    buffer: {
      fastSwitchEnabled: true,
      bufferTimeAtTopQuality: 28,
      bufferTimeAtTopQualityLongForm: 55,
    },
    lowLatencyEnabled: false,
  },
  debug: {
    logLevel: dashjs.Debug.LOG_LEVEL_NONE,
  },
};

const MAX_HLS_NETWORK_RETRIES = 4;
const MAX_DASH_RESTARTS = 3;

const sanitizeUrl = (url: string) => {
  if (!url) return "";
  return url.split("#")[0]?.split("?")[0] ?? url;
};

const resolveStreamType = (
  explicitType: "hls" | "dash" | "mp4" | "other" | "youtube" | undefined,
  source: string
): StreamType => {
  if (
    explicitType === "hls" ||
    explicitType === "dash" ||
    explicitType === "mp4"
  ) {
    return explicitType;
  }
  if (explicitType === "youtube" || explicitType === "other") {
    return "other";
  }

  const sanitized = sanitizeUrl(source).toLowerCase();
  const extension = getExtensionFromUrl(sanitized);

  if (extension === "hls") return "hls";
  if (extension === "dash") return "dash";
  if (extension === "mp4") return "mp4";

  if (sanitized.includes(".m3u8")) return "hls";
  if (sanitized.includes(".mpd")) return "dash";
  if (sanitized.includes(".mp4")) return "mp4";

  return "other";
};

const useHlsEngine = ({
  enabled,
  source,
  videoElement,
  setHlsInstance,
  setQualityLevels,
  setCurrentQuality,
}: HlsEngineParams) => {
  const networkRetryRef = useRef(0);
  const retryTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !videoElement) {
      return;
    }

    networkRetryRef.current = 0;
    setQualityLevels([]);
    setCurrentQuality("auto");

    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = undefined;
      }
    };

    const attachNative = () => {
      setHlsInstance(null);
      videoElement.src = source;
      videoElement.load();

      const handleLoadedMetadata = () => {
        try {
          const mediaTracks = (videoElement as any)?.videoTracks;
          if (mediaTracks && mediaTracks.length > 0) {
            const levels: QualityLevel[] = Array.from(mediaTracks).map(
              (track: any, index: number) => ({
                height: track.height ?? 0,
                bitrate: track.bandwidth ?? 0,
                originalIndex: index,
              })
            );
            setQualityLevels(levels);
          }
        } catch (_error) {
          setQualityLevels([]);
        }
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    };

    if (
      !Hls.isSupported() &&
      videoElement.canPlayType("application/vnd.apple.mpegurl")
    ) {
      return attachNative();
    }

    if (!Hls.isSupported()) {
      setHlsInstance(null);
      videoElement.src = source;
      videoElement.load();
      return;
    }

    const hls = new Hls(HLS_CONFIG);
    setHlsInstance(hls);

    const updateQualityLevels = () => {
      const levels = hls.levels ?? [];
      const parsedLevels: QualityLevel[] = levels.map((level, index) => ({
        height: level.height ?? 0,
        bitrate: level.bitrate ?? 0,
        originalIndex: index,
      }));
      setQualityLevels(parsedLevels);
    };

    const handleManifestParsed = () => {
      networkRetryRef.current = 0;
      updateQualityLevels();
      const { activeQuality } = useVideoStore.getState();
      if (activeQuality && activeQuality.startsWith("hls-")) {
        const levelIndex = parseInt(activeQuality.replace("hls-", ""), 10);
        if (!Number.isNaN(levelIndex) && levelIndex >= 0) {
          hls.loadLevel = levelIndex;
          hls.nextLevel = levelIndex;
          hls.currentLevel = levelIndex;
          setCurrentQuality(activeQuality);
          return;
        }
      }
      setCurrentQuality("auto");
      hls.currentLevel = -1;
      hls.loadLevel = -1;
      hls.nextLevel = -1;
    };

    const handleLevelsUpdated = () => {
      updateQualityLevels();
    };

    const handleLevelSwitched = (_event: string, data: { level: number }) => {
      if (typeof data?.level === "number" && data.level >= 0) {
        setCurrentQuality(`hls-${data.level}`);
      }
    };

    const scheduleRestart = () => {
      if (networkRetryRef.current >= MAX_HLS_NETWORK_RETRIES) {
        return;
      }
      const delay = Math.min(2000 * (networkRetryRef.current + 1), 10_000);
      clearRetryTimer();
      retryTimerRef.current = window.setTimeout(() => {
        try {
          hls.startLoad();
        } catch (_err) {
          // Ignore
        }
      }, delay);
      networkRetryRef.current += 1;
    };

    const handleError = (_event: string, data: any) => {
      if (!data) return;
      const HLS_ERROR_TYPES = (Hls as any).ErrorTypes ?? {};
      if (data.fatal) {
        switch (data.type) {
          case HLS_ERROR_TYPES.NETWORK_ERROR ?? "networkError":
            scheduleRestart();
            break;
          case HLS_ERROR_TYPES.MEDIA_ERROR ?? "mediaError":
            try {
              hls.recoverMediaError();
            } catch (_err) {
              scheduleRestart();
            }
            break;
          default:
            clearRetryTimer();
            hls.destroy();
            setHlsInstance(null);
            break;
        }
      } else if (
        data.type === (HLS_ERROR_TYPES.NETWORK_ERROR ?? "networkError")
      ) {
        scheduleRestart();
      }
    };

    hls.attachMedia(videoElement);
    hls.loadSource(source);

    const HLS_EVENTS = (Hls as any).Events ?? {};

    hls.on(
      HLS_EVENTS.MANIFEST_PARSED ?? "manifestParsed",
      handleManifestParsed
    );
    hls.on(HLS_EVENTS.LEVELS_UPDATED ?? "levelsUpdated", handleLevelsUpdated);
    hls.on(HLS_EVENTS.LEVEL_SWITCHED ?? "levelSwitched", handleLevelSwitched);
    hls.on(HLS_EVENTS.ERROR ?? "error", handleError);

    return () => {
      clearRetryTimer();
      hls.off(
        HLS_EVENTS.MANIFEST_PARSED ?? "manifestParsed",
        handleManifestParsed
      );
      hls.off(
        HLS_EVENTS.LEVELS_UPDATED ?? "levelsUpdated",
        handleLevelsUpdated
      );
      hls.off(
        HLS_EVENTS.LEVEL_SWITCHED ?? "levelSwitched",
        handleLevelSwitched
      );
      hls.off(HLS_EVENTS.ERROR ?? "error", handleError);
      hls.destroy();
      setHlsInstance(null);
      setQualityLevels([]);
      setCurrentQuality("auto");
    };
  }, [
    enabled,
    source,
    videoElement,
    setHlsInstance,
    setQualityLevels,
    setCurrentQuality,
  ]);
};

const useDashEngine = ({
  enabled,
  source,
  videoElement,
  setDashInstance,
  setQualityLevels,
  setCurrentQuality,
}: DashEngineParams) => {
  const restartCountRef = useRef(0);
  const restartTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !videoElement) {
      return;
    }

    if (!dashjs.supportsMediaSource()) {
      setDashInstance(null);
      setQualityLevels([]);
      videoElement.src = source;
      videoElement.load();
      return;
    }

    restartCountRef.current = 0;
    setQualityLevels([]);
    setCurrentQuality("auto");

    const player = dashjs.MediaPlayer().create();
    setDashInstance(player);
    const dashPlayer = player as any;

    const clearRestartTimer = () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = undefined;
      }
    };

    const applySettings = () => {
      player.updateSettings(DASH_SETTINGS);
    };

    const updateQualityLevels = () => {
      try {
        const levels = dashPlayer.getBitrateInfoListFor?.("video") ?? [];
        const mapped: QualityLevel[] = Array.from(levels).map((info: any) => ({
          height: info.height ?? 0,
          bitrate: info.bitrate,
          originalIndex: info.qualityIndex ?? info.index ?? 0,
          id: info.id,
        }));
        setQualityLevels(mapped);
      } catch (_error) {
        setQualityLevels([]);
      }
    };

    const handleStreamInitialized = () => {
      restartCountRef.current = 0;
      updateQualityLevels();
      const { activeQuality } = useVideoStore.getState();
      if (activeQuality && activeQuality.startsWith("dash-")) {
        const levelIndex = parseInt(activeQuality.replace("dash-", ""), 10);
        if (!Number.isNaN(levelIndex) && levelIndex >= 0) {
          dashPlayer.setAutoSwitchQualityFor?.("video", false);
          dashPlayer.setQualityFor?.("video", levelIndex);
          setCurrentQuality(activeQuality);
          return;
        }
      }
      dashPlayer.setAutoSwitchQualityFor?.("video", true);
      const current = dashPlayer.getQualityFor?.("video");
      if (typeof current === "number" && current >= 0) {
        setCurrentQuality(`dash-${current}`);
      } else {
        setCurrentQuality("auto");
      }
    };

    const handleManifestLoaded = () => {
      updateQualityLevels();
    };

    const handleQualityRendered = (
      event: dashjs.QualityChangeRenderedEvent
    ) => {
      if (event?.mediaType === "video") {
        const current = dashPlayer.getQualityFor?.("video");
        if (typeof current === "number" && current >= 0) {
          setCurrentQuality(`dash-${current}`);
        }
      }
    };

    const bindEvents = () => {
      player.on(
        dashjs.MediaPlayer.events.STREAM_INITIALIZED,
        handleStreamInitialized
      );
      player.on(
        dashjs.MediaPlayer.events.MANIFEST_LOADED,
        handleManifestLoaded
      );
      player.on(
        dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
        handleQualityRendered
      );
      player.on(dashjs.MediaPlayer.events.ERROR, handleError);
    };

    const detachEvents = () => {
      player.off(
        dashjs.MediaPlayer.events.STREAM_INITIALIZED,
        handleStreamInitialized
      );
      player.off(
        dashjs.MediaPlayer.events.MANIFEST_LOADED,
        handleManifestLoaded
      );
      player.off(
        dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
        handleQualityRendered
      );
      player.off(dashjs.MediaPlayer.events.ERROR, handleError);
    };

    const restartPlayer = () => {
      if (restartCountRef.current >= MAX_DASH_RESTARTS) {
        return;
      }
      restartCountRef.current += 1;
      clearRestartTimer();
      const delay = Math.min(1500 * restartCountRef.current, 6000);
      restartTimerRef.current = window.setTimeout(() => {
        detachEvents();
        player.reset();
        setQualityLevels([]);
        applySettings();
        bindEvents();
        player.initialize(videoElement, source, videoElement.autoplay ?? false);
      }, delay);
    };

    const handleError = (event: any) => {
      if (!event) return;
      const errorToken =
        typeof event?.error === "string"
          ? event.error
          : typeof event?.event === "object" && event.event
          ? (event.event as { id?: string }).id
          : undefined;

      const normalized = errorToken?.toString().toLowerCase();
      const shouldRecover =
        normalized &&
        (normalized.includes("download") ||
          normalized.includes("manifest") ||
          normalized.includes("mediasource") ||
          normalized.includes("capability") ||
          normalized.includes("fragment"));

      if (shouldRecover) {
        restartPlayer();
      }
    };

    applySettings();
    bindEvents();
    player.initialize(videoElement, source, videoElement.autoplay ?? false);

    return () => {
      clearRestartTimer();
      detachEvents();
      player.reset();
      setDashInstance(null);
      setQualityLevels([]);
      setCurrentQuality("auto");
    };
  }, [
    enabled,
    source,
    videoElement,
    setDashInstance,
    setQualityLevels,
    setCurrentQuality,
  ]);
};

export const useVideoSource = (
  trackSrc: string,
  type?: "hls" | "dash" | "mp4" | "other" | "youtube" | undefined
) => {
  const {
    videoRef,
    setQualityLevels,
    setHlsInstance,
    setDashInstance,
    setStreamType,
    setActiveQuality,
    setCurrentQuality,
  } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      setQualityLevels: state.setQualityLevels,
      setHlsInstance: state.setHlsInstance,
      setDashInstance: state.setDashInstance,
      setStreamType: state.setStreamType,
      setActiveQuality: state.setActiveQuality,
      setCurrentQuality: state.setCurrentQuality,
    }))
  );

  const streamType = useMemo<StreamType>(
    () => resolveStreamType(type, trackSrc),
    [type, trackSrc]
  );

  useEffect(() => {
    if (!trackSrc) return;
    setStreamType(streamType);
    setActiveQuality("auto");
    setCurrentQuality("auto");
    setQualityLevels([]);
  }, [
    trackSrc,
    streamType,
    setStreamType,
    setActiveQuality,
    setCurrentQuality,
    setQualityLevels,
  ]);

  useEffect(() => {
    if (streamType !== "dash") {
      setDashInstance(null);
    }
    if (streamType !== "hls") {
      setHlsInstance(null);
    }
  }, [streamType, setDashInstance, setHlsInstance]);

  useEffect(() => {
    if (!videoRef) return;
    if (streamType === "mp4" || streamType === "other") {
      videoRef.src = trackSrc;
      videoRef.load();
    } else {
      // Adaptive engines will attach their own source; ensure no stale src lingers
      videoRef.removeAttribute("src");
    }
  }, [videoRef, trackSrc, streamType]);

  useHlsEngine({
    enabled: streamType === "hls",
    source: trackSrc,
    videoElement: videoRef,
    setHlsInstance,
    setQualityLevels,
    setCurrentQuality,
  });

  useDashEngine({
    enabled: streamType === "dash",
    source: trackSrc,
    videoElement: videoRef,
    setDashInstance,
    setQualityLevels,
    setCurrentQuality,
  });

  useEffect(() => {
    if (!videoRef) return;

    return () => {
      videoRef.pause();
      videoRef.removeAttribute("src");
      videoRef.load();
      const { setIsPlaying, setBufferedProgress } = useVideoStore.getState();
      setIsPlaying(false);
      setBufferedProgress(0);
    };
  }, [videoRef, trackSrc]);
};
