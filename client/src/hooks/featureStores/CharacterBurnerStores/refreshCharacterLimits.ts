import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";


/**
 * Single entry point for recomputing misc.limits (stock/trait-derived stat caps and
 * Belief/Instinct slot counts). Every stat/trait mutation that can affect a limit must
 * call this AFTER committing that mutation - refreshLimits() reads the current stat/trait
 * state (e.g. the Stout/Dwarf Speed cap reads Power/Forte via getStat), so calling it
 * before the triggering change lands would compute limits from stale data.
 *
 * Route every such call through this function rather than calling
 * useCharacterBurnerMiscStore.getState().refreshLimits() directly, so this comment is the
 * one place future call sites need to check.
 */
export function RefreshCharacterLimits(): void {
  useCharacterBurnerMiscStore.getState().refreshLimits();
}
