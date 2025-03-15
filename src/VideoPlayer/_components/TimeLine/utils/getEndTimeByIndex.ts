import { TimeCode } from "../_components/timeCodeItem";

export const getEndTimeByIndex = (
  timeCodes: TimeCode[],
  index: number,
  max: number
): number => (index + 1 < timeCodes.length ? timeCodes[index + 1].fromMs : max);
