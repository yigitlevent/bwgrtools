import { ResetCharacterBurner } from "./recomputeCharacter";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";


/**
 * True if the character-burner has anything a full reset would actually discard. Basics'
 * `stock` doesn't count on its own - it starts pre-populated with a placeholder stock, so
 * it isn't a signal the user has made progress.
 */
export function HasCharacterBurnerProgress(): boolean {
  const { name, concept } = useCharacterBurnerBasicsStore.getState();
  const { lifepaths } = useCharacterBurnerLifepathStore.getState();
  return name !== "" || concept !== "" || lifepaths.length > 0;
}

/**
 * Resets every character-burner store, including Basics' own fields (name/concept/gender/
 * beliefs/instincts/stock) - unlike `ResetCharacterBurner`, which leaves Basics alone because
 * its callers (`setStockAndReset`) already reset Basics inline with a caller-supplied stock.
 * Used when the active ruleset/dataset changes: every id the character referenced (stock,
 * skills, traits, lifepaths) may no longer resolve against the newly loaded ruleset data.
 */
export function ResetCharacterBurnerCompletely(): void {
  useCharacterBurnerBasicsStore.setState({
    stock: [0 as dat.StockId, ""],
    concept: "",
    name: "",
    gender: "Male",
    beliefs: [
      { name: "Belief 1", belief: "" },
      { name: "Belief 2", belief: "" },
      { name: "Belief 3", belief: "" },
      { name: "Special Belief", belief: "" }
    ],
    instincts: [
      { name: "Instinct 1", instinct: "" },
      { name: "Instinct 2", instinct: "" },
      { name: "Instinct 3", instinct: "" },
      { name: "Special Instinct", instinct: "" }
    ]
  });

  ResetCharacterBurner();
}
