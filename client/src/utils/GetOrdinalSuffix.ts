export function GetOrdinalSuffix(number: number): string {
  const div10 = number % 10;
  const div100 = number % 100;
  if (div10 === 1 && div100 !== 11) return `${number.toString()}st`;
  if (div10 === 2 && div100 !== 12) return `${number.toString()}nd`;
  if (div10 === 3 && div100 !== 13) return `${number.toString()}rd`;
  return `${number.toString()}th`;
}
