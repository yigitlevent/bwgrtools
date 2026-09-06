export function Clamp(num: number, min: number, max: number): number {
  const val = isNaN(num) || typeof num !== "number" ? min : num;
  return Math.min(Math.max(val, min), max);
}
