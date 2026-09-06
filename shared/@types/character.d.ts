type CharacterBurnerModals = "lp" | "randLp" | "re" | "geSk" | "geTr" | "qu" | "so";

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

type CharacterTraitEffect =
  | { roundUp: dat.AbilityId; }
  | { roundUp: "Mortal Wound"; }
  | { callOn: dat.AbilityId; }
  | { callOn: dat.SkillId; };

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

interface BurningCharacter {
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
    traitEffects: CharacterTraitEffect[];
  };
}
