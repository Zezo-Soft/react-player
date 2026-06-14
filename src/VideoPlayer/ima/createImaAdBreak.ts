import { AdBreak, AdType } from "../types/AdTypes";

/**
 * Synthetic ad break used for IMA callbacks and UI state (no direct MP4 URL).
 */
export const createImaAdBreak = (type: AdType, id?: string): AdBreak => ({
  id: id ?? `ima-${type}-${Date.now()}`,
  type,
  time: 0,
  adUrl: "",
  provider: "ima",
  skipable: true,
});
