type CharacterBurnerModals = "lp" | "randLp" | "re" | "geSk" | "geTr" | "qu" | "so" | "import";

interface CharacterAttribute {
  id: dat.AbilityId;
  name: string;
  hasShade: boolean;
  shadeShifted: boolean;
  exponent: number;
}

interface CharacterSkill {
  id: dat.SkillId;
  name: string;
  type: "Mandatory" | "Lifepath" | "General";
  isSpecial: boolean;
  isOpen: "no" | "yes" | "double";
  advancement: { general: number; lifepath: number; };
}

interface CharacterTrait {
  id: dat.TraitId;
  name: string;
  type: "Mandatory" | "Lifepath" | "Common" | "General";
  isOpen: boolean;
}

interface CharacterResource {
  id: dat.ResourceId;
  name: string;
  type: [id: dat.ResourceTypeId, name: string];
  modifiers: string[];
  cost: number;
  description: string;
  sourceTraitId?: dat.TraitId;
  minCost?: number;
}

interface CharacterSpecialStock {
  brutalLifeTraits: ([id: dat.TraitId, name: string] | "No Trait" | undefined)[];
  huntingGround: undefined | HuntingGroundsList;
}

interface CharacterSpecial {
  stock: CharacterSpecialStock;
  companionLifepath: Record<string, dat.LifepathId>;
  variableAge: Record<dat.LifepathId, number>;
  companionSkills: Record<string, dat.SkillId[]>;
  chosenSubskills: Record<dat.SkillId, dat.SkillId[]>;
  chosenResourceType: Record<dat.TraitId, dat.ResourceTypeId>;
  avariceGreed: number | undefined;
  // Crippled: player-chosen stat, capped start <=3 / max 4.
  crippledStat: dat.AbilityId | undefined;
  // Frail: player-chosen stat (Power or Forte), -1 and capped at max 5.
  frailStat: dat.AbilityId | undefined;
  // Missing Limb: Agility's id for a missing arm (cap 5), Speed's id for a missing leg (cap 4, stride
  // -2).
  missingLimb: dat.AbilityId | undefined;
  // Child Prodigy: exactly one of these two is set (mutually exclusive) -- either +3D to a chosen
  // stat (Perception or Will), or one chosen skill shade-shifted to gray.
  childProdigyStat: dat.AbilityId | undefined;
  childProdigyShiftedSkill: dat.SkillId | undefined;
  // Darling of the Court: +1D to a chosen owned Reputation resource (keyed by its `resources` record
  // key, same as other resource references).
  darlingOfCourtResource: string | undefined;
  // Ear to the Ground: +1 Circles if a chosen owned Relationship resource is flagged as "the captain".
  earToGroundResource: string | undefined;
  // Fey Blood: one trait chosen from the Elf/Dwarf/Orc trait lists, added as a General trait (its
  // own ruleset cost already correctly free for Lifepath/Common, paid for Special).
  feyBloodTrait: dat.TraitId | undefined;
  // Lesson of One: a chosen owned Relationship (with the mentor) grants a free Reputation resource --
  // 1D if the relationship is "important" (cost 10), 2D if "powerful" (cost 15), nothing otherwise.
  lessonOfOneRelationship: string | undefined;
  // Lord of Ages: +1D to a chosen owned Reputation or Affiliation resource.
  lordOfAgesResource: string | undefined;
  // Mourner: player-chosen starting Grief, up to exponent 9 (never lower than the natural value).
  mournerGrief: number | undefined;
  // Servant of the Citadel / Sworn to Protect: player affirms they've written a qualifying
  // Belief (+Instinct, for Servant of the Citadel) about the citadel/Wilderlands/royalty. The burner
  // cannot verify Belief/Instinct text, so this is a self-reported checkbox gating the 2D
  // reputation + 2D major affiliation grant.
  servantOfCitadelQualifies: boolean;
  swornToProtectQualifies: boolean;
  // Tainted Legacy: one trait chosen from the Monstrous category, added as a General trait but
  // granted free (its normal 1-point ruleset cost is waived in getTraitPools).
  taintedLegacyTrait: dat.TraitId | undefined;
}

interface CharacterStockLimits {
  beliefs: number;
  instincts: number;
  stats: {
    [key: string]: { min: number; max: number; };
    Will: { min: number; max: number; };
    Perception: { min: number; max: number; };
    Power: { min: number; max: number; };
    Agility: { min: number; max: number; };
    Forte: { min: number; max: number; };
    Speed: { min: number; max: number; };
  };
  attributes: number;
}

interface StatData {
  poolType: "Mental" | "Physical";
  shadeShifted: boolean;
  mainPoolSpent: { shade: number; exponent: number; };
  eitherPoolSpent: { shade: number; exponent: number; };
}

interface CharacterQuestion {
  id: dat.QuestionId;
  name: string;
  question: string;
  answer: boolean;
}

type HuntingGroundsList = "Waste" | "Marginal" | "Typical" | "Plentiful" | "Untouched";

interface Points {
  total: number;
  spent: number;
  remaining: number;
}

interface AbilityPoints {
  shade: Shade;
  exponent: number;
}

/**
 * Shape of a character as downloaded via "export" (see Checklist.tsx's exportChar).
 * Export-only: there is currently no matching import/hydrate path anywhere in the client.
 */
interface CharacterBurnerExportSnapshot {
  basics: {
    name: string;
    concept: string;
    gender: "Male" | "Female";
    stock: [id: dat.StockId, name: string];
    beliefs: { name: string; belief: string; }[];
    instincts: { name: string; instinct: string; }[];
  };
  lifepaths: {
    lifepaths: Lifepath[];
  };
  stats: {
    stats: Record<string, StatData>;
  };
  skills: {
    skills: CharacterSkill[];
  };
  traits: {
    traits: CharacterTrait[];
  };
  attributes: {
    attributes: CharacterAttribute[];
  };
  resources: {
    resources: Record<string, CharacterResource>;
  };
  misc: {
    special: CharacterSpecial;
    questions: CharacterQuestion[];
    limits: CharacterStockLimits;
  };
}
