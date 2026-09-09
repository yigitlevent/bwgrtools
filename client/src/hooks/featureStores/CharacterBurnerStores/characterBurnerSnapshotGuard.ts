export const RequiredSnapshotKeys: (keyof CharacterBurnerExportSnapshot)[] = ["basics", "lifepaths", "stats", "skills", "traits", "attributes", "resources", "misc"];

export function IsCharacterBurnerExportSnapshot(value: unknown): value is CharacterBurnerExportSnapshot {
  if (typeof value !== "object" || value === null) return false;
  return RequiredSnapshotKeys.every(key => key in value);
}
