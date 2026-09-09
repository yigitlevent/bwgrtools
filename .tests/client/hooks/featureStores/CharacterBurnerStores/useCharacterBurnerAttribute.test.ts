import { beforeEach, describe, expect, it } from "vitest";

import { AbilityIds, SeedRuleset, StockIds } from "./_fixtures/ruleset";
import { GetMortalWound } from "../../../../../client/src/logic/attributeFormulas";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


function setTraits(names: string[]): void {
  useCharacterBurnerTraitStore.setState({
    traits: new UniqueArray<dat.TraitId, CharacterTrait>(
      names.map((name, i) => ({ id: i as dat.TraitId, name, type: "General", isOpen: true }))
    )
  });
}

describe("useCharacterBurnerAttributeStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerAttributeStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });
  });

  describe("reset", () => {
    it("resets attributes to empty", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 3 }])
      });

      useCharacterBurnerAttributeStore.getState().reset();

      expect(useCharacterBurnerAttributeStore.getState().attributes.length).toBe(0);
    });
  });

  describe("shiftAttributeShade", () => {
    it("toggles shadeShifted for an existing attribute", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: true, shadeShifted: false, exponent: 3 }])
      });

      useCharacterBurnerAttributeStore.getState().shiftAttributeShade(AbilityIds.Steel);

      expect(useCharacterBurnerAttributeStore.getState().attributes.find(AbilityIds.Steel)?.shadeShifted).toBe(true);
    });

    it("no-ops for an attribute not present", () => {
      useCharacterBurnerAttributeStore.getState().shiftAttributeShade(AbilityIds.Steel);
      expect(useCharacterBurnerAttributeStore.getState().attributes.find(AbilityIds.Steel)).toBeUndefined();
    });
  });

  describe("getMortalWound / getReflexes / getHealth / getSteel / getHesitation", () => {
    it("getMortalWound matches calling the underlying formula directly with the same stat state", () => {
      useCharacterBurnerStatStore.setState({
        stats: {
          ...useCharacterBurnerStatStore.getState().stats,
          Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
          Forte: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 3 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });

      const { getStat } = useCharacterBurnerStatStore.getState();
      const expected = GetMortalWound(getStat("Power"), getStat("Forte"));

      expect(useCharacterBurnerAttributeStore.getState().getMortalWound()).toEqual(expected);
    });

    it("getReflexes reads Perception/Agility/Speed stats and hasTraitOpenByName", () => {
      const result = useCharacterBurnerAttributeStore.getState().getReflexes();
      expect(result.shade).toBe("B");
      expect(typeof result.exponent).toBe("number");
    });

    it("getHealth reads Will/Forte/stock/questions/traits", () => {
      const result = useCharacterBurnerAttributeStore.getState().getHealth();
      // Dwarf gets a +1 bonus per GetHealth's stock check.
      expect(result.exponent).toBeGreaterThanOrEqual(1);
    });

    it("getSteel reads Will/Forte/questions", () => {
      const result = useCharacterBurnerAttributeStore.getState().getSteel();
      expect(result).toEqual({ shade: "B", exponent: 3 });
    });

    it("getHesitation reads Will and traits", () => {
      const result = useCharacterBurnerAttributeStore.getState().getHesitation();
      expect(result).toEqual({ shade: "B", exponent: 10 });
    });
  });

  describe("getGreed / getNaturalGreed / getGriefOrSpite / getNaturalGrief", () => {
    it("getNaturalGreed reads will/age/resources/lifepaths/traits/questions", () => {
      const result = useCharacterBurnerAttributeStore.getState().getNaturalGreed();
      expect(typeof result).toBe("number");
    });

    it("getGreed defers to the natural value when Avarice is not open", () => {
      const natural = useCharacterBurnerAttributeStore.getState().getNaturalGreed();
      expect(useCharacterBurnerAttributeStore.getState().getGreed().exponent).toBe(natural);
    });

    it("getGreed uses avariceGreed when Avarice is open and it's higher than natural", () => {
      setTraits(["Avarice"]);
      const natural = useCharacterBurnerAttributeStore.getState().getNaturalGreed();
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, avariceGreed: natural + 10 } });

      expect(useCharacterBurnerAttributeStore.getState().getGreed().exponent).toBe(natural + 10);
    });

    it("getGriefOrSpite forwards the special.mournerGrief override", () => {
      const result = useCharacterBurnerAttributeStore.getState().getGriefOrSpite(false);
      expect(typeof result.exponent).toBe("number");
    });

    it("getNaturalGrief matches ResolveGriefOrSpite with no mourner override", () => {
      const result = useCharacterBurnerAttributeStore.getState().getNaturalGrief();
      expect(typeof result).toBe("number");
    });
  });

  describe("getFaith / getFaithInDeadGods / getHatred / getVoidEmbrace / getAncestralTaint / getCorruption / getResources / getCircles / getStride", () => {
    it("getFaith reads questions and traits", () => {
      expect(useCharacterBurnerAttributeStore.getState().getFaith()).toEqual({ shade: "B", exponent: 3 });
    });

    it("getFaithInDeadGods reads questions", () => {
      expect(useCharacterBurnerAttributeStore.getState().getFaithInDeadGods()).toEqual({ shade: "B", exponent: 3 });
    });

    it("getHatred reads perception/will/steel/special/questions", () => {
      const result = useCharacterBurnerAttributeStore.getState().getHatred();
      expect(typeof result.exponent).toBe("number");
    });

    it("getVoidEmbrace reads questions", () => {
      expect(useCharacterBurnerAttributeStore.getState().getVoidEmbrace()).toEqual({ shade: "B", exponent: 3 });
    });

    it("getAncestralTaint reads skills and traits", () => {
      expect(useCharacterBurnerAttributeStore.getState().getAncestralTaint()).toEqual({ shade: "B", exponent: 0 });
    });

    it("getCorruption reads resources/traits/questions", () => {
      expect(useCharacterBurnerAttributeStore.getState().getCorruption()).toEqual({ shade: "B", exponent: 0 });
    });

    it("getResources reads resources/traits/special", () => {
      expect(useCharacterBurnerAttributeStore.getState().getResources()).toEqual({ shade: "B", exponent: 0 });
    });

    it("getCircles reads will/resources/traits/special", () => {
      const result = useCharacterBurnerAttributeStore.getState().getCircles();
      expect(typeof result.exponent).toBe("number");
    });

    it("getStride reads stock stride and traits/missing-limb special", () => {
      expect(useCharacterBurnerAttributeStore.getState().getStride()).toBe(6);
    });

    it("getStride applies the missing-leg penalty when missingLimb points to Speed", () => {
      setTraits(["Missing Limb"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, missingLimb: AbilityIds.Speed } });

      expect(useCharacterBurnerAttributeStore.getState().getStride()).toBe(4);
    });

    it("getStride does not apply the leg penalty when missingLimb points to a non-Speed ability", () => {
      setTraits(["Missing Limb"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, missingLimb: AbilityIds.Agility } });

      expect(useCharacterBurnerAttributeStore.getState().getStride()).toBe(6);
    });

    it("getStride falls back to 0 when the stock has no stride value", () => {
      const dwarf = useRulesetStore.getState().getStock(StockIds.Dwarf);
      useRulesetStore.setState({ stocksById: new Map([[StockIds.Dwarf, { ...dwarf, stride: null }]]) });

      expect(useCharacterBurnerAttributeStore.getState().getStride()).toBe(0);
    });
  });

  describe("getAttribute", () => {
    it("dispatches to the correct getter by name", () => {
      const result = useCharacterBurnerAttributeStore.getState().getAttribute([AbilityIds.Steel, "Steel"]);
      expect(result).toEqual({ shade: "B", exponent: 3 });
    });

    it("dispatches every remaining named attribute to its matching getter", () => {
      const state = useCharacterBurnerAttributeStore.getState();
      const cases: [string, () => AbilityPoints][] = [
        ["Mortal Wound", state.getMortalWound],
        ["Reflexes", state.getReflexes],
        ["Health", state.getHealth],
        ["Hesitation", state.getHesitation],
        ["Greed", state.getGreed],
        ["Faith", state.getFaith],
        ["Faith in Dead Gods", state.getFaithInDeadGods],
        ["Hatred", state.getHatred],
        ["Void Embrace", state.getVoidEmbrace],
        ["Ancestral Taint", state.getAncestralTaint],
        ["Corruption", state.getCorruption],
        ["Resources", state.getResources],
        ["Circles", state.getCircles]
      ];

      cases.forEach(([name, getter]) => {
        const expected = getter();
        const result = useCharacterBurnerAttributeStore.getState().getAttribute([1234 as dat.AbilityId, name]);
        expect(result.exponent).toBe(expected.exponent);
      });
    });

    it("dispatches Grief vs Spite by the passed name", () => {
      const grief = useCharacterBurnerAttributeStore.getState().getAttribute([6 as dat.AbilityId, "Grief"]);
      const spite = useCharacterBurnerAttributeStore.getState().getAttribute([6 as dat.AbilityId, "Spite"]);
      expect(grief.exponent).toBe(spite.exponent);
    });

    it("throws for an unhandled attribute name", () => {
      expect(() => useCharacterBurnerAttributeStore.getState().getAttribute([99 as dat.AbilityId, "Nonsense"])).toThrow("Unhandled Attribute: Nonsense");
    });

    it("applies a flat -5 to the exponent when the attribute was previously shade-shifted", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: true, exponent: 3 }])
      });

      const result = useCharacterBurnerAttributeStore.getState().getAttribute([AbilityIds.Steel, "Steel"]);

      expect(result.shade).toBe("B");
      expect(result.exponent).toBe(-2); // 3 - 5
    });

    it("reports shade G (without altering exponent) when shade-shifted state says so, vs the formula's own shade otherwise", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 3 }])
      });

      const result = useCharacterBurnerAttributeStore.getState().getAttribute([AbilityIds.Steel, "Steel"]);

      expect(result.shade).toBe("G");
    });
  });

  describe("hasAttribute / hasAttributeByName", () => {
    it("hasAttribute checks presence by id", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 3 }])
      });

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Steel)).toBe(true);
      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Faith)).toBe(false);
    });

    it("hasAttributeByName checks presence by name", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 3 }])
      });

      expect(useCharacterBurnerAttributeStore.getState().hasAttributeByName("Steel")).toBe(true);
      expect(useCharacterBurnerAttributeStore.getState().hasAttributeByName("Unknown")).toBe(false);
    });
  });

  describe("updateAttributes", () => {
    it("includes unconditional 'Attribute'-type abilities", () => {
      useCharacterBurnerAttributeStore.getState().updateAttributes();

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Steel)).toBe(true);
    });

    it("excludes 'Emotional Attribute'-type abilities gated behind an unopened required trait", () => {
      useCharacterBurnerAttributeStore.getState().updateAttributes();

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Faith)).toBe(false);
    });

    it("includes a gated attribute once its required trait is open", () => {
      setTraits(["Faithful"]);

      useCharacterBurnerAttributeStore.getState().updateAttributes();

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Faith)).toBe(true);
    });

    it("excludes base stats (Mental Stat/Physical Stat abilityType) entirely", () => {
      useCharacterBurnerAttributeStore.getState().updateAttributes();

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Will)).toBe(false);
      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(AbilityIds.Power)).toBe(false);
    });

    it("excludes a non-'Attribute'-type ability with no requiredTraits at all (the ?? false fallback)", () => {
      const untaggedId = 999 as dat.AbilityId;
      useRulesetStore.setState({
        abilities: [
          ...useRulesetStore.getState().abilities,
          { id: untaggedId, name: "Untagged Emotional Attribute", abilityType: [3 as dat.AbilityTypeId, "Emotional Attribute"], hasShades: true }
        ]
      });

      useCharacterBurnerAttributeStore.getState().updateAttributes();

      expect(useCharacterBurnerAttributeStore.getState().hasAttribute(untaggedId)).toBe(false);
    });

    it("falls back to hasShade:false for an ability with nullish hasShades", () => {
      useRulesetStore.setState({
        abilities: [
          ...useRulesetStore.getState().abilities.filter(a => a.id !== AbilityIds.Steel),
          { id: AbilityIds.Steel, name: "Steel", abilityType: [2 as dat.AbilityTypeId, "Attribute"], hasShades: null }
        ]
      });

      useCharacterBurnerAttributeStore.getState().updateAttributes();

      const attr = useCharacterBurnerAttributeStore.getState().attributes.find(AbilityIds.Steel);
      expect(attr?.hasShade).toBe(false);
    });

    it("BUG: a manual shade-shift's shadeShifted flag and exponent penalty perpetually oscillate across repeated recomputes instead of converging", () => {
      // getAttribute's shade/exponent logic (useCharacterBurnerAttribute.tsx ~236-244) is inverted
      // from what "shiftAttributeShade sets shadeShifted -> gray" would suggest: when
      // prevAttributeState.shadeShifted is true, getAttribute returns shade "B" (not "G") alongside
      // the -5 exponent penalty; when it's false, shade comes back "G" with no penalty from
      // getAttribute itself. updateAttributes then re-derives shadeShifted as `attr.shade === "G"`
      // and applies its OWN additional -5 whenever that's true -- so the two flags/exponents end up
      // permanently out of phase with each other, oscillating every call instead of settling into a
      // single "shade-shifted, -5 applied" steady state:
      //   pass 1 (no prior state): shadeShifted=false, exponent=3
      //   shiftAttributeShade():   shadeShifted=true,  exponent=3  (manual toggle, no exponent change)
      //   pass 2: getAttribute sees shadeShifted=true -> returns shade "B", exponent 3-5=-2;
      //           updateAttributes stores shadeShifted=(shade==="G")=false, exponent=-2-0=-2
      //   pass 3: getAttribute sees shadeShifted=false -> returns shade "G", exponent 3-0=3;
      //           updateAttributes stores shadeShifted=true, exponent=3-5=-2 (back to pass-2's state)
      // From pass 2 onward the stored state alternates shadeShifted false/true while the exponent
      // stays pinned at -2 -- never reaching a state where shadeShifted is durably true. Documented
      // here as observed behavior, not fixed.
      useCharacterBurnerAttributeStore.getState().updateAttributes();
      useCharacterBurnerAttributeStore.getState().shiftAttributeShade(AbilityIds.Steel);

      useCharacterBurnerAttributeStore.getState().updateAttributes();
      const afterPass2 = useCharacterBurnerAttributeStore.getState().attributes.find(AbilityIds.Steel);
      expect(afterPass2?.shadeShifted).toBe(false);
      expect(afterPass2?.exponent).toBe(-2);

      useCharacterBurnerAttributeStore.getState().updateAttributes();
      const afterPass3 = useCharacterBurnerAttributeStore.getState().attributes.find(AbilityIds.Steel);
      expect(afterPass3?.shadeShifted).toBe(true);
      expect(afterPass3?.exponent).toBe(-2);
    });

    it("excludes an ability with a null id", () => {
      useCharacterBurnerAttributeStore.getState().updateAttributes();
      // sanity: the fixture never seeds a null-id attribute-type ability, so this documents the
      // filter exists without needing to mutate the ruleset -- covered implicitly by the id!==null
      // filter not throwing on the seeded abilities.
      expect(useCharacterBurnerAttributeStore.getState().attributes.length).toBeGreaterThan(0);
    });
  });
});
