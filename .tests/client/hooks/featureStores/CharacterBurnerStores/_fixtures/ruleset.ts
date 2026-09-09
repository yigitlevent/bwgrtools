import { useRulesetStore } from "../../../../../../client/src/hooks/apiStores/useRulesetStore";


/**
 * A small but internally-consistent ruleset fixture shared by the CharacterBurnerStores specs.
 * Every id referenced by one fixture object (a skill's `roots`, a trait's `grantsResources`, ...)
 * resolves against another fixture object's id here -- several store methods throw on an
 * unresolvable lookup (useRulesetStore's serveResult/serveIndexedResult,
 * useCharacterBurnerResource's updateResources), so keeping this consistent matters.
 *
 * Ability ids: 0-5 are the six stats (Attribute), 6+ are derived attributes.
 */

export const AbilityIds = {
  Will: 0 as dat.AbilityId,
  Perception: 1 as dat.AbilityId,
  Power: 2 as dat.AbilityId,
  Forte: 3 as dat.AbilityId,
  Agility: 4 as dat.AbilityId,
  Speed: 5 as dat.AbilityId,
  Steel: 6 as dat.AbilityId,
  Faith: 7 as dat.AbilityId // gated behind a required trait ("Faithful")
};

export const StockIds = {
  Dwarf: 0 as dat.StockId
};

export const SkillIds = {
  Sword: 0 as dat.SkillId, // rooted in Power/Agility
  Doctrine: 1 as dat.SkillId // rooted in Perception, General type
};

export const TraitIds = {
  Faithful: 0 as dat.TraitId, // unlocks the Faith attribute, Lifepath type, no cost
  Stoic: 1 as dat.TraitId, // General trait, cost 2
  DwarvenBeard: 2 as dat.TraitId, // Common trait for Dwarf stock
  FamilyHeirloomGranter: 3 as dat.TraitId // grants a resource, isChoice=false
};

export const ResourceTypeIds = {
  // NOTE: intentionally NOT 0 -- useCharacterBurnerResource.tsx's setFamilyHeirloomResource guards
  // with `if (!resource.type[0]) return;`, which treats a real, valid resourceTypeId of 0 as
  // falsy/missing and silently no-ops (see the dedicated bug-documentation test in
  // useCharacterBurnerResource.test.ts).
  Property: 10 as dat.ResourceTypeId,
  Relationship: 11 as dat.ResourceTypeId,
  Reputation: 12 as dat.ResourceTypeId,
  ZeroId: 0 as dat.ResourceTypeId // used only to document the falsy-zero-id bug above
};

export const ResourceIds = {
  Heirloom: 0 as dat.ResourceId,
  Relation: 1 as dat.ResourceId,
  Reputation: 2 as dat.ResourceId
};

export const LifepathIds = {
  BornDwarf: 0 as dat.LifepathId,
  Miner: 1 as dat.LifepathId
};

export const SettingIds = {
  Homestead: 0 as dat.SettingId,
  Mine: 1 as dat.SettingId
};

export const QuestionIds = {
  // NOTE: intentionally NOT id 0 -- useCharacterBurnerSpecial.tsx's refreshQuestions filters with
  // `if (!v.id || ...) return false`, which treats a real, valid id of 0 as falsy/missing and drops
  // the question outright (see the dedicated bug-documentation test in useCharacterBurnerSpecial.test.ts).
  Gated: 10 as dat.QuestionId, // gated on the Faith attribute being present
  Ungated: 11 as dat.QuestionId,
  ZeroId: 0 as dat.QuestionId // used only to document the falsy-zero-id bug above
};

