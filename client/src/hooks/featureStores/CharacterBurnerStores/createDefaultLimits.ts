export function CreateDefaultLimits(): CharacterStockLimits {
  return {
    beliefs: 3,
    instincts: 3,
    stats: {
      Will: { min: 1, max: 8 },
      Perception: { min: 1, max: 8 },
      Power: { min: 1, max: 8 },
      Agility: { min: 1, max: 8 },
      Forte: { min: 1, max: 8 },
      Speed: { min: 1, max: 8 }
    },
    attributes: 9
  };
}
