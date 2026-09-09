import { beforeEach, describe, expect, it } from "vitest";

import { RefreshCharacterLimits } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/refreshCharacterLimits";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLimitsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLimits";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setTraits(names: string[]): void {
  useCharacterBurnerTraitStore.setState({
    traits: new UniqueArray<dat.TraitId, CharacterTrait>(
      names.map((name, i) => ({ id: i as dat.TraitId, name, type: "General", isOpen: true }))
    )
  });
}

describe("RefreshCharacterLimits", () => {
  beforeEach(() => {
    useCharacterBurnerBasicsStore.setState({ stock: [0 as dat.StockId, "Dwarf"] });
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerLimitsStore.getState().reset();
  });

  it("resets stat limits to default when no relevant traits are open", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [0 as dat.StockId, "Dwarf"] });
    RefreshCharacterLimits();

    const { limits } = useCharacterBurnerLimitsStore.getState();
    expect(limits.stats.Forte).toEqual({ min: 1, max: 8 });
    expect(limits.beliefs).toBe(3);
    expect(limits.instincts).toBe(3);
  });

  it("raises the Forte cap and derives a Speed cap for a Stout Dwarf", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [0 as dat.StockId, "Dwarf"] });
    setTraits(["Stout"]);

    RefreshCharacterLimits();

    const { limits } = useCharacterBurnerLimitsStore.getState();
    expect(limits.stats.Forte).toEqual({ min: 1, max: 9 });
    expect(limits.stats.Speed.min).toBe(1);
    expect(limits.stats.Speed.max).toBeGreaterThanOrEqual(1);
    expect(limits.stats.Speed.max).toBeLessThanOrEqual(6);
  });

  it("raises the Perception cap for a First Born Elf", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [1 as dat.StockId, "Elf"] });
    setTraits(["First Born"]);

    RefreshCharacterLimits();

    expect(useCharacterBurnerLimitsStore.getState().limits.stats.Perception).toEqual({ min: 1, max: 9 });
  });

  it("caps Agility for a Great Wolf in Lupine Form", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [2 as dat.StockId, "Great Wolf"] });
    setTraits(["Great Lupine Form"]);

    RefreshCharacterLimits();

    expect(useCharacterBurnerLimitsStore.getState().limits.stats.Agility).toEqual({ min: 1, max: 6 });
  });

  it("does not cap Agility for a Great Wolf without Great Lupine Form open", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [2 as dat.StockId, "Great Wolf"] });

    RefreshCharacterLimits();

    expect(useCharacterBurnerLimitsStore.getState().limits.stats.Agility).toEqual({ min: 1, max: 8 });
  });

  it("applies Massive Stature and Stone's Age caps for a Troll", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [3 as dat.StockId, "Troll"] });
    setTraits(["Massive Stature", "Stone's Age"]);

    RefreshCharacterLimits();

    const { limits } = useCharacterBurnerLimitsStore.getState();
    expect(limits.stats.Power).toEqual({ min: 4, max: 9 });
    expect(limits.stats.Forte).toEqual({ min: 4, max: 9 });
    expect(limits.stats.Agility).toEqual({ min: 1, max: 5 });
    expect(limits.stats.Speed).toEqual({ min: 1, max: 5 });
    expect(limits.stats.Perception).toEqual({ min: 1, max: 6 });
    expect(limits.stats.Will).toEqual({ min: 1, max: 6 });
  });

  it("applies only the Massive Stature caps for a Troll without Stone's Age", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [3 as dat.StockId, "Troll"] });
    setTraits(["Massive Stature"]);

    RefreshCharacterLimits();

    const { limits } = useCharacterBurnerLimitsStore.getState();
    expect(limits.stats.Power).toEqual({ min: 4, max: 9 });
    expect(limits.stats.Perception).toEqual({ min: 1, max: 8 });
    expect(limits.stats.Will).toEqual({ min: 1, max: 8 });
  });

  it("applies only the Stone's Age caps for a Troll without Massive Stature", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [3 as dat.StockId, "Troll"] });
    setTraits(["Stone's Age"]);

    RefreshCharacterLimits();

    const { limits } = useCharacterBurnerLimitsStore.getState();
    expect(limits.stats.Perception).toEqual({ min: 1, max: 6 });
    expect(limits.stats.Will).toEqual({ min: 1, max: 6 });
    expect(limits.stats.Power).toEqual({ min: 1, max: 8 });
  });

  it("grants a 4th Belief slot for Belief-granting traits", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [4 as dat.StockId, "Human"] });
    setTraits(["Zealot"]);

    RefreshCharacterLimits();

    expect(useCharacterBurnerLimitsStore.getState().limits.beliefs).toBe(4);
  });

  it("grants a 4th Instinct slot for Alarmist", () => {
    useCharacterBurnerBasicsStore.setState({ stock: [4 as dat.StockId, "Human"] });
    setTraits(["Alarmist"]);

    RefreshCharacterLimits();

    expect(useCharacterBurnerLimitsStore.getState().limits.instincts).toBe(4);
  });
});
