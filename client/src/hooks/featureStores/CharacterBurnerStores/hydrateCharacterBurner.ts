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
 * Restores every character-burner store's state from a previously exported
 * `CharacterBurnerExportSnapshot` (see Checklist.tsx's exportChar). This overwrites
 * whatever character is currently being burned - callers are responsible for
 * confirming that with the user first.
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
}
