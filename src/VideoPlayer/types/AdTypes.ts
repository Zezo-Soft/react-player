export type AdType = "pre-roll" | "mid-roll" | "post-roll" | "overlay";

export interface AdBreak {
  id: string;
  type: AdType;
  time: number;
  adUrl: string;
  skipable?: boolean;
  skipAfter?: number;
  duration?: number;
  sponsoredUrl?: string;
  title?: string;
  description?: string;
  relevance?: "high" | "medium" | "low";
}

export interface AdConfig {
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
