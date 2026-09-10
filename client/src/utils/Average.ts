export function Average(arr: number[]): number {
  if (arr.length === 0) throw new Error("Average: cannot average an empty array");
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
