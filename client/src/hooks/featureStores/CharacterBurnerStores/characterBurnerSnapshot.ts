import { RecomputeCharacter } from "./recomputeCharacter";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { UniqueArray } from "../../../utils/UniqueArray";


/**
 * Builds a `CharacterBurnerExportSnapshot` from every character-burner store's current
 * state. The inverse of `HydrateCharacterBurner` below - kept in the same file so the two
 * directions can't drift out of sync with each other or with `CharacterBurnerExportSnapshot`.
 */
export function BuildCharacterBurnerSnapshot(): CharacterBurnerExportSnapshot {
  const { name, concept, gender, stock, beliefs, instincts } = useCharacterBurnerBasicsStore.getState();
  const { lifepaths } = useCharacterBurnerLifepathStore.getState();
  const { stats } = useCharacterBurnerStatStore.getState();
  const { skills } = useCharacterBurnerSkillStore.getState();
  const { traits } = useCharacterBurnerTraitStore.getState();
  const { attributes } = useCharacterBurnerAttributeStore.getState();
  const { resources } = useCharacterBurnerResourceStore.getState();
  const { special, questions, limits } = useCharacterBurnerMiscStore.getState();

  return {
    basics: { name, concept, gender, stock, beliefs, instincts },
    lifepaths: { lifepaths },
    stats: { stats },
    skills: { skills: skills.items },
    traits: { traits: traits.items },
    attributes: { attributes: attributes.items },
    resources: { resources },
    misc: { special, questions, limits }
  };
}

/**
 * Restores every character-burner store's state from a previously exported
 * `CharacterBurnerExportSnapshot` (see `BuildCharacterBurnerSnapshot` above). This overwrites
 * whatever character is currently being burned - callers are responsible for
 * confirming that with the user first.
 *
 * Only the raw, player-chosen fields (basics, lifepaths, stats, resources) are
 * restored verbatim from the snapshot. Everything derived from them (skills,
 * traits, attributes, misc limits/questions) is rebuilt via `RecomputeCharacter`
 * rather than trusted from the snapshot, so an import reflects the current
 * ruleset/derivation logic even if it's changed since the character was exported.
 */
export function HydrateCharacterBurner(snapshot: CharacterBurnerExportSnapshot): void {
  useCharacterBurnerBasicsStore.setState(snapshot.basics);
  useCharacterBurnerLifepathStore.setState({ lifepaths: snapshot.lifepaths.lifepaths });
  useCharacterBurnerStatStore.setState({ stats: snapshot.stats.stats });
  useCharacterBurnerSkillStore.setState({ skills: new UniqueArray(snapshot.skills.skills) });
  useCharacterBurnerTraitStore.setState({ traits: new UniqueArray(snapshot.traits.traits) });
  useCharacterBurnerAttributeStore.setState({ attributes: new UniqueArray(snapshot.attributes.attributes) });
  useCharacterBurnerResourceStore.setState({ resources: snapshot.resources.resources });
  useCharacterBurnerMiscStore.setState(snapshot.misc);

  useCharacterBurnerLifepathStore.getState().updateAvailableLifepaths();
  RecomputeCharacter("skillTrait");
}
