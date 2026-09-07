import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";


export type RecomputeStage = "stat" | "skillTrait" | "attribute" | "misc";

const StageOrder: RecomputeStage[] = ["stat", "skillTrait", "attribute", "misc"];

/**
 * Recomputes derived character-burner state in the fixed, known dependency order:
 * stat -> skill/trait -> attribute -> misc (questions).
 *
 * `from` lets a caller skip stages that don't apply to it (e.g. a stat exponent
 * change never needs to reset stats, but still needs skill/trait/attribute/question
 * recompute since attribute formulas can read stat exponents).
 *
 * Note: `updateTraits` (skillTrait stage) internally calls the misc store's
 * `refreshTraitEffects` on its own - that nested call is intentionally left in
 * place rather than hoisted here, so misc ends up touched twice per full run
 * (once via refreshTraitEffects nested in the skillTrait stage, once via
 * refreshQuestions in the misc stage). This is a known, deliberate exception.
 */
export function RecomputeCharacter(from: RecomputeStage): void {
  const startIndex = StageOrder.indexOf(from);

  if (startIndex <= StageOrder.indexOf("stat")) {
    useCharacterBurnerStatStore.getState().reset();
  }
  if (startIndex <= StageOrder.indexOf("skillTrait")) {
    useCharacterBurnerSkillStore.getState().updateSkills();
    useCharacterBurnerTraitStore.getState().updateTraits();
  }
  if (startIndex <= StageOrder.indexOf("attribute")) {
    useCharacterBurnerAttributeStore.getState().updateAttributes();
  }
  if (startIndex <= StageOrder.indexOf("misc")) {
    useCharacterBurnerMiscStore.getState().refreshQuestions();
  }
}

/**
 * Resets the lifepath/stat/skill/trait/misc/attribute stores to empty. Used when
 * starting the character over (e.g. changing stock), as distinct from
 * `RecomputeCharacter`, which recomputes derived state from existing data rather
 * than clearing it.
 */
export function ResetCharacterBurner(): void {
  useCharacterBurnerLifepathStore.getState().reset();
  useCharacterBurnerStatStore.getState().reset();
  useCharacterBurnerSkillStore.getState().reset();
  useCharacterBurnerTraitStore.getState().reset();
  useCharacterBurnerMiscStore.getState().reset();
  useCharacterBurnerAttributeStore.getState().reset();
}
