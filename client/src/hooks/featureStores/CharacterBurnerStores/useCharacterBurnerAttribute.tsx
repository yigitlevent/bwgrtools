import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ResolveGriefOrSpite } from "./resolveGriefOrSpite";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { GetAncestralTaint, GetCircles, GetCorruption, GetFaith, GetFaithInDeadGods, GetGreed, GetHatred, GetHealth, GetHesitation, GetMortalWound, GetNaturalGreed, GetReflexes, GetResources, GetSteel, GetStride, GetVoidEmbrace } from "../../../logic/attributeFormulas";
import { UniqueArray } from "../../../utils/UniqueArray";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerAttributeState {
  attributes: UniqueArray<dat.AbilityId, CharacterAttribute>;

  reset: () => void;

  shiftAttributeShade: (attributeId: dat.AbilityId) => void;

  getMortalWound: () => AbilityPoints;
  getReflexes: () => AbilityPoints;
  getHealth: () => AbilityPoints;
  getSteel: () => AbilityPoints;
  getHesitation: () => AbilityPoints;
  getGreed: () => AbilityPoints;
  getNaturalGreed: () => number;
  getGriefOrSpite: (isSpite: boolean) => AbilityPoints;
  getNaturalGrief: () => number;
  getFaith: () => AbilityPoints;
  getFaithInDeadGods: () => AbilityPoints;
  getHatred: () => AbilityPoints;
  getVoidEmbrace: () => AbilityPoints;
  getAncestralTaint: () => AbilityPoints;
  getCorruption: () => AbilityPoints;
  getResources: () => AbilityPoints;
  getCircles: () => AbilityPoints;
  getStride: () => number;
  getAttribute: (attribute: [id: dat.AbilityId, name: string]) => AbilityPoints;

  hasAttribute: (id: dat.AbilityId) => boolean;
  hasAttributeByName: (name: string) => boolean;

  /**
   * Updates the character's attributes list.
   * It calculates the attribute exponents, filters the ones that are not available to the character.
  **/
  updateAttributes: () => void;
}

