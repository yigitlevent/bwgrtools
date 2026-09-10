export function Clamp(num: number, min: number, max: number): number {
  if (min > max) throw new Error("Clamp: min cannot be greater than max");
  const val = Number.isNaN(num) ? min : num;
  return Math.min(Math.max(val, min), max);
}
