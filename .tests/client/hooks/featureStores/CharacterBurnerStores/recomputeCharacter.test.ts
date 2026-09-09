import { beforeEach, describe, expect, it } from "vitest";

import { RecomputeCharacter, ResetCharacterBurner } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/recomputeCharacter";
import type { RecomputeStage } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/recomputeCharacter";
import { PersistCharacterSnapshot, ReadPersistedCharacter } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/characterBurnerAutosave";
import { useCharacterBurnerAttributeStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerLimitsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLimits";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { CreateInitialStats } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createInitialStats";


describe("RecomputeCharacter", () => {
  beforeEach(() => {
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerLimitsStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerAttributeStore.getState().reset();
  });

  it("resets stats when starting from the stat stage", () => {
    useCharacterBurnerStatStore.setState({ stats: { Will: { poolType: "Mental", shadeShifted: true, mainPoolSpent: { shade: 0, exponent: 5 }, eitherPoolSpent: { shade: 0, exponent: 0 } } } });

    RecomputeCharacter("stat");

    expect(useCharacterBurnerStatStore.getState().stats).toEqual(CreateInitialStats());
  });

  it("does not reset stats when starting from a later stage", () => {
    const customStats = { Will: { poolType: "Mental" as const, shadeShifted: true, mainPoolSpent: { shade: 0, exponent: 5 }, eitherPoolSpent: { shade: 0, exponent: 0 } } };
    useCharacterBurnerStatStore.setState({ stats: customStats });

    RecomputeCharacter("skillTrait");

    expect(useCharacterBurnerStatStore.getState().stats).toEqual(customStats);
  });

  it("runs skillTrait/attribute/misc recompute without throwing on an empty character", () => {
    expect(() => RecomputeCharacter("skillTrait")).not.toThrow();
    expect(() => RecomputeCharacter("attribute")).not.toThrow();
    expect(() => RecomputeCharacter("misc")).not.toThrow();
  });

  it("recomputes skills and traits from the current (empty) lifepath list", () => {
    RecomputeCharacter("skillTrait");

    expect(useCharacterBurnerSkillStore.getState().skills.length).toBe(0);
    expect(useCharacterBurnerTraitStore.getState().traits.length).toBe(0);
  });

  it("runs every stage (including misc) for a stage name outside the RecomputeStage union", () => {
    // StageOrder.indexOf(from) returns -1 for any value not in the union, and -1 <= every real
    // stage's index (0..3) -- so an invalid stage name runs ALL stages rather than none or throwing.
    // This is only reachable by bypassing the type system (e.g. an untyped caller), and it also means
    // the `misc` stage's own `if` can never see its condition evaluate false for ANY string input,
    // not just ones in the union -- there is no string that sorts "after" the last stage.
    expect(() => RecomputeCharacter("bogus" as RecomputeStage)).not.toThrow();
    expect(useCharacterBurnerStatStore.getState().stats).toEqual(CreateInitialStats());
  });
});

describe("ResetCharacterBurner", () => {
  beforeEach(() => {
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerLimitsStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerAttributeStore.getState().reset();
    localStorage.clear();
  });

  it("clears lifepaths and resets derived stores", () => {
    useCharacterBurnerLifepathStore.setState({ lifepaths: [{ id: 1 as unknown as dat.LifepathId } as unknown as Lifepath] });

    ResetCharacterBurner();

    expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual([]);
    expect(useCharacterBurnerStatStore.getState().stats).toEqual(CreateInitialStats());
  });

  it("clears the persisted autosave", () => {
    PersistCharacterSnapshot();
    expect(ReadPersistedCharacter()).not.toBeNull();

    ResetCharacterBurner();

    expect(ReadPersistedCharacter()).toBeNull();
  });
});
