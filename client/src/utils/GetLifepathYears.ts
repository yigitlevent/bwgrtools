/**
 * Resolves how many years a single lifepath entry was actually spent in -- a fixed `Lifepath.years`
 * number, or (for a variable-year lifepath, `years: [min, max]`) the player-chosen value from
 * `special.variableAge`, falling back to the minimum if not yet chosen. Shared by getAge and by the
 * isXSPMultipliedByYear pool calculations, which both need the same per-lifepath year value.
 */
export function GetLifepathYears(lifepath: Lifepath, variableAge: Record<dat.LifepathId, number>): number {
  if (typeof lifepath.years === "number") return lifepath.years;
  return (lifepath.id !== null ? variableAge[lifepath.id] : undefined) ?? lifepath.years[0];
}
