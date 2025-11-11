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
 */
export const timeFormatForContent = (seconds: number) => {
  if (isNaN(seconds)) {
    return `0 min`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  if (hh) {
    return `${hh}h ${mm.toString().padStart(2, "0")}min`;
  }
  return `${mm}min`;
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
 * @param milliseconds
 * @returns
 */
export const millisecondsToSeconds = (milliseconds: number) => {
  return milliseconds / 1000;
};

/**
 * @description
 * @param url
 * @returns
 */
export const getExtensionFromUrl = (url: string) => {
  const extension = url?.split(".")?.pop();
  if (extension === "m3u8") {
    return "hls";
  }
  if (extension === "mpd") {
    return "dash";
  }
  return extension;
};

export { QualityManager } from "./qualityManager";
