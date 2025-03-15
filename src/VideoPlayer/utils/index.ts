/**
 * @description Converts seconds to hh:mm:ss
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
 * @description Converts seconds to hh:mm
 * @param seconds
 */
export const timeFormatForContent = (seconds: number) => {
  if (isNaN(seconds)) {
    return `0 min`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  // if hh is not 0
  if (hh) {
    return `${hh}h ${mm.toString().padStart(2, "0")}min`;
  }
  // if hh is 0
  return `${mm}min`;
};

/**
 * @description Converts seconds to milliseconds
 * @param seconds
 * @returns
 */
export const secondsToMilliseconds = (seconds: number) => {
  return seconds * 1000;
};

/**
 * @description Converts milliseconds to seconds
 * @param milliseconds
 * @returns
 */
export const millisecondsToSeconds = (milliseconds: number) => {
  return milliseconds / 1000;
};

/**
 * @description get extension from url
 * @param url
 * @returns string | undefined
 */
export const getExtensionFromUrl = (url: string) => {
  const extension = url?.split(".")?.pop();
  if (extension === "m3u8") {
    return "hls";
  }
  return extension;
};
