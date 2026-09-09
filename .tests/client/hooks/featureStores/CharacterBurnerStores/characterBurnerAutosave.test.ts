import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import {
  ClearPersistedCharacter,
  IsRulesetMismatch,
  PersistCharacterSnapshot,
  ReadPersistedCharacter
} from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/characterBurnerAutosave";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";


describe("characterBurnerAutosave", () => {
  beforeEach(() => {
    localStorage.clear();
    useRulesetStore.setState({ chosenRulesets: [] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing has been persisted", () => {
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("persists and reads back the current character-burner state", () => {
    useCharacterBurnerBasicsStore.getState().setName("Torvald");
    const ok = PersistCharacterSnapshot();

    expect(ok).toBe(true);
    const payload = ReadPersistedCharacter();
    expect(payload).not.toBeNull();
    expect(payload?.snapshot.basics.name).toBe("Torvald");
  });

  it("ignores malformed JSON in storage", () => {
    localStorage.setItem("CharacterBurnerAutosave", "not json");
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("ignores a payload missing required snapshot keys", () => {
    localStorage.setItem("CharacterBurnerAutosave", JSON.stringify({ rulesetIds: [], savedAt: "now", snapshot: { basics: {} } }));
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("clears the persisted character", () => {
    PersistCharacterSnapshot();
    expect(ReadPersistedCharacter()).not.toBeNull();

    ClearPersistedCharacter();
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("reports no mismatch when the ruleset selection is unchanged", () => {
    useRulesetStore.setState({ chosenRulesets: [1 as dat.RulesetId] });
    PersistCharacterSnapshot();
    const payload = ReadPersistedCharacter();

    expect(payload).not.toBeNull();
    expect(IsRulesetMismatch(payload!)).toBe(false);
  });

  it("reports a mismatch when the ruleset selection has changed since saving", () => {
    useRulesetStore.setState({ chosenRulesets: [1 as dat.RulesetId] });
    PersistCharacterSnapshot();
    const payload = ReadPersistedCharacter();

    useRulesetStore.setState({ chosenRulesets: [2 as dat.RulesetId] });
    expect(IsRulesetMismatch(payload!)).toBe(true);
  });
});
