import { useCharacterBurnerLimitsStore } from "./useCharacterBurnerLimits";


/**
 * Single entry point for recomputing limits.limits (stock/trait-derived stat caps and
 * Belief/Instinct slot counts). Every stat/trait/special-option mutation that can affect a
 * limit must call this AFTER committing that mutation - refreshLimits() reads the current
 * stat/trait/special state (e.g. the Stout/Dwarf Speed cap reads Power/Forte via getStat;
 * the Crippled/Frail/Missing Limb caps read special.crippledStat/frailStat/missingLimb), so
 * calling it before the triggering change lands would compute limits from stale data.
 *
 * Route every such call through this function rather than calling
 * useCharacterBurnerLimitsStore.getState().refreshLimits() directly, so this comment is the
 * one place future call sites need to check.
 */
export function RefreshCharacterLimits(): void {
  useCharacterBurnerLimitsStore.getState().refreshLimits();
}
