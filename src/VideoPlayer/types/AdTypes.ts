export type AdType = "pre-roll" | "mid-roll" | "post-roll" | "overlay";

export interface AdBreak {
  id: string;
  type: AdType;
  time: number; // For mid-roll ads, time in seconds when ad should play
  adUrl: string; // URL of the ad video
  skipable?: boolean; // Can user skip the ad
  skipAfter?: number; // Seconds after which skip is allowed (default: 0)
  duration?: number; // Optional ad duration (derived from metadata if omitted)
  sponsoredUrl?: string; // Optional sponsored badge URL
  title?: string; // Optional ad title for better UX
  description?: string; // Optional ad description
  relevance?: "high" | "medium" | "low"; // Ad relevance level
}

export interface AdConfig {
  preRoll?: AdBreak;
  midRoll?: AdBreak[];
  postRoll?: AdBreak;
  overlay?: {
    imageUrl: string;
    clickUrl?: string;
    showDuration: number; // seconds
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
  // Smart placement options
  smartPlacement?: {
    enabled: boolean;
    minVideoDuration?: number; // Minimum video duration to show mid-roll ads (default: 60s)
    minGapBetweenAds?: number; // Minimum gap between mid-roll ads in seconds (default: 30s)
    avoidNearEnd?: number; // Don't show ads within X seconds of video end (default: 10s)
    preferNaturalBreaks?: boolean; // Prefer placing ads at natural break points
  };
  onAdStart?: (adBreak: AdBreak) => void;
  onAdEnd?: (adBreak: AdBreak) => void;
  onAdSkip?: (adBreak: AdBreak) => void;
  onAdError?: (adBreak: AdBreak, error: Error) => void;
}