function BuildAbilities(): Ability[] {
  // Matches the real ruleset's AbilityType convention (shared/db/migrations/10003_add_initial_data.sql,
  // 10007_add_abilities_data.sql): base stats are "Mental Stat"/"Physical Stat" (they don't end with
  // "Attribute" and never enter useCharacterBurnerAttribute's updateAttributes pipeline); unconditionally
  // included derived attributes are plain "Attribute"; trait-gated derived attributes (Greed, Faith, ...)
  // are "Emotional Attribute".
  const mentalStatType: [dat.AbilityTypeId, string] = [0 as dat.AbilityTypeId, "Mental Stat"];
  const physicalStatType: [dat.AbilityTypeId, string] = [1 as dat.AbilityTypeId, "Physical Stat"];
  const attributeType: [dat.AbilityTypeId, string] = [2 as dat.AbilityTypeId, "Attribute"];
  const emotionalAttributeType: [dat.AbilityTypeId, string] = [3 as dat.AbilityTypeId, "Emotional Attribute"];

  return [
    { id: AbilityIds.Will, name: "Will", abilityType: mentalStatType, hasShades: true },
    { id: AbilityIds.Perception, name: "Perception", abilityType: mentalStatType, hasShades: true },
    { id: AbilityIds.Power, name: "Power", abilityType: physicalStatType, hasShades: true },
    { id: AbilityIds.Forte, name: "Forte", abilityType: physicalStatType, hasShades: true },
    { id: AbilityIds.Agility, name: "Agility", abilityType: physicalStatType, hasShades: true },
    { id: AbilityIds.Speed, name: "Speed", abilityType: physicalStatType, hasShades: true },
    { id: AbilityIds.Steel, name: "Steel", abilityType: attributeType, hasShades: false },
    { id: AbilityIds.Faith, name: "Faith", abilityType: emotionalAttributeType, hasShades: true, requiredTraits: [TraitIds.Faithful] }
  ];
}

function BuildStocks(): Stock[] {
  return [
    {
      rulesets: null,
      id: StockIds.Dwarf,
      name: "Dwarf",
      namePlural: "Dwarves",
      stride: 6,
      settingIds: [SettingIds.Homestead, SettingIds.Mine],
      agePool: [
        { minAge: 0, mentalPool: 7, physicalPool: 14 },
        { minAge: 25, mentalPool: 10, physicalPool: 18 },
        { minAge: 50, mentalPool: 13, physicalPool: 22 }
      ]
    }
  ];
}

function BuildSkills(): Skill[] {
  const category: [dat.SkillCategoryId, string] = [0 as dat.SkillCategoryId, "Physical"];
  const generalType: [dat.SkillTypeId, string] = [0 as dat.SkillTypeId, "General"];
  const toolType = { typeId: 0 as dat.SkillToolTypeId, tool: "Sword" };

  return [
    {
      rulesets: null,
      id: SkillIds.Sword,
      name: "Sword",
      category,
      type: generalType,
      flags: { dontList: false, isMagical: false, isTraining: false },
      tool: toolType,
      roots: [[AbilityIds.Power, "Power"], [AbilityIds.Agility, "Agility"]]
    },
    {
      rulesets: null,
      id: SkillIds.Doctrine,
      name: "Doctrine",
      category,
      type: generalType,
      flags: { dontList: false, isMagical: false, isTraining: false },
      tool: toolType,
      roots: [[AbilityIds.Perception, "Perception"]]
    }
  ];
}

function BuildTraits(): Trait[] {
  const lifepathType: [dat.TraitTypeId, string] = [0 as dat.TraitTypeId, "Character"];
  const lifepathCategory: [dat.TraitCategoryId, string] = [0 as dat.TraitCategoryId, "Lifepath"];
  const generalCategory: [dat.TraitCategoryId, string] = [1 as dat.TraitCategoryId, "General"];
  const commonCategory: [dat.TraitCategoryId, string] = [2 as dat.TraitCategoryId, "Common"];

  return [
    { rulesets: null, id: TraitIds.Faithful, name: "Faithful", category: lifepathCategory, type: lifepathType, cost: null },
    { rulesets: null, id: TraitIds.Stoic, name: "Stoic", category: generalCategory, type: lifepathType, cost: 2 },
    { rulesets: null, id: TraitIds.DwarvenBeard, name: "Dwarven Beard", category: commonCategory, type: lifepathType, cost: 1, stock: [StockIds.Dwarf, "Dwarf"] },
    {
      rulesets: null, id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", category: generalCategory, type: lifepathType, cost: 1,
      grantsResources: [{ resource: ResourceIds.Heirloom, minCost: 5 }],
      grantsResourcesIsChoice: false
    }
  ];
}

function BuildResources(): Resource[] {
  return [
    {
      rulesets: null, id: ResourceIds.Heirloom, name: "Heirloom Axe", stock: [StockIds.Dwarf, "Dwarf"],
      type: [ResourceTypeIds.Property, "Property"], costs: [[5, "5D"], [10, "10D"]], modifiers: []
    },
    {
      rulesets: null, id: ResourceIds.Relation, name: "Mentor", stock: [StockIds.Dwarf, "Dwarf"],
      type: [ResourceTypeIds.Relationship, "Relationship"], costs: [[10, "important"], [15, "powerful"]], modifiers: []
    },
    {
      rulesets: null, id: ResourceIds.Reputation, name: "Guild Standing", stock: [StockIds.Dwarf, "Dwarf"],
      type: [ResourceTypeIds.Reputation, "Reputation"], costs: [[5, "1D reputation"], [10, "2D reputation"]], modifiers: []
    }
  ];
}

