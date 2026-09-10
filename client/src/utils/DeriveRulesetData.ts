export interface RulesetData {
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
}

export interface DerivedRulesetData {
  abilities: Ability[];
  abilitiesById: Map<dat.AbilityId, Ability>;
  abilityTypes: string[];

  stocks: Stock[];
  stocksById: Map<dat.StockId, Stock>;
  settings: Setting[];
  settingsById: Map<dat.SettingId, Setting>;

  skills: Skill[];
  skillsById: Map<dat.SkillId, Skill>;
  skillCategories: string[];
  skillTypes: string[];

  traits: Trait[];
  traitsById: Map<dat.TraitId, Trait>;
  traitCategories: string[];
  traitTypes: string[];

  lifepaths: Lifepath[];
  lifepathsById: Map<dat.LifepathId, Lifepath>;

  resources: Resource[];
  resourcesById: Map<dat.ResourceId, Resource>;
  resourceTypes: string[];

  spellFacets: SpellFacets;
  spellAltFacets: AltSpellFacets;

  dowActions: DoWAction[];
  racActions: RaCAction[];
  fightActions: FightAction[];

  practices: Practice[];
  questions: Question[];
}

function ToIdMap<TId, TRow extends { id: TId | null; }>(rows: TRow[]): Map<TId, TRow> {
  return new Map(rows.filter((v): v is TRow & { id: TId; } => v.id !== null).map(v => [v.id, v]));
}

// Derives the *ById maps and category/type lists from raw ruleset data.
// Used both right after a fetch and when rehydrating persisted data on load.
export function DeriveRulesetData(data: RulesetData): DerivedRulesetData {
  const abilities = data.abilities;
  const abilityTypes = [...data.abilities.reduce((a, v) => a.add(v.abilityType[1]), new Set<string>())];
  const stocks = data.stocks;
  const settings = data.settings;
  const skills = data.skills;
  const skillCategories = [...data.skills.reduce((a, v) => a.add(v.category[1]), new Set<string>())];
  const skillTypes = [...data.skills.reduce((a, v) => a.add(v.type[1]), new Set<string>())];

  const traits = data.traits;
  const traitCategories = [...data.traits.reduce((a, v) => a.add(v.category[1]), new Set<string>())];
  const traitTypes = [...data.traits.reduce((a, v) => a.add(v.type[1]), new Set<string>())];

  const lifepaths =
    data.lifepaths
      .map(lifepath => {
        const lp = { ...lifepath };
        if (lifepath.leads !== undefined) lp.leads = lifepath.leads.filter(leadId => settings.some(x => x.id === leadId));
        if (lifepath.skills !== undefined) lp.skills = lifepath.skills.filter(skillId => skills.some(x => x.id === skillId));
        if (lifepath.traits !== undefined) lp.traits = lifepath.traits.filter(traitId => traits.some(x => x.id === traitId));

        if (lp.requirements !== undefined) {
          lp.requirements =
            lp.requirements
              .map(rb => {
                return {
                  ...rb,
                  items: rb.items
                    .filter(item => {
                      const setting = item.setting;
                      const lifepath = item.lifepath;
                      const skill = item.skill;
                      const trait = item.trait;
                      if (setting !== undefined) return settings.some(x => x.id === setting[0]);
                      else if (lifepath !== undefined) return data.lifepaths.some(x => x.id === lifepath[0]);
                      else if (skill !== undefined) return skills.some(x => x.id === skill[0]);
                      else if (trait !== undefined) return traits.some(x => x.id === trait[0]);
                      return true;
                    })
                };
              });
        }

        return lp;
      });

  return {
    abilities,
    abilitiesById: ToIdMap<dat.AbilityId, Ability>(abilities),
    abilityTypes,

    stocks,
    stocksById: ToIdMap<dat.StockId, Stock>(stocks),
    settings,
    settingsById: ToIdMap<dat.SettingId, Setting>(settings),

    skills,
    skillsById: ToIdMap<dat.SkillId, Skill>(skills),
    skillCategories,
    skillTypes,

    traits,
    traitsById: ToIdMap<dat.TraitId, Trait>(traits),
    traitCategories,
    traitTypes,

    lifepaths,
    lifepathsById: ToIdMap<dat.LifepathId, Lifepath>(lifepaths),

    resources: data.resources,
    resourcesById: ToIdMap<dat.ResourceId, Resource>(data.resources),
    resourceTypes: [...data.resources.reduce((a, v) => a.add(v.type[1]), new Set<string>())],

    spellFacets: data.spellFacets,
    spellAltFacets: data.spellAltFacets,

    dowActions: data.dowActions,
    racActions: data.racActions,
    fightActions: data.fightActions,

    practices: data.practices,
    questions: data.questions
  };
}
