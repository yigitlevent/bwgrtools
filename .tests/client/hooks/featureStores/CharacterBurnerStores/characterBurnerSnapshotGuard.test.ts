import { describe, expect, it } from "vitest";

import { IsCharacterBurnerExportSnapshot, RequiredSnapshotKeys } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/characterBurnerSnapshotGuard";


describe("IsCharacterBurnerExportSnapshot", () => {
  it("rejects null", () => {
    expect(IsCharacterBurnerExportSnapshot(null)).toBe(false);
  });

  it("rejects non-object values", () => {
    expect(IsCharacterBurnerExportSnapshot("snapshot")).toBe(false);
    expect(IsCharacterBurnerExportSnapshot(42)).toBe(false);
    expect(IsCharacterBurnerExportSnapshot(undefined)).toBe(false);
  });

  it("rejects an object missing required keys", () => {
    expect(IsCharacterBurnerExportSnapshot({ basics: {} })).toBe(false);
  });

  it("accepts an object with all required keys present", () => {
    const value = Object.fromEntries(RequiredSnapshotKeys.map(key => [key, {}]));
    expect(IsCharacterBurnerExportSnapshot(value)).toBe(true);
  });
});
