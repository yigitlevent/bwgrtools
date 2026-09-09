import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import {
  ClearPersistedCharacter,
  IsRulesetMismatch,
  PersistCharacterSnapshot,
  ReadPersistedCharacter,
  SubscribeCharacterBurnerAutosave
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

  it("returns false when localStorage.setItem throws (e.g. quota exceeded)", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    const ok = PersistCharacterSnapshot();

    expect(ok).toBe(false);
    setItemSpy.mockRestore();
  });

  it("ignores malformed JSON in storage", () => {
    localStorage.setItem("CharacterBurnerAutosave", "not json");
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("ignores a JSON value that parses to a non-object (e.g. a bare string or number)", () => {
    localStorage.setItem("CharacterBurnerAutosave", JSON.stringify("just a string"));
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("ignores a payload whose rulesetIds is not an array", () => {
    localStorage.setItem("CharacterBurnerAutosave", JSON.stringify({ rulesetIds: "not-an-array", savedAt: "now", snapshot: {} }));
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("ignores a payload whose savedAt is not a string", () => {
    localStorage.setItem("CharacterBurnerAutosave", JSON.stringify({ rulesetIds: [], savedAt: 12345, snapshot: {} }));
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
    useRulesetStore.setState({ chosenRulesets: ["1" as dat.RulesetId] });
    PersistCharacterSnapshot();
    const payload = ReadPersistedCharacter();

    expect(payload).not.toBeNull();
    expect(IsRulesetMismatch(payload!)).toBe(false);
  });

  it("reports a mismatch when the ruleset selection has changed since saving", () => {
    useRulesetStore.setState({ chosenRulesets: ["1" as dat.RulesetId] });
    PersistCharacterSnapshot();
    const payload = ReadPersistedCharacter();

    useRulesetStore.setState({ chosenRulesets: ["2" as dat.RulesetId] });
    expect(IsRulesetMismatch(payload!)).toBe(true);
  });

  it("reports a mismatch when the number of chosen rulesets has changed", () => {
    useRulesetStore.setState({ chosenRulesets: ["1" as dat.RulesetId] });
    PersistCharacterSnapshot();
    const payload = ReadPersistedCharacter();

    useRulesetStore.setState({ chosenRulesets: ["1" as dat.RulesetId, "2" as dat.RulesetId] });
    expect(IsRulesetMismatch(payload!)).toBe(true);
  });
});

describe("SubscribeCharacterBurnerAutosave", () => {
  beforeEach(() => {
    localStorage.clear();
    useRulesetStore.setState({ chosenRulesets: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("debounces a persist after a subscribed store changes", () => {
    const onPersistFailure = vi.fn();
    const unsubscribe = SubscribeCharacterBurnerAutosave(onPersistFailure);

    useCharacterBurnerBasicsStore.getState().setName("Debounced");
    expect(ReadPersistedCharacter()).toBeNull();

    vi.advanceTimersByTime(500);

    expect(ReadPersistedCharacter()?.snapshot.basics.name).toBe("Debounced");
    expect(onPersistFailure).toHaveBeenCalledWith(false);

    unsubscribe();
  });

  it("collapses rapid successive changes into a single debounced save", () => {
    const onPersistFailure = vi.fn();
    const unsubscribe = SubscribeCharacterBurnerAutosave(onPersistFailure);

    useCharacterBurnerBasicsStore.getState().setName("First");
    vi.advanceTimersByTime(200);
    useCharacterBurnerBasicsStore.getState().setName("Second");
    vi.advanceTimersByTime(200);
    useCharacterBurnerBasicsStore.getState().setName("Third");
    vi.advanceTimersByTime(500);

    expect(onPersistFailure).toHaveBeenCalledTimes(1);
    expect(ReadPersistedCharacter()?.snapshot.basics.name).toBe("Third");

    unsubscribe();
  });

  it("stops persisting and clears any pending save once unsubscribed", () => {
    const onPersistFailure = vi.fn();
    const unsubscribe = SubscribeCharacterBurnerAutosave(onPersistFailure);

    useCharacterBurnerBasicsStore.getState().setName("Pending");
    unsubscribe();
    vi.advanceTimersByTime(500);

    expect(ReadPersistedCharacter()).toBeNull();
    expect(onPersistFailure).not.toHaveBeenCalled();

    useCharacterBurnerBasicsStore.getState().setName("AfterUnsubscribe");
    vi.advanceTimersByTime(500);
    expect(ReadPersistedCharacter()).toBeNull();
  });

  it("unsubscribing with no pending save does not throw", () => {
    const unsubscribe = SubscribeCharacterBurnerAutosave(vi.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
