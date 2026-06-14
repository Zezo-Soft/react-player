const MIN_WIDTH = 640;
const MIN_HEIGHT = 360;

export const getImaSlotDimensions = (
  video: HTMLVideoElement,
  wrapper: HTMLDivElement | null
): { width: number; height: number } => {
  const wrapperRect = wrapper?.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  const width = Math.max(
    MIN_WIDTH,
    Math.round(wrapperRect?.width || 0),
    Math.round(videoRect.width || 0),
    video.clientWidth || 0,
    video.offsetWidth || 0
  );

  const height = Math.max(
    MIN_HEIGHT,
    Math.round(wrapperRect?.height || 0),
    Math.round(videoRect.height || 0),
    video.clientHeight || 0,
    video.offsetHeight || 0
  );

  return { width, height };
};
