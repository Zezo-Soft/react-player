import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useVideoStore } from "../../store/VideoState";
import { createImaRenderingSettings } from "../ima/createImaRenderingSettings";
import { IMA_SDK_URL, loadImaSdk } from "../ima/loadImaSdk";
import { createImaAdBreak } from "../ima/createImaAdBreak";
import { syncImaAdUi } from "../ima/syncImaAdUi";
import { watchImaUi, getImaUiRoots } from "../ima/suppressImaUi";
import {
  triggerImaSkip,
  findNativeSkip,
  activateNativeSkip,
} from "../ima/triggerImaSkip";
import { buildAdTagUrl } from "../ima/buildAdTagUrl";
import { getImaSlotDimensions } from "../ima/getImaSlotDimensions";
import { isVmapAdTag } from "../ima/isVmapAdTag";
import { AdConfig, AdType, ImaPlaybackApi } from "../types/AdTypes";

const IMA_PREROLL_TIMEOUT_MS = 20_000;

export const useImaAds = (adConfig?: AdConfig) => {
  const imaConfig = adConfig?.ima;
  const adTagUrl = imaConfig?.adTagUrl?.trim();

  const {
    videoRef,
    imaAdContainerRef,
    setIsAdPlaying,
    setAdProvider,
    setCurrentAd,
    setAdType,
    setAdCurrentTime,
    setCanSkipAd,
    setSkipCountdown,
    setPlaying,
    setIsPlaying,
    setMuted,
    setImaPlayback,
    setImaDestroy,
    setImaSkipEnabled,
    setImaPreRollGateComplete,
    addPlayedAdBreak,
  } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      imaAdContainerRef: state.imaAdContainerRef,
      setIsAdPlaying: state.setIsAdPlaying,
      setAdProvider: state.setAdProvider,
      setCurrentAd: state.setCurrentAd,
      setAdType: state.setAdType,
      setAdCurrentTime: state.setAdCurrentTime,
      setCanSkipAd: state.setCanSkipAd,
      setSkipCountdown: state.setSkipCountdown,
      setPlaying: state.setPlaying,
      setIsPlaying: state.setIsPlaying,
      setMuted: state.setMuted,
      setImaPlayback: state.setImaPlayback,
      setImaDestroy: state.setImaDestroy,
      setImaSkipEnabled: state.setImaSkipEnabled,
      setImaPreRollGateComplete: state.setImaPreRollGateComplete,
      addPlayedAdBreak: state.addPlayedAdBreak,
    }))
  );

  const adsLoaderRef = useRef<google.ima.AdsLoader | null>(null);
  const adsManagerRef = useRef<google.ima.AdsManager | null>(null);
  const adDisplayContainerRef = useRef<google.ima.AdDisplayContainer | null>(
    null
  );
  const initializedRef = useRef(false);
  const preRollRequestedRef = useRef(false);
  const preRollCompletedRef = useRef(false);
  const contentCompleteSentRef = useRef(false);
  const contentHasStartedRef = useRef(false);
  const vmapSessionRef = useRef(false);
  const adBreakActiveRef = useRef(false);
  const playedCuePointsRef = useRef<Set<number>>(new Set());
  const currentBreakTypeRef = useRef<AdType>("pre-roll");
  const currentAdBreakRef = useRef(createImaAdBreak("pre-roll"));
  const resumeContentAfterAdRef = useRef(true);
  const adDurationRef = useRef(0);
  const currentImaAdRef = useRef<google.ima.Ad | null>(null);
  const preRollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imaUiCleanupRef = useRef<(() => void) | null>(null);
  const nativeSkipRef = useRef<HTMLElement | null>(null);

  const clearImaUiWatcher = useCallback(() => {
    imaUiCleanupRef.current?.();
    imaUiCleanupRef.current = null;
  }, []);

  const startImaUiWatcher = useCallback(() => {
    clearImaUiWatcher();
    const roots = getImaUiRoots(
      useVideoStore.getState().imaAdContainerRef,
      useVideoStore.getState().videoWrapperRef
    );
    if (!roots.length) return;
    imaUiCleanupRef.current = watchImaUi(roots);
  }, [clearImaUiWatcher]);

  const clearPreRollTimeout = useCallback(() => {
    if (preRollTimeoutRef.current) {
      clearTimeout(preRollTimeoutRef.current);
      preRollTimeoutRef.current = null;
    }
  }, []);

  const completeImaPreRollGate = useCallback(() => {
    if (preRollCompletedRef.current) return;
    preRollCompletedRef.current = true;
    clearPreRollTimeout();
    setImaPreRollGateComplete(true);
  }, [clearPreRollTimeout, setImaPreRollGateComplete]);

  const resumeContentAfterPreRollFailure = useCallback(() => {
    const video = useVideoStore.getState().videoRef;
    if (!video) return;
    setTimeout(() => {
      if (useVideoStore.getState().isAdPlaying) return;
      video
        .play()
        .then(() => {
          setPlaying(true);
          setIsPlaying(true);
        })
        .catch(() => {
          setPlaying(false);
          setIsPlaying(false);
        });
    }, 100);
  }, [setPlaying, setIsPlaying]);

  const resetImaAdUiState = useCallback(() => {
    clearImaUiWatcher();
    setIsAdPlaying(false);
    setAdProvider(null);
    setCurrentAd(null);
    setAdType(null);
    setAdCurrentTime(0);
    setCanSkipAd(false);
    setSkipCountdown(0);
    setImaSkipEnabled(false);
    nativeSkipRef.current = null;
    currentImaAdRef.current = null;
  }, [
    setIsAdPlaying,
    setAdProvider,
    setCurrentAd,
    setAdType,
    setAdCurrentTime,
    clearImaUiWatcher,
    setCanSkipAd,
    setSkipCountdown,
    setImaSkipEnabled,
  ]);

  const syncAdUi = useCallback(() => {
    const manager = adsManagerRef.current;
    if (!manager) return;
    syncImaAdUi(manager, currentImaAdRef.current, adDurationRef.current, {
      setAdCurrentTime,
      setCanSkipAd,
      setSkipCountdown,
      setImaSkipEnabled,
    });
  }, [setAdCurrentTime, setCanSkipAd, setSkipCountdown, setImaSkipEnabled]);

  const destroyAdsManager = useCallback(() => {
    if (adsManagerRef.current) {
      try {
        adsManagerRef.current.destroy();
      } catch (_error) {
        /* ignore */
      }
      adsManagerRef.current = null;
    }
  }, []);

  const destroyIma = useCallback(() => {
    destroyAdsManager();
    if (adsLoaderRef.current) {
      try {
        adsLoaderRef.current.destroy();
      } catch (_error) {
        /* ignore */
      }
      adsLoaderRef.current = null;
    }
    if (adDisplayContainerRef.current) {
      try {
        adDisplayContainerRef.current.destroy();
      } catch (_error) {
        /* ignore */
      }
      adDisplayContainerRef.current = null;
    }
    initializedRef.current = false;
    preRollRequestedRef.current = false;
    contentCompleteSentRef.current = false;
    contentHasStartedRef.current = false;
    vmapSessionRef.current = false;
    adBreakActiveRef.current = false;
    playedCuePointsRef.current.clear();
    resetImaAdUiState();
    setImaPlayback(null);
  }, [destroyAdsManager, resetImaAdUiState, setImaPlayback]);

  const resumeContentIfNeeded = useCallback(() => {
    if (!resumeContentAfterAdRef.current) return;
    const video = useVideoStore.getState().videoRef;
    if (!video) return;

    setTimeout(() => {
      if (useVideoStore.getState().isAdPlaying) return;
      video
        .play()
        .then(() => {
          setPlaying(true);
          setIsPlaying(true);
        })
        .catch(() => {
          setPlaying(false);
          setIsPlaying(false);
        });
    }, 100);
  }, [setPlaying, setIsPlaying]);

  const inferVmapBreakType = useCallback((): AdType => {
    if (!contentHasStartedRef.current) return "pre-roll";
    if (contentCompleteSentRef.current) return "post-roll";
    return "mid-roll";
  }, []);

  const endImaBreak = useCallback(
    (
      reason: "complete" | "skip" | "error" | "close",
      options?: { finalizeSession?: boolean }
    ) => {
      const isVmap = vmapSessionRef.current;
      const finalizeSession =
        options?.finalizeSession ??
        (!isVmap || reason === "close" || reason === "error");
      const breakWasActive = adBreakActiveRef.current;

      if (!breakWasActive && !finalizeSession) {
        return;
      }

      if (breakWasActive) {
        adBreakActiveRef.current = false;
        const adBreak = currentAdBreakRef.current;

        if (reason === "skip") {
          adConfig?.onAdSkip?.(adBreak);
        } else if (reason === "error") {
          /* onAdError invoked separately */
        } else {
          adConfig?.onAdEnd?.(adBreak);
        }

        if (currentBreakTypeRef.current === "pre-roll") {
          completeImaPreRollGate();
        }

        resetImaAdUiState();
        resumeContentIfNeeded();
      }

      if (finalizeSession) {
        destroyAdsManager();
      }
    },
    [
      adConfig,
      completeImaPreRollGate,
      destroyAdsManager,
      resetImaAdUiState,
      resumeContentIfNeeded,
    ]
  );

  const cacheNativeSkip = useCallback(() => {
    if (!adsManagerRef.current?.getAdSkippableState()) return;
    const roots = getImaUiRoots(
      useVideoStore.getState().imaAdContainerRef,
      useVideoStore.getState().videoWrapperRef
    );
    for (const root of roots) {
      const btn = findNativeSkip(root);
      if (btn) {
        nativeSkipRef.current = btn;
        return;
      }
    }
  }, []);

  const performImaSkip = useCallback((): boolean => {
    const manager = adsManagerRef.current;
    if (!manager?.getAdSkippableState()) return false;

    const cached = nativeSkipRef.current;
    if (cached?.isConnected) {
      activateNativeSkip(cached);
      return true;
    }

    const roots = getImaUiRoots(
      useVideoStore.getState().imaAdContainerRef,
      useVideoStore.getState().videoWrapperRef
    );
    const result = triggerImaSkip(manager, roots);
    if (result === "failed") return false;

    if (result === "stop") {
      window.setTimeout(() => {
        if (adBreakActiveRef.current) {
          endImaBreak("skip");
        }
      }, 200);
    }

    return true;
  }, [endImaBreak]);

  const beginImaBreak = useCallback(
    (type: AdType) => {
      const video = useVideoStore.getState().videoRef;
      if (video) {
        video.pause();
        setPlaying(false);
        setIsPlaying(false);
      }

      currentBreakTypeRef.current = type;
      const adBreak = createImaAdBreak(type);
      currentAdBreakRef.current = adBreak;
      addPlayedAdBreak(adBreak.id);

      setIsAdPlaying(true);
      setAdProvider("ima");
      startImaUiWatcher();
      setCurrentAd(adBreak);
      setAdType(type);
      adBreakActiveRef.current = true;
      adConfig?.onAdStart?.(adBreak);
    },
    [
      adConfig,
      addPlayedAdBreak,
      setAdProvider,
      setAdType,
      setCurrentAd,
      setIsAdPlaying,
      setIsPlaying,
      setPlaying,
      startImaUiWatcher,
    ]
  );

  const onAdsManagerLoaded = useCallback(
    (event: google.ima.AdsManagerLoadedEvent) => {
      const video = useVideoStore.getState().videoRef;
      const container = useVideoStore.getState().imaAdContainerRef;
      if (!video || !container) return;

      destroyAdsManager();

      const manager = event.getAdsManager(
        video,
        createImaRenderingSettings()
      );
      adsManagerRef.current = manager;

      const handleAdError = (adErrorEvent: google.ima.AdEvent) => {
        const err = (adErrorEvent as unknown as google.ima.AdErrorEvent).getError?.();
        const message =
          err?.getMessage?.() ?? "Unknown IMA ad error";
        adConfig?.onAdError?.(
          currentAdBreakRef.current,
          new Error(message)
        );
        endImaBreak("error");
      };

      manager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        handleAdError as (e: google.ima.AdEvent) => void
      );

      manager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        () => {
          const type = vmapSessionRef.current
            ? inferVmapBreakType()
            : currentBreakTypeRef.current;
          currentBreakTypeRef.current = type;
          resumeContentAfterAdRef.current = type !== "post-roll";
          currentAdBreakRef.current = createImaAdBreak(type);
          beginImaBreak(type);
        }
      );

      manager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        () => {
          if (vmapSessionRef.current) {
            contentHasStartedRef.current = true;
            endImaBreak("complete", { finalizeSession: false });
          } else {
            endImaBreak("complete", { finalizeSession: true });
          }
        }
      );

      manager.addEventListener(google.ima.AdEvent.Type.STARTED, (adEvent) => {
        const ad = adEvent.getAd();
        currentImaAdRef.current = ad ?? null;
        adDurationRef.current =
          ad && Number.isFinite(ad.getDuration()) ? ad.getDuration() : 0;
        setIsPlaying(true);
        syncAdUi();
      });

      manager.addEventListener(
        google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
        () => {
          syncAdUi();
          cacheNativeSkip();
        }
      );

      manager.addEventListener(google.ima.AdEvent.Type.PAUSED, () => {
        setIsPlaying(false);
      });

      manager.addEventListener(google.ima.AdEvent.Type.RESUMED, () => {
        setIsPlaying(true);
      });

      manager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
        endImaBreak("skip");
      });

      manager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        () => {
          endImaBreak("complete", { finalizeSession: true });
        }
      );

      manager.addEventListener(google.ima.AdEvent.Type.LOADED, (adEvent) => {
        const ad = adEvent.getAd();
        currentImaAdRef.current = ad ?? null;
        if (ad && Number.isFinite(ad.getDuration())) {
          adDurationRef.current = ad.getDuration();
        }
        syncAdUi();
        if (ad && !ad.isLinear()) {
          const videoEl = useVideoStore.getState().videoRef;
          videoEl?.play().catch(() => undefined);
        }
      });

      manager.addEventListener(
        google.ima.AdEvent.Type.AD_PROGRESS,
        syncAdUi
      );

      if (!initializedRef.current && adDisplayContainerRef.current) {
        try {
          adDisplayContainerRef.current.initialize();
          initializedRef.current = true;
        } catch (_error) {
          /* continue; start may still work on desktop */
        }
      }

      const { width, height } = getImaSlotDimensions(
        video,
        useVideoStore.getState().videoWrapperRef
      );

      try {
        manager.init(width, height, google.ima.ViewMode.NORMAL);
        manager.start();
      } catch (error) {
        adConfig?.onAdError?.(
          currentAdBreakRef.current,
          error instanceof Error ? error : new Error(String(error))
        );
        if (currentBreakTypeRef.current === "pre-roll") {
          completeImaPreRollGate();
          resumeContentAfterPreRollFailure();
        }
        endImaBreak("error");
      }
    },
    [
      adConfig,
      beginImaBreak,
      completeImaPreRollGate,
      destroyAdsManager,
      endImaBreak,
      inferVmapBreakType,
      resumeContentAfterPreRollFailure,
      setIsPlaying,
      syncAdUi,
      cacheNativeSkip,
    ]
  );

  const onAdLoaderError = useCallback(
    (event: google.ima.AdEvent) => {
      const err = (event as unknown as google.ima.AdErrorEvent).getError?.();
      const message = err?.getMessage?.() ?? "IMA ads loader error";
      adConfig?.onAdError?.(
        currentAdBreakRef.current,
        new Error(message)
      );
      if (currentBreakTypeRef.current === "pre-roll") {
        completeImaPreRollGate();
        resumeContentAfterPreRollFailure();
      }
      endImaBreak("error");
    },
    [
      adConfig,
      completeImaPreRollGate,
      endImaBreak,
      resumeContentAfterPreRollFailure,
    ]
  );

  const ensureAdDisplayContainer = useCallback(() => {
    const video = useVideoStore.getState().videoRef;
    const container = useVideoStore.getState().imaAdContainerRef;
    if (!video || !container || adDisplayContainerRef.current) return;

    adDisplayContainerRef.current = new google.ima.AdDisplayContainer(
      container,
      video
    );
    adsLoaderRef.current = new google.ima.AdsLoader(
      adDisplayContainerRef.current
    );
    adsLoaderRef.current.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded as (event: unknown) => void,
      false
    );
    adsLoaderRef.current.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdLoaderError as (event: unknown) => void,
      false
    );
  }, [onAdLoaderError, onAdsManagerLoaded]);

  const initializeIma = useCallback(() => {
    if (initializedRef.current) return;
    ensureAdDisplayContainer();
    if (!adDisplayContainerRef.current) return;
    adDisplayContainerRef.current.initialize();
    initializedRef.current = true;
  }, [ensureAdDisplayContainer]);

  const requestImaAds = useCallback(
    (type: AdType) => {
      if (!adTagUrl || !adsLoaderRef.current) return;

      const video = useVideoStore.getState().videoRef;
      if (!video) return;

      const isVmap = isVmapAdTag(adTagUrl, imaConfig);
      vmapSessionRef.current = isVmap;

      if (!isVmap) {
        destroyAdsManager();
      }
      adDurationRef.current = 0;

      currentBreakTypeRef.current = type;
      currentAdBreakRef.current = createImaAdBreak(type);
      resumeContentAfterAdRef.current = type !== "post-roll";

      const request = new google.ima.AdsRequest();
      request.adTagUrl = buildAdTagUrl(adTagUrl);
      const { width, height } = getImaSlotDimensions(
        video,
        useVideoStore.getState().videoWrapperRef
      );
      request.linearAdSlotWidth = width;
      request.linearAdSlotHeight = height;
      request.nonLinearAdSlotWidth = width;
      request.nonLinearAdSlotHeight = Math.round(height * 0.25);

      if (imaConfig?.contentDuration != null) {
        request.contentDuration = imaConfig.contentDuration;
      }
      if (imaConfig?.contentTitle) {
        request.contentTitle = imaConfig.contentTitle;
      }

      adsLoaderRef.current.requestAds(request);
    },
    [adTagUrl, destroyAdsManager, imaConfig]
  );

  const requestPreRoll = useCallback(() => {
    if (!adTagUrl || preRollRequestedRef.current) return;
    if (imaConfig?.preRoll === false) {
      completeImaPreRollGate();
      return;
    }
    preRollRequestedRef.current = true;
    currentBreakTypeRef.current = "pre-roll";

    clearPreRollTimeout();
    preRollTimeoutRef.current = setTimeout(() => {
      const state = useVideoStore.getState();
      if (preRollCompletedRef.current) return;
      if (state.isAdPlaying) return;

      const error = new Error(
        "IMA pre-roll timed out. Tap the player to start ads, or check your ad tag and player size."
      );
      adConfig?.onAdError?.(currentAdBreakRef.current, error);
      completeImaPreRollGate();
      resumeContentAfterPreRollFailure();
    }, IMA_PREROLL_TIMEOUT_MS);

    requestImaAds("pre-roll");
  }, [
    adTagUrl,
    adConfig,
    clearPreRollTimeout,
    completeImaPreRollGate,
    imaConfig?.preRoll,
    requestImaAds,
    resumeContentAfterPreRollFailure,
  ]);

  const tryStartPreRoll = useCallback(() => {
    if (!adTagUrl || preRollRequestedRef.current) return;
    if (!useVideoStore.getState().videoRef) return;
    ensureAdDisplayContainer();
    if (!initializedRef.current) return;
    requestPreRoll();
  }, [adTagUrl, ensureAdDisplayContainer, requestPreRoll]);

  const handleUserGesture = useCallback(() => {
    initializeIma();
    tryStartPreRoll();
  }, [initializeIma, tryStartPreRoll]);

  useEffect(() => {
    if (!adTagUrl) return;

    let cancelled = false;
    const sdkUrl = imaConfig?.sdkUrl ?? IMA_SDK_URL;

    const loadSdk = async () => {
      try {
        await loadImaSdk(sdkUrl);
        if (cancelled) return;
        ensureAdDisplayContainer();
      } catch (error) {
        completeImaPreRollGate();
        adConfig?.onAdError?.(
          createImaAdBreak("pre-roll"),
          error instanceof Error ? error : new Error(String(error))
        );
        resumeContentAfterPreRollFailure();
      }
    };

    loadSdk();

    return () => {
      cancelled = true;
    };
  }, [
    adTagUrl,
    adConfig,
    completeImaPreRollGate,
    ensureAdDisplayContainer,
    imaConfig?.sdkUrl,
    resumeContentAfterPreRollFailure,
  ]);

  useEffect(() => {
    setImaDestroy(() => {
      destroyIma();
    });
    return () => {
      setImaDestroy(null);
      destroyIma();
    };
  }, [destroyIma, setImaDestroy]);

  useEffect(() => {
    if (!adTagUrl) return;

    const api: ImaPlaybackApi = {
      pause: () => adsManagerRef.current?.pause(),
      resume: () => adsManagerRef.current?.resume(),
      setVolume: (volume) => {
        adsManagerRef.current?.setVolume(volume);
        setMuted(volume === 0);
      },
      getVolume: () => adsManagerRef.current?.getVolume() ?? 1,
      skip: () => performImaSkip(),
      isSkippable: () =>
        adsManagerRef.current?.getAdSkippableState() ?? false,
      getRemainingTime: () =>
        adsManagerRef.current?.getRemainingTime() ?? 0,
      getDuration: () => adDurationRef.current,
    };

    setImaPlayback(api);
    return () => setImaPlayback(null);
  }, [adTagUrl, performImaSkip, setImaPlayback, setMuted]);

  const attemptAutoStartPreRoll = useCallback(() => {
    if (!adTagUrl || preRollCompletedRef.current) return;
    if (typeof google === "undefined" || !google.ima) return;
    if (!useVideoStore.getState().videoRef) return;
    if (!useVideoStore.getState().imaAdContainerRef) return;

    ensureAdDisplayContainer();
    initializeIma();
    tryStartPreRoll();
  }, [
    adTagUrl,
    ensureAdDisplayContainer,
    initializeIma,
    tryStartPreRoll,
  ]);

  useEffect(() => {
    if (!adTagUrl || !videoRef || !imaAdContainerRef) return;
    if (typeof google === "undefined" || !google.ima) return;

    ensureAdDisplayContainer();

    const onCanPlay = () => {
      attemptAutoStartPreRoll();
    };

    videoRef.addEventListener("canplay", onCanPlay);
    if (videoRef.readyState >= 2) {
      onCanPlay();
    }

    const rafId = requestAnimationFrame(() => {
      attemptAutoStartPreRoll();
    });

    return () => {
      cancelAnimationFrame(rafId);
      videoRef.removeEventListener("canplay", onCanPlay);
    };
  }, [
    adTagUrl,
    videoRef,
    imaAdContainerRef,
    ensureAdDisplayContainer,
    attemptAutoStartPreRoll,
  ]);

  useEffect(() => {
    if (!adTagUrl || !videoRef || !imaConfig?.midRollCuePoints?.length) {
      return;
    }
    if (isVmapAdTag(adTagUrl, imaConfig)) {
      return;
    }

    const cues = [...imaConfig.midRollCuePoints].sort((a, b) => a - b);

    const onTimeUpdate = () => {
      if (useVideoStore.getState().isAdPlaying) return;
      const t = videoRef.currentTime;
      for (const cue of cues) {
        if (playedCuePointsRef.current.has(cue)) continue;
        if (t >= cue && t <= cue + 1) {
          playedCuePointsRef.current.add(cue);
          initializeIma();
          currentBreakTypeRef.current = "mid-roll";
          requestImaAds("mid-roll");
          break;
        }
      }
    };

    videoRef.addEventListener("timeupdate", onTimeUpdate);
    return () => videoRef.removeEventListener("timeupdate", onTimeUpdate);
  }, [
    adTagUrl,
    videoRef,
    imaConfig,
    initializeIma,
    requestImaAds,
  ]);

  useEffect(() => {
    if (!adTagUrl || !videoRef || imaConfig?.postRoll === false) return;

    const onEnded = () => {
      if (contentCompleteSentRef.current) return;
      if (useVideoStore.getState().isAdPlaying) return;
      contentCompleteSentRef.current = true;
      resumeContentAfterAdRef.current = false;
      initializeIma();

      if (!adsLoaderRef.current) return;

      if (isVmapAdTag(adTagUrl, imaConfig)) {
        currentBreakTypeRef.current = "post-roll";
        currentAdBreakRef.current = createImaAdBreak("post-roll");
        adsLoaderRef.current.contentComplete();
      } else {
        requestImaAds("post-roll");
      }
    };

    videoRef.addEventListener("ended", onEnded);
    return () => videoRef.removeEventListener("ended", onEnded);
  }, [
    adTagUrl,
    videoRef,
    imaConfig,
    initializeIma,
    requestImaAds,
  ]);

  useEffect(() => {
    if (!adTagUrl) return;

    const resize = () => {
      const manager = adsManagerRef.current;
      const video = useVideoStore.getState().videoRef;
      if (!manager || !video) return;
      const { width, height } = getImaSlotDimensions(
        video,
        useVideoStore.getState().videoWrapperRef
      );
      try {
        manager.resize(width, height, google.ima.ViewMode.NORMAL);
      } catch (_error) {
        /* ignore */
      }
    };

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [adTagUrl]);

  useEffect(() => {
    if (!adTagUrl) return;

    preRollRequestedRef.current = false;
    preRollCompletedRef.current = false;
    contentCompleteSentRef.current = false;
    contentHasStartedRef.current = false;
    vmapSessionRef.current = false;
    adBreakActiveRef.current = false;
    playedCuePointsRef.current.clear();
    setImaPreRollGateComplete(false);
    clearPreRollTimeout();
  }, [
    adTagUrl,
    videoRef?.src,
    setImaPreRollGateComplete,
    clearPreRollTimeout,
  ]);

  useEffect(() => {
    return () => {
      clearPreRollTimeout();
    };
  }, [clearPreRollTimeout]);

  return {
    hasIma: Boolean(adTagUrl),
    hasImaPreRoll:
      Boolean(adTagUrl) && imaConfig?.preRoll !== false,
    initializeIma,
    startImaPreRoll: handleUserGesture,
  };
};
