export function SetToObject<T>(arr: Set<(T & { id: string; })>): Record<string, T> {
  return [...arr].reduce((a, v) => ({ ...a, [v.id]: v }), {});
}
