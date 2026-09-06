export function ArrayToObject<T>(arr: (T & { id: string; })[]): Record<string, T> {
  return arr.reduce((a, v) => ({ ...a, [v.id]: v }), {});
}
