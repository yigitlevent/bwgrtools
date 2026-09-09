import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CreateDefaultLimits } from "./createDefaultLimits";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { Average } from "../../../utils/Average";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerLimitsState {
  limits: CharacterStockLimits;

  reset: () => void;

  getTolerances: () => string[];
  refreshLimits: () => void;
}

export const useCharacterBurnerLimitsStore = create<CharacterBurnerLimitsState>()(
  devtools(
    (set, get) => ({
      limits: CreateDefaultLimits(),

      reset: (): void => {
        get().refreshLimits();
      },

      refreshLimits: (): void => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        const limits: CharacterStockLimits = CreateDefaultLimits();

        if (stock[1] === "Dwarf") {
          if (hasTraitOpenByName("Stout")) {
            const { getStat } = useCharacterBurnerStatStore.getState();
            limits.stats.Forte = { min: 1, max: 9 };
            // Speed must always be lower than the higher of Power/Forte, on top of its own flat cap.
            const higherOfPowerForte = Math.max(getStat("Power").exponent, getStat("Forte").exponent);
            limits.stats.Speed = { min: 1, max: Math.max(1, Math.min(6, higherOfPowerForte - 1)) };
          }
        }
        else if (stock[1] === "Elf") {
          if (hasTraitOpenByName("First Born")) limits.stats.Perception = { min: 1, max: 9 };
        }
        else if (stock[1] === "Great Wolf") {
          if (hasTraitOpenByName("Great Lupine Form")) limits.stats.Agility = { min: 1, max: 6 };
        }
        else if (stock[1] === "Troll") {
          if (hasTraitOpenByName("Massive Stature")) {
            limits.stats.Power = { min: 4, max: 9 };
            limits.stats.Forte = { min: 4, max: 9 };
            limits.stats.Agility = { min: 1, max: 5 };
            limits.stats.Speed = { min: 1, max: 5 };
          }
          if (hasTraitOpenByName("Stone's Age")) {
            limits.stats.Perception = { min: 1, max: 6 };
            limits.stats.Will = { min: 1, max: 6 };
          }
        }

        // Traits granting an additional (4th) Belief or Instinct -- verified against each trait's
        // actual description text. "Possessed" also grants an extra BIT set but for a separate
        // possessing spirit (not a 4th slot on the character's own sheet), so it's out of scope here.
        if (["Loyal", "Oathsworn", "Sworn to the Order", "Zealot", "Noblesse Oblige"].some(name => hasTraitOpenByName(name))) limits.beliefs = 4;
        if (hasTraitOpenByName("Alarmist")) limits.instincts = 4;

        const ruleset = useRulesetStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();

        // Crippled: player-chosen stat capped at exponent 4 (the "cannot start higher than 3" half
        // of the rule isn't representable -- the burner has no starting-vs-advancement distinction).
        if (hasTraitOpenByName("Crippled") && special.crippledStat !== undefined) {
          const statName = ruleset.getAbility(special.crippledStat).name;
          if (statName !== null) limits.stats[statName] = { min: 1, max: 4 };
        }

        // Frail: player-chosen stat (Power or Forte) capped at exponent 5.
        if (hasTraitOpenByName("Frail") && special.frailStat !== undefined) {
          const statName = ruleset.getAbility(special.frailStat).name;
          if (statName !== null) limits.stats[statName] = { min: 1, max: 5 };
        }

        // Missing Limb: a missing arm caps Agility at 5; a missing leg caps Speed at 4 (stride is
        // handled in GetStride, not here).
        if (hasTraitOpenByName("Missing Limb") && special.missingLimb !== undefined) {
          const limbName = ruleset.getAbility(special.missingLimb).name;
          if (limbName === "Agility") limits.stats.Agility = { min: 1, max: 5 };
          else if (limbName === "Speed") limits.stats.Speed = { min: 1, max: 4 };
        }

        set(produce<CharacterBurnerLimitsState>(state => {
          state.limits = limits;
        }));
      },

      getTolerances: (): string[] => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        const power = getStat("Power");
        const forte = getStat("Forte");

        const ptgs = Array(16).fill("—") as string[];

        const maxDistance = Math.ceil(forte.exponent / 2);

        const mortalWound =
          hasTraitOpenByName("Tough") ? Math.ceil(Average([power.exponent, forte.exponent])) + 6 : Math.floor(Average([power.exponent, forte.exponent])) + 6;

        let traumatic = mortalWound - 1;
        let severe = mortalWound - 2;
        let midi = mortalWound - 3;
        let light = mortalWound - 4;
        const superficial = Math.floor(forte.exponent / 2) + 1;

        while (light - superficial > maxDistance) light--;
        while (midi - light > maxDistance) midi--;
        while (severe - midi > maxDistance) severe--;
        while (traumatic - severe > maxDistance) traumatic--;

        for (let i = 0; i < ptgs.length; i++) {
          if (i >= superficial && i < light) ptgs[i] = "Su";
          else if (i >= light && i < midi) ptgs[i] = "Li";
          else if (i >= midi && i < severe) ptgs[i] = "Mi";
          else if (i >= severe && i < traumatic) ptgs[i] = "Se";
          else if (i >= traumatic && i < mortalWound) ptgs[i] = "Tr";
          else if (i === mortalWound) ptgs[i] = "MW";
        }

        return ptgs;
      }
    }),
    { name: "useCharacterBurnerLimitsStore" }
  )
);
