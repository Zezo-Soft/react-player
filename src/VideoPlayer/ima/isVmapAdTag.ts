import { ImaConfig } from "../types/AdTypes";

/** Detect VMAP / ad-rule tags that require a single persistent IMA session. */
export const isVmapAdTag = (
  adTagUrl: string,
  imaConfig?: Pick<ImaConfig, "adTagFormat">
): boolean => {
  if (imaConfig?.adTagFormat === "vmap") return true;
  if (imaConfig?.adTagFormat === "vast") return false;
  return /[?&](output=vmap|ad_rule=1)/i.test(adTagUrl);
};
