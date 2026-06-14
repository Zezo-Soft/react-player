export type AdType = "pre-roll" | "mid-roll" | "post-roll" | "overlay";

/** How the ad break is rendered: direct MP4 (`custom`) or Google IMA (`ima`). */
export type AdProvider = "custom" | "ima";

export interface ImaConfig {
  /** VAST/VMAP ad tag URL from Google Ad Manager or compatible ad server. */
  adTagUrl: string;
  /**
   * Tag format. Auto-detected from URL when omitted (`output=vmap` or `ad_rule=1` → VMAP).
   * VMAP uses one IMA session for pre/mid/post breaks; VAST requests ads per break.
   */
  adTagFormat?: "vmap" | "vast";
  /**
   * Request a pre-roll from the ad tag when content is ready.
   * @default true
   */
  preRoll?: boolean;
  /**
   * Call `contentComplete()` when main content ends (enables post-roll in VMAP tags).
   * @default true
   */
  postRoll?: boolean;
  /**
   * Content time offsets (seconds) for additional mid-roll ad requests.
   * Use when your tag is not a full VMAP or you need explicit cue points.
   */
  midRollCuePoints?: number[];
  /** Optional content metadata for ad targeting. */
  contentTitle?: string;
  contentDuration?: number;
  /** Custom URL for the IMA SDK script (defaults to Google's CDN). */
  sdkUrl?: string;
}

export interface AdBreak {
  id: string;
  type: AdType;
  time: number;
  /** Direct media URL for `custom` ads; empty for synthetic IMA breaks. */
  adUrl: string;
  provider?: AdProvider;
  skipable?: boolean;
  skipAfter?: number;
  duration?: number;
  sponsoredUrl?: string;
}

export interface AdConfig {
  /** Google IMA (VAST/VMAP). Works alongside custom MP4 `preRoll` / `midRoll` / `postRoll`. */
  ima?: ImaConfig;
  preRoll?: AdBreak;
  midRoll?: AdBreak[];
  postRoll?: AdBreak;
  overlay?: {
    imageUrl: string;
    clickUrl?: string;
    showDuration: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
  smartPlacement?: {
    enabled: boolean;
    minVideoDuration?: number;
    minGapBetweenAds?: number;
    avoidNearEnd?: number;
    preferNaturalBreaks?: boolean;
  };
  onAdStart?: (adBreak: AdBreak) => void;
  onAdEnd?: (adBreak: AdBreak) => void;
  onAdSkip?: (adBreak: AdBreak) => void;
  onAdError?: (adBreak: AdBreak, error: Error) => void;
}

/** Runtime API exposed by the IMA integration for player controls. */
export interface ImaPlaybackApi {
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  /** Returns true if AdsManager.skip() was invoked. */
  skip: () => boolean;
  isSkippable: () => boolean;
  getRemainingTime: () => number;
  getDuration: () => number;
}
