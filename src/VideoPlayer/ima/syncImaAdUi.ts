import type { VideoState } from "../../store/types/StoreTypes";

type ImaAdUiSetters = Pick<
  VideoState,
  "setAdCurrentTime" | "setCanSkipAd" | "setSkipCountdown" | "setImaSkipEnabled"
>;

/** Syncs ad progress + skip countdown from the active IMA AdsManager. */
export const syncImaAdUi = (
  manager: google.ima.AdsManager,
  currentAd: google.ima.Ad | null,
  adDurationSeconds: number,
  setters: ImaAdUiSetters
): void => {
  const remaining = manager.getRemainingTime();
  const elapsed =
    adDurationSeconds > 0 ? Math.max(0, adDurationSeconds - remaining) : 0;
  setters.setAdCurrentTime(elapsed);

  const canSkipNow = manager.getAdSkippableState();
  const skipOffset =
    currentAd && typeof currentAd.getSkipTimeOffset === "function"
      ? currentAd.getSkipTimeOffset()
      : -1;

  const isSkippableAd =
    canSkipNow || (Number.isFinite(skipOffset) && skipOffset >= 0);

  setters.setImaSkipEnabled(isSkippableAd);
  setters.setCanSkipAd(canSkipNow);

  if (!isSkippableAd || canSkipNow) {
    setters.setSkipCountdown(0);
    return;
  }

  setters.setSkipCountdown(Math.max(0, Math.ceil(skipOffset - elapsed)));
};
