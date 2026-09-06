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
import { Average } from "../../../utils/Average";
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

      // TODO: if shade shifted, remove points from exponent
      getMortalWound: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();

        const power = getStat("Power");
        const forte = getStat("Forte");

        const shades = [power.shade, forte.shade];
        const roots = [power.exponent, forte.exponent];

        if (shades.some(v => v === "G") && shades.some(v => v === "B")) { roots.push(2); }

        return { shade: shades.every(v => v === "G") ? "G" : "B", exponent: Average(roots) };
      },

      // TODO: if shade shifted, remove points from exponent
      getReflexes: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();

        const perception = getStat("Perception");
        const agility = getStat("Agility");
        const speed = getStat("Speed");

        const shades = [perception.shade, agility.shade, speed.shade];
        const roots = [perception.exponent, agility.exponent, speed.exponent];

        if (shades.some(v => v === "G") && shades.some(v => v === "B")) roots[0] += 2;

        const shade = shades.every(v => v === "G") ? "G" : "B";
        const exponent = Math.floor(Average(roots));

        return { shade, exponent };
      },

      // TODO: if shade shifted, remove points from exponent
      getHealth: (): AbilityPoints => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();

        const will = getStat("Will");
        const forte = getStat("Forte");

        const shades = [will.shade, forte.shade];
        const roots = [will.exponent, forte.exponent];
        if (shades.some(v => v === "G") && shades.some(v => v === "B")) { roots.push(2); }

        let bonus = 0;
        if (hasQuestionTrueByName("FILTH")) bonus -= 1;
        if (hasQuestionTrueByName("SICKLY")) bonus -= 1;
        if (hasQuestionTrueByName("WOUND")) bonus -= 1;
        if (hasQuestionTrueByName("TORTURE") && hasQuestionTrueByName("ENSLAVED")) bonus -= 1;
        if (["Dwarf", "Elf", "Orc"].includes(stock[1])) bonus += 1;
        if (hasQuestionTrueByName("ACTIVE")) bonus += 1;
        if (hasQuestionTrueByName("HAPPY")) bonus += 1;

        return { shade: shades.every(v => v === "G") ? "G" : "B", exponent: Math.floor(Average(roots)) + bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getSteel: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();

        const will = getStat("Will");
        const forte = getStat("Forte");

        let bonus = 0;
        if (hasQuestionTrueByName("SOLDIER")) bonus += 1;
        if (hasQuestionTrueByName("WOUND") && hasQuestionTrueByName("SOLDIER")) bonus += 1;
        if (hasQuestionTrueByName("WOUND") && !hasQuestionTrueByName("SOLDIER")) bonus -= 1;
        if (hasQuestionTrueByName("KILLER")) bonus += 1;
        if (hasQuestionTrueByName("TORTURED") || hasQuestionTrueByName("ENSLAVED") || hasQuestionTrueByName("BEATEN")) {
          if (will.exponent >= 5) bonus += 1;
          if (will.exponent <= 3) bonus -= 1;
        }
        if (hasQuestionTrueByName("SHELTER")) bonus -= 1;
        if (hasQuestionTrueByName("COMPETITIVE")) bonus += 1;
        if (hasQuestionTrueByName("BIRTH")) bonus += 1;
        if (hasQuestionTrueByName("GIFTED")) bonus += 1;
        if (will.exponent >= 7) bonus += 2;
        else if (will.exponent >= 5) bonus += 1;
        if (forte.exponent >= 6) bonus += 2;

        return { shade: "B", exponent: 3 + bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getHesitation: (): AbilityPoints => {
        const { getStat } = useCharacterBurnerStatStore.getState();

        const will = getStat("Will");

        return { shade: "B", exponent: 10 - will.exponent };
      },

      // TODO: if shade shifted, remove points from exponent
      getGreed: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, lifepaths } = useCharacterBurnerLifepathStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { getResourcePools } = useCharacterBurnerResourceStore.getState();

        const will = getStat("Will");
        const age = getAge();
        const resourcePoints = getResourcePools();

        const lifepathsToCheck = ["Trader", "Mask Bearer", "Master of Arches", "Master of Forges", "Master Engraver", "Treasurer", "Quartermaster", "Seneschal", "Prince"];

        const relationships = Object.values(resources).filter(v => v.type[1] === "Relationship");

        let bonus = 0;
        if (will.exponent <= 4) bonus += 1;
        bonus += Math.floor(resourcePoints.spent / 60);
        bonus += lifepaths.filter(v => v.name && lifepathsToCheck.includes(v.name)).length;

        if (hasQuestionTrueByName("COVET")) bonus += 1;
        if (hasQuestionTrueByName("STOLE")) bonus += 1;
        if (hasQuestionTrueByName("STOLEN")) bonus += 1;
        if (hasQuestionTrueByName("MASTERCRAFT")) bonus += 1;
        if (hasQuestionTrueByName("POSSESSION")) bonus += 1;

        if (age > 400) bonus += 2;
        else if (age > 200) bonus += 1;
        bonus += -1 * relationships.filter(v => v.modifiers.includes("Romantic")).length;
        bonus += 1 * relationships.filter(v => v.modifiers.includes("Hateful")).length;
        bonus += 2 * relationships.filter(v => v.modifiers.includes("Immediate family") && v.modifiers.includes("Hateful")).length;
        if (hasTraitOpenByName("Virtuous")) bonus += 1;

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getGriefOrSpite: (isSpite: boolean): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { getAge, hasLifepathByName } = useCharacterBurnerLifepathStore.getState();
        const { skills } = useCharacterBurnerSkillStore.getState();
        const { traits } = useCharacterBurnerTraitStore.getState();

        const perception = getStat("Perception");
        const age = getAge();
        const steel = get().getSteel();

        const lifepathsToCheck = ["Lancer", "Lieutenant", "Captain"];
        const lifepathsToCheck2 = ["Lord Protector", "Soother"];
        const lifepathsToCheck3 = ["Loremaster", "Adjutant", "Althing"];

        const knowsLament = skills.filter(v => v.name.toLowerCase().includes("lament") && v.isOpen !== "no");

        let bonus = 0;
        if (hasLifepathByName("Protector")) bonus += 1;
        if (hasLifepathByName("Born Etharch")) bonus += 1;
        if (hasLifepathByName("Elder")) bonus += 1;
        if (lifepathsToCheck.some(v => hasLifepathByName(v))) bonus += 1;
        if (lifepathsToCheck2.some(v => hasLifepathByName(v))) bonus += 1;
        if (lifepathsToCheck3.some(v => hasLifepathByName(v))) bonus += 1;
        bonus += knowsLament.length > 0 ? 0 : 1;

        if (hasQuestionTrueByName("TRAGEDY")) bonus += 1;
        if (hasQuestionTrueByName("OUTSIDER")) bonus += 1;

        if (steel.exponent > 5) bonus += (steel.exponent - 5);
        if (perception.exponent > 5) bonus += 1;
        if (age > 1000) bonus += 3;
        else if (age > 750) bonus += 2;
        else if (age > 500) bonus += 1;

        if (isSpite) {
          const traitsToCheck = ["Slayer", "Exile", "Feral", "Murderous", "Saturnine", "Femme Fatale/Homme Fatal", "Cold", "Bitter"];
          if (traitsToCheck.some(v => traits.filter(t => t.name === v && t.isOpen).length > 0)) bonus += 1;
          const bitterReminders = Object.values(resources).filter(v => v.name === "Bitter Reminder");
          bonus += bitterReminders.length > 0 ? Math.floor(bitterReminders.map(v => v.cost).reduce((a, b) => a + b) / 10) : 0;

          if (hasQuestionTrueByName("OUTSIDER")) bonus += 1;
          if (hasQuestionTrueByName("LOVESICK")) bonus += 1;
          if (hasQuestionTrueByName("ABANDON")) bonus += 1;
          if (hasQuestionTrueByName("ABUSED")) bonus += 1;
          if (hasQuestionTrueByName("RESPECT")) bonus -= 1;
          if (hasQuestionTrueByName("LOVE")) bonus -= 1;
        }

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getFaith: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();

        let bonus = 0;
        if (hasQuestionTrueByName("TRUST")) bonus += 1;
        if (hasQuestionTrueByName("CONSULT")) bonus += 1;
        if (hasQuestionTrueByName("SERVE")) bonus += 1;

        return { shade: "B", exponent: 3 + bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getFaithInDeadGods: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();

        let bonus = 0;
        if (hasQuestionTrueByName("DEADTRUST")) bonus += 1;
        if (hasQuestionTrueByName("DEADCONSULT")) bonus += 1;
        if (hasQuestionTrueByName("DEADSERVE")) bonus += 1;

        return { shade: "B", exponent: 3 + bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getHatred: (): AbilityPoints => {
        const { special, hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();

        const steel = get().getSteel();
        const perception = getStat("Perception");
        const will = getStat("Will");

        let bonus = special.stock.brutalLifeTraits.filter(v => v !== undefined).length;
        if (hasQuestionTrueByName("WOUND")) bonus += 1;
        if (hasQuestionTrueByName("TORTURE")) bonus += 1;
        if (hasQuestionTrueByName("SLAVE")) bonus += 1;
        if (hasQuestionTrueByName("FRATRICIDE")) bonus += 1;
        if (hasQuestionTrueByName("HOBGOBLIN")) bonus += 1;
        if (will.exponent <= 2) bonus += 1;
        if (steel.exponent >= 5) bonus += 1;
        if (perception.exponent >= 6) bonus += 1;

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getVoidEmbrace: (): AbilityPoints => {
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();

        let bonus = 0;
        if (hasQuestionTrueByName("MASTER")) bonus += 1;
        if (hasQuestionTrueByName("FATE")) bonus += 1;
        if (hasQuestionTrueByName("WELLSPRING")) bonus += 1;

        return { shade: "B", exponent: 3 + bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getAncestralTaint: (): AbilityPoints => {
        const { hasSkillOpenByName } = useCharacterBurnerSkillStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        let bonus = 0;
        if (hasTraitOpenByName("Ancestral Taint")) bonus += 1;
        if (hasTraitOpenByName("Spirit Nose")) bonus += 1;
        if (hasTraitOpenByName("Stink of the Ancient")) bonus += 1;
        if (hasSkillOpenByName("Primal Bark")) bonus += 1;
        if (hasSkillOpenByName("Ancestral Jaw")) bonus += 1;
        if (hasSkillOpenByName("Grandfather's Song")) bonus += 1;

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getCorruption: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        const spiritMarks = Object.values(resources).filter(v => v.name === "Spirit Binding — Spirit Mark Levels");
        const orders = Object.values(resources).filter(v => v.name === "Summoning — Affiliated Order Levels");

        let bonus = 0;
        if (hasTraitOpenByName("Gifted")) bonus += 1;
        if (hasTraitOpenByName("Faithful") || hasTraitOpenByName("Faith in Dead Gods")) bonus += 1;
        if (hasTraitOpenByName("Chosen One")) bonus += 1;
        bonus += spiritMarks.length > 0 ? spiritMarks.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 25 ? 2 : 3), 0) : 0;
        bonus += orders.length > 0 ? orders.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 20 ? 2 : b === 25 ? 3 : 4), 0) : 0;
        if (hasQuestionTrueByName("PRAY")) bonus += 1;
        if (hasQuestionTrueByName("PACT")) bonus += 1;

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getResources: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();

        let bonus = 0;
        const res = Object.values(resources).filter(v => ["Property", "Reputation", "Affiliation"].includes(v.type[1]));
        if (res.length > 0) { bonus += Math.floor(res.map(v => v.cost).reduce((a, b) => a + b) / 15); }

        return { shade: "B", exponent: bonus };
      },

      // TODO: if shade shifted, remove points from exponent
      getCircles: (): AbilityPoints => {
        const { resources } = useCharacterBurnerResourceStore.getState();
        const { getStat } = useCharacterBurnerStatStore.getState();

        const will = getStat("Will");

        let bonus = 0;
        const res = Object.values(resources).filter(v => ["Property", "Relationship"].includes(v.type[1]));
        if (res.length > 0 && res.map(v => v.cost).reduce((a, b) => a + b) >= 50) { bonus += 1; }

        return { shade: "B", exponent: Math.floor(will.exponent / 2) + bonus };
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
