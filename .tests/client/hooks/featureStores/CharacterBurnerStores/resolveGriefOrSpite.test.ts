import { beforeEach, describe, expect, it } from "vitest";

import { ResolveGriefOrSpite } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/resolveGriefOrSpite";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


describe("ResolveGriefOrSpite", () => {
  beforeEach(() => {
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
  });

  it("derives Grief for a fresh character with no bonuses", () => {
    const getSteel = (): AbilityPoints => ({ shade: "B", exponent: 3 });

    const result = ResolveGriefOrSpite(getSteel, false, undefined);

    expect(result.exponent).toBeGreaterThan(0);
    expect(result.shade).toBe("B");
  });

  it("derives Spite using the same underlying formula shape", () => {
    const getSteel = (): AbilityPoints => ({ shade: "B", exponent: 3 });

    const grief = ResolveGriefOrSpite(getSteel, false, undefined);
    const spite = ResolveGriefOrSpite(getSteel, true, undefined);

    expect(grief.exponent).toBe(spite.exponent);
  });

  it("increases with a higher Steel exponent", () => {
    const lowSteel = (): AbilityPoints => ({ shade: "B", exponent: 3 });
    const highSteel = (): AbilityPoints => ({ shade: "B", exponent: 7 });

    const low = ResolveGriefOrSpite(lowSteel, false, undefined);
    const high = ResolveGriefOrSpite(highSteel, false, undefined);

    expect(high.exponent).toBeGreaterThan(low.exponent);
  });

  it("applies the Mourner override when the Mourner trait is open and the override is higher", () => {
    const getSteel = (): AbilityPoints => ({ shade: "B", exponent: 3 });
    const natural = ResolveGriefOrSpite(getSteel, false, undefined);

    useCharacterBurnerTraitStore.setState({
      traits: new UniqueArray<dat.TraitId, CharacterTrait>([
        { id: 0 as dat.TraitId, name: "Mourner", type: "General", isOpen: true }
      ])
    });

    const overridden = ResolveGriefOrSpite(getSteel, false, natural.exponent + 5);

    expect(overridden.exponent).toBe(natural.exponent + 5);
  });

  it("ignores the Mourner override for Spite (Mourner only affects Grief)", () => {
    const getSteel = (): AbilityPoints => ({ shade: "B", exponent: 3 });
    const natural = ResolveGriefOrSpite(getSteel, true, undefined);

    useCharacterBurnerTraitStore.setState({
      traits: new UniqueArray<dat.TraitId, CharacterTrait>([
        { id: 0 as dat.TraitId, name: "Mourner", type: "General", isOpen: true }
      ])
    });

    const overridden = ResolveGriefOrSpite(getSteel, true, natural.exponent + 5);

    expect(overridden.exponent).toBe(natural.exponent);
  });
});
