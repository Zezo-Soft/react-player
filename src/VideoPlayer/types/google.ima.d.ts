/**
 * Minimal typings for the Google IMA HTML5 SDK (loaded via script tag).
 * @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side
 */
declare namespace google.ima {
  class AdDisplayContainer {
    constructor(
      adContainer: HTMLElement,
      videoElement?: HTMLVideoElement,
      clickTrackingElement?: HTMLElement
    );
    initialize(): void;
    destroy(): void;
  }

  class AdsLoader {
    constructor(adDisplayContainer: AdDisplayContainer);
    addEventListener(
      type: string,
      listener: (event: unknown) => void,
      useCapture?: boolean
    ): void;
    removeEventListener(
      type: string,
      listener: (event: unknown) => void,
      useCapture?: boolean
    ): void;
    requestAds(adsRequest: AdsRequest, opt_userContext?: unknown): void;
    contentComplete(): void;
    destroy(): void;
  }

  class AdsRequest {
    adTagUrl: string;
    adsResponse?: string;
    linearAdSlotWidth?: number;
    linearAdSlotHeight?: number;
    nonLinearAdSlotWidth?: number;
    nonLinearAdSlotHeight?: number;
    liveStreamPrefetchSeconds?: number;
    forceNonLinearFullSlot?: boolean;
    contentDuration?: number;
    contentTitle?: string;
  }

  class AdsRenderingSettings {
    restoreCustomPlaybackStateOnAdBreakComplete?: boolean;
    enablePreloading?: boolean;
    loadVideoTimeout?: number;
    /** Set false when using a custom skip button + AdsManager.skip(). */
    useStyledLinearAds?: boolean;
    uiElements?: string[];
  }

  class AdsManager {
    init(
      width: number,
      height: number,
      viewMode: ViewMode,
      videoElement?: HTMLVideoElement
    ): void;
    start(): void;
    destroy(): void;
    pause(): void;
    resume(): void;
    skip(): void;
    stop(): void;
    focus(): void;
    resize(width: number, height: number, viewMode: ViewMode): void;
    setVolume(volume: number): void;
    getVolume(): number;
    getRemainingTime(): number;
    getAdSkippableState(): boolean;
    addEventListener(
      type: string,
      listener: (event: AdEvent) => void,
      useCapture?: boolean
    ): void;
    removeEventListener(
      type: string,
      listener: (event: AdEvent) => void,
      useCapture?: boolean
    ): void;
  }

  interface Ad {
    isLinear(): boolean;
    getDuration(): number;
    /** Seconds from ad start when skip is allowed; -1 if not skippable. */
    getSkipTimeOffset(): number;
  }

  class AdEvent {
    type: string;
    getAd(): Ad;
    getAdData(): { adPodInfo?: { totalAds?: number } };
  }

  class AdsManagerLoadedEvent {
    static Type: { ADS_MANAGER_LOADED: string };
    getAdsManager(
      contentVideo: HTMLVideoElement,
      adsRenderingSettings?: AdsRenderingSettings
    ): AdsManager;
  }

  class AdErrorEvent {
    static Type: { AD_ERROR: string };
    getError(): AdError;
  }

  interface AdError {
    getErrorCode(): number;
    getMessage(): string;
    getType(): string;
  }

  namespace AdEvent {
    class Type {
      static AD_BREAK_READY: string;
      static AD_METADATA: string;
      static ALL_ADS_COMPLETED: string;
      static CLICK: string;
      static COMPLETE: string;
      static CONTENT_PAUSE_REQUESTED: string;
      static CONTENT_RESUME_REQUESTED: string;
      static DURATION_CHANGE: string;
      static FIRST_QUARTILE: string;
      static IMPRESSION: string;
      static LOADED: string;
      static MIDPOINT: string;
      static PAUSED: string;
      static RESUMED: string;
      static SKIPPED: string;
      static STARTED: string;
      static THIRD_QUARTILE: string;
      static USER_CLOSE: string;
      static AD_PROGRESS: string;
      static SKIPPABLE_STATE_CHANGED: string;
    }
  }

  namespace AdErrorEvent {
    class Type {
      static AD_ERROR: string;
    }
  }

  namespace AdsManagerLoadedEvent {
    class Type {
      static ADS_MANAGER_LOADED: string;
    }
  }

  enum ViewMode {
    NORMAL = "normal",
    FULLSCREEN = "fullscreen",
  }

  namespace UiElements {
    const AD_ATTRIBUTION: string;
    const COUNTDOWN: string;
  }
}
