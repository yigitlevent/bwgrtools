import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { GetGriefOrSpite } from "../../../logic/attributeFormulas";


/**
 * Shared by useCharacterBurnerAttribute.tsx's getGriefOrSpite and getNaturalGrief, which differ
 * only in whether the Mourner special-option override (mournerGrief) is applied on top of the
 * natural derivation.
 */
export function ResolveGriefOrSpite(getSteel: () => AbilityPoints, isSpite: boolean, mournerGrief: number | undefined): AbilityPoints {
  const { resources } = useCharacterBurnerResourceStore.getState();
  const { hasQuestionTrueByName } = useCharacterBurnerMiscStore.getState();
  const { getStat } = useCharacterBurnerStatStore.getState();
  const { getAge, hasLifepathByName } = useCharacterBurnerLifepathStore.getState();
  const { skills } = useCharacterBurnerSkillStore.getState();
  const { traits, hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
  const steel = getSteel();
  return GetGriefOrSpite(
    isSpite, getStat("Perception"), steel, getAge(), resources, skills.items, traits.items,
    hasLifepathByName, hasQuestionTrueByName, hasTraitOpenByName, mournerGrief
  );
}
