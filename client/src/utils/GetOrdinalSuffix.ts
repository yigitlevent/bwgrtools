export function GetOrdinalSuffix(number: number): string {
  const str = String(number);
  const div10 = number % 10;
  const div100 = number % 100;
  if (div10 === 1 && div100 !== 11) return `${str}st`;
  if (div10 === 2 && div100 !== 12) return `${str}nd`;
  if (div10 === 3 && div100 !== 13) return `${str}rd`;
  return `${str}th`;
}
