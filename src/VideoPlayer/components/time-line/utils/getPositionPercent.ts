export function getPositionPercent(max: number, current: number): number {
  const divider = max || -1;
  return (current * 100) / divider;
}
