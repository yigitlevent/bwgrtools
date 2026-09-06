export function GetWrapAroundIndex(index: number, length: number): number {
  const intIndex = Math.floor(index);
  const intLength = Math.floor(length);
  return Math.abs((Math.pow(intLength, 10)) - intIndex) % intLength;
}