function BuildLifepaths(): Lifepath[] {
  return [
    {
      rulesets: null, id: LifepathIds.BornDwarf, name: "Born Dwarf", stock: [StockIds.Dwarf, "Dwarf"], setting: [SettingIds.Homestead, "Homestead"],
      years: 16,
      pools: { eitherStatPool: 2, mentalStatPool: 3, physicalStatPool: 3, generalSkillPool: 2, lifepathSkillPool: 1, traitPool: 2, resourcePoints: 5 },
      flags: { isBorn: true, isGSPMultipliedByYear: false, isLSPMultipliedByYear: false, isRPMultipliedByYear: false, getHalfGSPFromPrevLP: false, getHalfLSPFromPrevLP: false, getHalfRPFromPrevLP: false },
      skills: [SkillIds.Doctrine],
      traits: [TraitIds.Faithful, TraitIds.Stoic],
      leads: [SettingIds.Mine]
    },
    {
      rulesets: null, id: LifepathIds.Miner, name: "Miner", stock: [StockIds.Dwarf, "Dwarf"], setting: [SettingIds.Mine, "Mine"],
      years: 5,
      pools: { eitherStatPool: 1, mentalStatPool: 1, physicalStatPool: 2, generalSkillPool: 1, lifepathSkillPool: 2, traitPool: 1, resourcePoints: 10 },
      flags: { isBorn: false, isGSPMultipliedByYear: false, isLSPMultipliedByYear: false, isRPMultipliedByYear: false, getHalfGSPFromPrevLP: false, getHalfLSPFromPrevLP: false, getHalfRPFromPrevLP: false },
      skills: [SkillIds.Sword],
      traits: [TraitIds.Stoic]
    }
  ];
}

function BuildQuestions(): Question[] {
  return [
    { id: QuestionIds.Gated, name: "GATED", question: "Do you have faith?", attributes: [[AbilityIds.Faith, "Faith"]] },
    { id: QuestionIds.Ungated, name: "UNGATED", question: "Are you a dwarf?" },
    { id: QuestionIds.ZeroId, name: "ZEROID", question: "Does id 0 survive refreshQuestions's falsy check?" }
  ];
}

/**
 * Patches one fixture skill (by id) in BOTH useRulesetStore's `skills` array and its `skillsById`
 * map -- `getSkill` by id reads the Map, so a test that only overwrites the array (e.g. via
 * `useRulesetStore.setState({ skills: [...] })`) would see its change ignored by any store method
 * that looks the skill up by id (getSkill, updateSkills).
 */
export function PatchRulesetSkill(id: dat.SkillId, patch: Partial<Skill>): void {
  const state = useRulesetStore.getState();
  const skills = state.skills.map(s => s.id === id ? { ...s, ...patch } : s);
  const skillsById = new Map(state.skillsById);
  const patched = skills.find(s => s.id === id);
  if (patched) skillsById.set(id, patched);
  useRulesetStore.setState({ skills, skillsById });
}

/**
 * Seeds useRulesetStore with the fixture above -- populates both the raw arrays AND their
 * *ById maps, since getX by id reads the Map while by-name reads the array (see
 * useRulesetStore.tsx's getAbility/serveIndexedResult).
 */
export function SeedRuleset(): void {
  const abilities = BuildAbilities();
  const stocks = BuildStocks();
  const skills = BuildSkills();
  const traits = BuildTraits();
  const resources = BuildResources();
  const lifepaths = BuildLifepaths();
  const questions = BuildQuestions();

  const toIdMap = <TId, TRow extends { id: TId | null; }>(rows: TRow[]): Map<TId, TRow> =>
    new Map(rows.filter((v): v is TRow & { id: TId; } => v.id !== null).map(v => [v.id, v]));

  useRulesetStore.setState({
    abilities,
    abilitiesById: toIdMap(abilities),
    stocks,
    stocksById: toIdMap(stocks),
    skills,
    skillsById: toIdMap(skills),
    traits,
    traitsById: toIdMap(traits),
    resources,
    resourcesById: toIdMap(resources),
    lifepaths,
    lifepathsById: toIdMap(lifepaths),
    questions
  });
}
