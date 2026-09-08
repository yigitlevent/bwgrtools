import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerLimitsStore } from "./useCharacterBurnerLimits";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
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
 * Note: `updateTraits` (skillTrait stage) internally calls the limits store's
 * `refreshLimits` (via `RefreshCharacterLimits()`) on its own - that nested call is
 * intentionally left in place rather than hoisted here, so limits ends up touched twice
 * per full run (once nested in the skillTrait stage, once via refreshQuestions in the
 * misc stage touching special/questions - limits itself isn't touched again there). This
 * is a known, deliberate exception.
 *
 * The stores read/write each other's `getState()` in a circular, non-DAG graph - this
 * fixed stage order is the only thing keeping that from causing stale-derived-state bugs.
 * When adding a new cross-store read inside a store action, check it against this table
 * (kept in sync manually - re-derive by grepping each stage's function for
 * `useCharacterBurner*Store.getState()` calls) so it lands in a stage that runs AFTER
 * whatever it depends on has already been recomputed in the same pass:
 *
 * Stage      | Writes                                      | Reads (from other stores)
 * -----------|----------------------------------------------|--------------------------------------------
 * stat       | stat.stats (reset to initial, not recomputed) | -
 * skillTrait | skill.skills                                  | lifepath.lifepaths, special.special
 *            | trait.traits                                  | basics.stock, lifepath.lifepaths
 *            | resource.resources (nested, via updateTraits) | trait.hasTraitOpenByName (just-written),
 *            |                                                | special.special, basics.stock
 *            | limits.limits (nested, via RefreshCharacterLimits) | basics.stock, trait.hasTraitOpenByName
 *            |                                                | (just-written), stat.getStat, special.special
 * attribute  | attribute.attributes                          | stat.getStat, trait.hasTraitOpenByName,
 *            |                                                | basics.stock, special.special/hasQuestionTrueByName,
 *            |                                                | lifepath.getAge/lifepaths,
 *            |                                                | skill.skills/hasSkillOpenByName,
 *            |                                                | resource.resources/getResourcePools
 * misc       | special.questions                             | attribute.hasAttribute (just-written)
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
    useCharacterBurnerSpecialStore.getState().refreshQuestions();
  }
}

/**
 * Resets the lifepath/stat/skill/trait/special/limits/resource/attribute stores to empty.
 * Used when starting the character over (e.g. changing stock), as distinct from
 * `RecomputeCharacter`, which recomputes derived state from existing data rather
 * than clearing it.
 *
 * Special must reset before limits: limits' reset recomputes from stock/trait state via
 * refreshLimits(), which reads special.crippledStat/frailStat/missingLimb - those need to
 * already be cleared by the time limits recomputes, or a stale override would survive.
 */
export function ResetCharacterBurner(): void {
  useCharacterBurnerLifepathStore.getState().reset();
  useCharacterBurnerStatStore.getState().reset();
  useCharacterBurnerSkillStore.getState().reset();
  useCharacterBurnerTraitStore.getState().reset();
  useCharacterBurnerSpecialStore.getState().reset();
  useCharacterBurnerLimitsStore.getState().reset();
  useCharacterBurnerResourceStore.getState().reset();
  useCharacterBurnerAttributeStore.getState().reset();
}
