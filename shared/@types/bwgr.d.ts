type NamedTuple<Id> = [id: Id, name: string];

interface Ability {
  id: dat.AbilityId | null;
  name: string | null;
  abilityType: NamedTuple<dat.AbilityTypeId>;
  hasShades: boolean | null;
  requiredTrait?: NamedTuple<dat.TraitId>;
  practice?: {
    cycle: number | null;
    routineTests: number | null;
    difficultTests: number | null;
    challengingTests: number | null;
  };
}

interface ActionTests {
  skills: NamedTuple<dat.SkillId>[];
  abilities: NamedTuple<dat.AbilityId>[];
}

interface ActionResolution<ActionId> {
  opposingAction: NamedTuple<ActionId>;
  type: NamedTuple<dat.ActionResolutionTypeId>;
  isAgainstSkill?: boolean | null;
  obstacle?: number | null;
  opposingModifier?: number | null;
  skill?: NamedTuple<dat.SkillId>;
  ability?: NamedTuple<dat.AbilityId>;
  opposingSkill?: NamedTuple<dat.SkillId>;
  opposingAbility?: NamedTuple<dat.AbilityId>;
}

interface DoWAction {
  id: dat.DuelOfWitsActionId;
  name: string;
  effect?: string | null;
  speakingThePart?: string | null;
  special?: string | null;
  tests?: ActionTests;
  resolutions?: ActionResolution<dat.DuelOfWitsActionId>[];
}

interface FightAction {
  id: dat.FightActionId | null;
  name: string | null;
  group: NamedTuple<dat.FightActionGroupId>;
  flags: {
    countsAsNoAction?: boolean | null;
  };
  effect?: string | null;
  restrictions?: string | null;
  special?: string | null;
  testExtra?: string | null;
  actionCost?: number | null;
  tests?: ActionTests;
  resolutions?: ActionResolution<dat.FightActionId>[];
}

interface RaCAction {
  id: dat.RangeAndCoverActionId | null;
  name: string | null;
  group: NamedTuple<dat.RangeAndCoverActionGroupId>;
  flags: {
    useFoRKs?: boolean | null;
    useWeaponRangeAdvantage?: boolean | null;
    usePositionAdvantage?: boolean | null;
    useStrideAdvantage?: boolean | null;
    isOpenEnded?: boolean | null;
  };
  effect?: string | null;
  specialRestriction?: string | null;
  specialAction?: string | null;
  however?: string | null;
  resolutions?: ActionResolution<dat.RangeAndCoverActionId>[];
}

interface LifepathRequirementItem {
  logicType: NamedTuple<dat.RequirementItemTypeId>;
  isUnique?: boolean;
  isSettingEntry?: boolean;
  minLpIndex?: number;
  maxLpIndex?: number;
  minYears?: number;
  maxYears?: number;
  gender?: "Female" | "Male";
  oldestBy?: number;
  attribute?: NamedTuple<dat.AbilityId>;
  skill?: NamedTuple<dat.SkillId>;
  trait?: NamedTuple<dat.TraitId>;
  lifepath?: NamedTuple<dat.LifepathId>;
  setting?: NamedTuple<dat.SettingId>;
  forCompanion?: boolean | null;
  min?: number;
  max?: number;
}

interface LifepathRequirementBlock {
  logicType: NamedTuple<dat.LogicTypeId>;
  mustFulfill: boolean | null;
  fulfillmentAmount: number | null;
  items: LifepathRequirementItem[];
}

interface Lifepath {
  rulesets: string[] | null;
  id: dat.LifepathId | null;
  name: string | null;
  stock: NamedTuple<dat.StockId | null>;
  setting: NamedTuple<dat.SettingId | null>;
  years: number | number[];
  pools: {
    eitherStatPool: number | null;
    mentalStatPool: number | null;
    physicalStatPool: number | null;
    generalSkillPool: number | null;
    lifepathSkillPool: number | null;
    traitPool: number | null;
    resourcePoints: number | null;
  };
  flags: {
    isBorn: boolean | null;
    isGSPMultipliedByYear: boolean | null;
    isLSPMultipliedByYear: boolean | null;
    isRPMultipliedByYear: boolean | null;
    getHalfGSPFromPrevLP: boolean | null;
    getHalfLSPFromPrevLP: boolean | null;
    getHalfRPFromPrevLP: boolean | null;
  };
  leads?: dat.SettingId[];
  skills?: dat.SkillId[];
  traits?: dat.TraitId[];
  companion?: {
    name: string;
    givesSkills: boolean;
    settingIds: dat.SettingId[];
    inheritGSPMultiplier?: number;
    inheritLSPMultiplier?: number;
    inheritRPMultiplier?: number;
  };
  requirementsText?: string;
  requirements?: LifepathRequirementBlock[];
}

interface Practice {
  id: string | null;
  ability?: NamedTuple<dat.AbilityId>;
  skillType?: NamedTuple<dat.SkillTypeId>;
  cycle: number | null;
  routine: number | null;
  difficult: number | null;
  challenging: number | null;
}

interface Question {
  id: dat.QuestionId | null;
  name: string | null;
  question: string | null;
  attributes?: NamedTuple<dat.AbilityId>[];
}