export const useCharacterBurnerAttributeStore = create<CharacterBurnerAttributeState>()(
  devtools(
    (set, get) => ({
      attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>(),

      reset: (): void => {
        set({
          attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>()
        });
      },

      shiftAttributeShade: (attributeId: dat.AbilityId): void => {
        set(produce<CharacterBurnerAttributeState>(state => {
          const charAttribute = state.attributes.find(attributeId);
          if (charAttribute !== undefined) {
            charAttribute.shadeShifted = !charAttribute.shadeShifted;
            state.attributes = new UniqueArray(state.attributes.add(charAttribute).items);
          }
        }));
      },

      getMortalWound: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetMortalWound(getStat("Power"), getStat("Forte"));
      },

      getReflexes: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetReflexes(getStat("Perception"), getStat("Agility"), getStat("Speed"), hasTraitOpenByName);
      },

      getHealth: (): AbilityPoints => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetHealth(getStat("Will"), getStat("Forte"), stock[1], hasQuestionTrueByName, hasTraitOpenByName);
      },

      getSteel: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetSteel(getStat("Will"), getStat("Forte"), hasQuestionTrueByName);
      },

      getHesitation: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetHesitation(getStat("Will"), hasTraitOpenByName);
      },

      getGreed: (): AbilityPoints => {
        const { resources, getResourcePools } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName, special } = useCharacterBurnerSpecialStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, lifepaths } = useCharacterBurnerLifepathStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetGreed(getStat("Will"), getAge(), getResourcePools(), lifepaths, resources, hasTraitOpenByName, hasQuestionTrueByName, special.avariceGreed);
      },

      getNaturalGreed: (): number => {
        const { resources, getResourcePools } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, lifepaths } = useCharacterBurnerLifepathStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetNaturalGreed(getStat("Will"), getAge(), getResourcePools(), lifepaths, resources, hasTraitOpenByName, hasQuestionTrueByName);
      },

      getGriefOrSpite: (isSpite: boolean): AbilityPoints => {
        const { special } = useCharacterBurnerSpecialStore.getState();
        return ResolveGriefOrSpite(get().getSteel, isSpite, special.mournerGrief);
      },

      getNaturalGrief: (): number => {
        return ResolveGriefOrSpite(get().getSteel, false, undefined).exponent;
      },

      getFaith: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetFaith(hasQuestionTrueByName, hasTraitOpenByName);
      },

      getFaithInDeadGods: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        return GetFaithInDeadGods(hasQuestionTrueByName);
      },

      getHatred: (): AbilityPoints => {
        const { special, hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const steel = get().getSteel();
        return GetHatred(getStat("Perception"), getStat("Will"), steel, special, hasQuestionTrueByName);
      },

      getVoidEmbrace: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        return GetVoidEmbrace(hasQuestionTrueByName);
      },

      getAncestralTaint: (): AbilityPoints => {
        const { hasSkillOpenByName } = useCharacterBurnerSkillStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetAncestralTaint(hasSkillOpenByName, hasTraitOpenByName);
      },

      getCorruption: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerSpecialStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetCorruption(resources, hasTraitOpenByName, hasQuestionTrueByName);
      },

      getResources: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        return GetResources(resources, hasTraitOpenByName, special.darlingOfCourtResource, special.lordOfAgesResource);
      },

      getCircles: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        return GetCircles(getStat("Will"), resources, hasTraitOpenByName, special.earToGroundResource);
      },

      getStride: (): number => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { getStock, getAbility } = useRulesetStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        const isMissingLeg = special.missingLimb !== undefined && getAbility(special.missingLimb).name === "Speed";
        return GetStride(getStock(stock[0]).stride ?? 0, hasTraitOpenByName, isMissingLeg);
      },

      getAttribute: (attribute: [id: dat.AbilityId, name: string]): AbilityPoints => {
        const state = get();

        const getAttributePoints = (attributeName: string): AbilityPoints => {
          switch (attributeName) {
            case "Mortal Wound":
              return state.getMortalWound();
            case "Reflexes":
              return state.getReflexes();
            case "Health":
              return state.getHealth();
            case "Steel":
              return state.getSteel();
            case "Hesitation":
              return state.getHesitation();
            case "Greed":
              return state.getGreed();
            case "Grief":
            case "Spite":
              return state.getGriefOrSpite(attribute[1] === "Spite");
            case "Faith":
              return state.getFaith();
            case "Faith in Dead Gods":
              return state.getFaithInDeadGods();
            case "Hatred":
              return state.getHatred();
            case "Void Embrace":
              return state.getVoidEmbrace();
            case "Ancestral Taint":
              return state.getAncestralTaint();
            case "Corruption":
              return state.getCorruption();
            case "Resources":
              return state.getResources();
            case "Circles":
              return state.getCircles();
            default:
              throw new Error(`Unhandled Attribute: ${attributeName}`);
          }
        };

        const prevAttributeState = state.attributes.find(attribute[0]);
        const newAttributeState = getAttributePoints(attribute[1]);

        // Derived attributes (unlike stats) have no point pool to spend from - shifting one to
        // B-shade is represented purely as a flat -5 to its exponent, applied here once rather
        // than inside each formula in attributeFormulas.ts.
        return {
          shade: prevAttributeState !== undefined ? prevAttributeState.shadeShifted ? "B" : "G" : newAttributeState.shade,
          exponent: newAttributeState.exponent - (prevAttributeState?.shadeShifted === true ? 5 : 0)
        };
      },

      hasAttribute: (id: dat.AbilityId): boolean => {
        return get().attributes.has(id);
      },

      hasAttributeByName: (name: string): boolean => {
        return get().attributes.filter(v => v.name === name).length > 0;
      },

      updateAttributes: (): void => {
        const { abilities } = useRulesetStore.getState();
        const { hasTraitOpen } = useCharacterBurnerTraitStore.getState();
        const { attributes, getAttribute } = get();

        const characterAttributes = new UniqueArray<dat.AbilityId, CharacterAttribute>(
          abilities
            .filter((ability): ability is Ability & { id: dat.AbilityId; } => (ability.abilityType[1].endsWith("Attribute")) && ability.id !== null)
            .filter(ability => ability.abilityType[1] === "Attribute" || (ability.requiredTraits?.some(traitId => hasTraitOpen(traitId)) ?? false))
            .map(ability => {
              // getAttribute already computes the final shade/exponent (manual shift penalty
              // included) from the CURRENT shadeShifted flag below -- preserve that same flag
              // on write-back rather than re-deriving it from the computed shade, which would
              // flip it every pass and double-apply the shift penalty.
              const shadeShifted = attributes.find(ability.id)?.shadeShifted ?? false;
              const attr = getAttribute([ability.id, ability.name ?? ""]);

              return {
                id: ability.id,
                name: ability.name ?? "",
                hasShade: ability.hasShades ?? false,
                shadeShifted,
                exponent: attr.exponent
              };
            }));

        set(produce<CharacterBurnerAttributeState>(state => {
          state.attributes = characterAttributes;
        }));
      }
    }),
    { name: "useCharacterBurnerAttributeStore" }
  )
);
