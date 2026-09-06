export function Pairwise<T>(arr: T[]): T[][] {
  const nArr = [];
  for (let i = 0; i < arr.length - 1; i++) {
    nArr.push([arr[i], arr[i + 1]]);
  }
  return nArr;
}
