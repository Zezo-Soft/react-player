export const createImaRenderingSettings = (): google.ima.AdsRenderingSettings => {
  const settings = new google.ima.AdsRenderingSettings();
  settings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  settings.useStyledLinearAds = false;
  settings.uiElements = [];
  return settings;
};
