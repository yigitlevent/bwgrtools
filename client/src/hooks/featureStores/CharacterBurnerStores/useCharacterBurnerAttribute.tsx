import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { GetAncestralTaint, GetCircles, GetCorruption, GetFaith, GetFaithInDeadGods, GetGreed, GetGriefOrSpite, GetHatred, GetHealth, GetHesitation, GetMortalWound, GetReflexes, GetResources, GetSteel, GetVoidEmbrace } from "../../../logic/attributeFormulas";
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
  getGriefOrSpite: (isSpite: boolean) => AbilityPoints;
  getFaith: () => AbilityPoints;
  getFaithInDeadGods: () => AbilityPoints;
  getHatred: () => AbilityPoints;
  getVoidEmbrace: () => AbilityPoints;
  getAncestralTaint: () => AbilityPoints;
  getCorruption: () => AbilityPoints;
  getResources: () => AbilityPoints;
  getCircles: () => AbilityPoints;
  getAttribute: (attribute: [id: dat.AbilityId, name: string]) => AbilityPoints;

  hasAttribute: (id: dat.AbilityId) => boolean;
  hasAttributeByName: (name: string) => boolean;

  /**
   * Updates the character's attributes list.
   * It calculates the attribute exponents, filters the ones that are not available to the character.
   * @remarks TODO: Calculate exponents.
   * @remarks TODO: Preserve shades.
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
          if (charAttribute) {
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
        return GetReflexes(getStat("Perception"), getStat("Agility"), getStat("Speed"));
      },

      getHealth: (): AbilityPoints => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetHealth(getStat("Will"), getStat("Forte"), stock[1], hasQuestionTrueByName);
      },

      getSteel: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetSteel(getStat("Will"), getStat("Forte"), hasQuestionTrueByName);
      },

      getHesitation: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetHesitation(getStat("Will"));
      },

      getGreed: (): AbilityPoints => {
        const { resources, getResourcePools } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, lifepaths } = useCharacterBurnerLifepathStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetGreed(getStat("Will"), getAge(), getResourcePools(), lifepaths, resources, hasTraitOpenByName, hasQuestionTrueByName);
      },

      getGriefOrSpite: (isSpite: boolean): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, hasLifepathByName } = useCharacterBurnerLifepathStore.getState();
        const { skills } = useCharacterBurnerSkillStore.getState();
        const { traits } = useCharacterBurnerTraitStore.getState();
        const steel = get().getSteel();
        return GetGriefOrSpite(isSpite, getStat("Perception"), steel, getAge(), resources, skills.items, traits.items, hasLifepathByName, hasQuestionTrueByName);
      },

      getFaith: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        return GetFaith(hasQuestionTrueByName);
      },

      getFaithInDeadGods: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        return GetFaithInDeadGods(hasQuestionTrueByName);
      },

      getHatred: (): AbilityPoints => {
        const { special, hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const steel = get().getSteel();
        return GetHatred(getStat("Perception"), getStat("Will"), steel, special, hasQuestionTrueByName);
      },

      getVoidEmbrace: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        return GetVoidEmbrace(hasQuestionTrueByName);
      },

      getAncestralTaint: (): AbilityPoints => {
        const { hasSkillOpenByName } = useCharacterBurnerSkillStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetAncestralTaint(hasSkillOpenByName, hasTraitOpenByName);
      },

      getCorruption: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        return GetCorruption(resources, hasTraitOpenByName, hasQuestionTrueByName);
      },

      getResources: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        return GetResources(resources);
      },

      getCircles: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        return GetCircles(getStat("Will"), resources);
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
          exponent: newAttributeState.exponent - (prevAttributeState?.shadeShifted ? 5 : 0)
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
        const { getAttribute } = get();

        const characterAttributes = new UniqueArray<dat.AbilityId, CharacterAttribute>(
          abilities
            .filter((ability): ability is Ability & { id: dat.AbilityId; } => (ability.abilityType[1].endsWith("Attribute")) && ability.id !== null)
            .map(ability => {
              const attr = getAttribute([ability.id, ability.name ?? ""]);

              if (ability.abilityType[1] === "Attribute") {
                return {
                  id: ability.id,
                  name: ability.name ?? "",
                  hasShade: ability.hasShades ?? false,
                  shadeShifted: attr.shade === "G",
                  exponent: getAttribute([ability.id, ability.name ?? ""]).exponent - (attr.shade === "G" ? 5 : 0)
                };
              }
              else if (ability.requiredTrait && hasTraitOpen(ability.requiredTrait[0])) {
                return {
                  id: ability.id,
                  name: ability.name ?? "",
                  hasShade: ability.hasShades ?? false,
                  shadeShifted: attr.shade === "G",
                  exponent: getAttribute([ability.id, ability.name ?? ""]).exponent - (attr.shade === "G" ? 5 : 0)
                };
              }
              else return [];
            }).flat());

        set(produce<CharacterBurnerAttributeState>(state => {
          state.attributes = characterAttributes;
        }));
      }
    }),
    { name: "useCharacterBurnerAttributeStore" }
  )
);
