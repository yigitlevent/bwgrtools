/**
 * Looks up a key in a `Record`, typed to reflect that the key may not exist
 * (unlike a plain index access, which TS types as always present).
 */
export function RecordGet<K extends PropertyKey, V>(record: Record<K, V>, key: PropertyKey): V | undefined {
  return record[key as K];
}
