/** Appends a fresh correlator so each ad request is unique (required by many GAM tags). */
export const buildAdTagUrl = (adTagUrl: string): string => {
  const correlator = String(Date.now());
  if (/[?&]correlator=/i.test(adTagUrl)) {
    return adTagUrl.replace(
      /([?&]correlator=)[^&]*/i,
      `$1${correlator}`
    );
  }
  const separator = adTagUrl.includes("?") ? "&" : "?";
  return `${adTagUrl}${separator}correlator=${correlator}`;
};
