export function Pairwise<T>(arr: T[]): T[][] {
  return arr.slice(0, -1).map((v, i) => [v, arr[i + 1]]);
}
