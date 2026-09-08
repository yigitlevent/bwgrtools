/**
 * Maps each entry in a `lifepaths` array to its 1-indexed occurrence number for that lifepath's
 * `id` -- i.e. the Nth time (across the character's whole history, including across settings)
 * that particular lifepath has been taken. Used to apply the Law of Diminishing Returns for
 * repeated lifepaths (BWG rule): occurrence 1 and 2 are normal, occurrence 3+ scales down.
 * A lifepath with a `null` id (shouldn't normally happen for an already-chosen lifepath) is always
 * treated as occurrence 1, since there's no id to count repeats by.
 */
export function GetLifepathOccurrences(lifepaths: Lifepath[]): number[] {
  const counts = new Map<dat.LifepathId, number>();

  return lifepaths.map(lp => {
    if (lp.id === null) return 1;
    const occurrence = (counts.get(lp.id) ?? 0) + 1;
    counts.set(lp.id, occurrence);
    return occurrence;
  });
}
