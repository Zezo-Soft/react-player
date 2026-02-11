/**
 * @description
 * @param seconds
 * @returns
 */
export const timeFormat = (seconds: number) => {
  if (isNaN(seconds)) {
    return `00:00`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

/**
 * @description
 * @param seconds
 * @returns
 */
export const secondsToMilliseconds = (seconds: number) => {
  return seconds * 1000;
};

/**
 * @description
 * @param url
 * @returns
 */
export const getExtensionFromUrl = (url: string) => {
  if (!url) {
    return undefined;
  }

  const sanitized = url.split("#")[0]?.split("?")[0] ?? url;
  const extension = sanitized?.split(".")?.pop()?.toLowerCase();

  if (extension === "m3u8") {
    return "hls";
  }
  if (extension === "mpd") {
    return "dash";
  }
  if (extension === "mp4") {
    return "mp4";
  }

  return extension;
};

export { QualityManager } from "./qualityManager";