interface ResourceMagicObstacleDetails {
  obstacle?: number;
  abilities?: NamedTuple<dat.AbilityId>[];
  caret?: boolean;
  description?: string;
}

interface ResourceMagicDetails {
  origin: NamedTuple<dat.SpellOriginFacetId | null>;
  duration: NamedTuple<dat.SpellDurationFacetId | null>;
  areaOfEffect: NamedTuple<dat.SpellAreaOfEffectFacetId | null>;
  elements: NamedTuple<dat.SpellElementFacetId | null>[];
  impetus: NamedTuple<dat.SpellImpetusFacetId | null>[];
  actions: number | null;
  doActionsMultiply: boolean | null;
  areaOfEffectDetails?: {
    unit?: NamedTuple<dat.DistanceUnitId>;
    modifier?: NamedTuple<dat.UnitModifierId>;
  };
  obstacleDetails?: ResourceMagicObstacleDetails[];
}

interface Resource {
  rulesets: string[] | null;
  id: dat.ResourceId;
  name: string;
  stock: NamedTuple<dat.StockId | null>;
  type: NamedTuple<dat.ResourceTypeId | null>;
  costs: NamedTuple<number>[];
  modifiers: [id: number, isPerCost: boolean, description: string][];
  variableCost?: boolean;
  description?: string;
  magical?: ResourceMagicDetails;
}

interface Ruleset {
  id: dat.RulesetId | null;
  name: string | null;
  isOfficial: boolean | null;
  isPublic: boolean | null;
  isExpansion: boolean | null;
  expansionIds?: dat.RulesetId[];
  user?: string;
}

interface Setting {
  rulesets: string[] | null;
  id: dat.SettingId | null;
  name: string | null;
  nameShort: string | null;
  stock: NamedTuple<dat.StockId | null>;
  isSubsetting: boolean | null;
}

interface Skill {
  rulesets: string[] | null;
  id: dat.SkillId | null;
  name: string | null;
  category: NamedTuple<dat.SkillCategoryId | null>;
  type: NamedTuple<dat.SkillTypeId | null>;
  flags: {
    dontList: boolean | null;
    isMagical: boolean | null;
    isTraining: boolean | null;
  };
  tool: {
    typeId: dat.SkillToolTypeId | null;
    tool: string | null;
    description?: string;
  };
  stock?: NamedTuple<dat.StockId>;
  roots?: NamedTuple<dat.AbilityId>[];
  description?: string;
  subskillIds?: dat.SkillId[];
  restriction?: {
    onlyStock?: NamedTuple<dat.StockId>;
    onlyAtBurn?: boolean;
    onlyWithAbility?: NamedTuple<dat.AbilityId>;
  };
}

interface SpellOriginFacet { id: dat.SpellOriginFacetId; name: string; obstacle: number; actions: number; resource: number; }
interface SpellElementFacet { id: dat.SpellElementFacetId; name: string; obstacle: number; actions: number; resource: number; }
interface SpellImpetusFacet { id: dat.SpellImpetusFacetId; name: string; obstacle: number; actions: number; resource: number; }
interface SpellDurationFacet { id: dat.SpellDurationFacetId; name: string; obstacle: number; actions: number; resource: number; }
interface SpellAreaOfEffectFacet { id: dat.SpellAreaOfEffectFacetId; name: string; obstacle: number; actions: number; resource: number; }

interface SpellFacets {
  origins: SpellOriginFacet[];
  elements: SpellElementFacet[];
  impetus: SpellImpetusFacet[];
  duration: SpellDurationFacet[];
  areaOfEffects: SpellAreaOfEffectFacet[];
}

interface AltSpellFacets {
  origins: SpellOriginFacet[];
  primeElements: SpellElementFacet[];
  lowerElements: SpellElementFacet[];
  higherElements: SpellElementFacet[];
  impetus: SpellImpetusFacet[];
  duration: SpellDurationFacet[];
  areaOfEffects: SpellAreaOfEffectFacet[];
}

interface Stock {
  rulesets: string[] | null;
  id: dat.StockId | null;
  name: string | null;
  namePlural: string | null;
  stride: number | null;
  settingIds: dat.SettingId[] | null;
  agePool: { minAge: number; mentalPool: number; physicalPool: number; }[];
}

interface Trait {
  rulesets: string[] | null;
  id: dat.TraitId | null;
  name: string | null;
  category: NamedTuple<dat.TraitCategoryId | null>;
  type: NamedTuple<dat.TraitTypeId | null>;
  cost: number | null;
  stock?: NamedTuple<dat.StockId>;
  description?: string;
}

interface RulesetResponse {
  ruleset: {
    abilities: Ability[];
    stocks: Stock[];
    settings: Setting[];
    skills: Skill[];
    traits: Trait[];
    lifepaths: Lifepath[];
    resources: Resource[];
    spellFacets: SpellFacets;
    spellAltFacets: AltSpellFacets;
    dowActions: DoWAction[];
    racActions: RaCAction[];
    fightActions: FightAction[];
    practices: Practice[];
    questions: Question[];
  };
}

interface RulesetsResponse {
  rulesets: Ruleset[];
}

type Shade = "B" | "G" | "W";
