import type { UniqueArray } from "./UniqueArray";


interface FilterLifepathsProps {
  rulesetLifepaths: Lifepath[];
  stock: [id: dat.StockId, name: string];
  age: number;
  lifepaths: Lifepath[];
  gender?: "Male" | "Female";
  attributes?: UniqueArray<dat.AbilityId, CharacterAttribute>;
  hasAttribute?: (id: dat.AbilityId) => boolean;
  hasSkillOpen?: (id: dat.SkillId) => boolean;
  hasTraitOpen?: (id: dat.TraitId) => boolean;
  hasSetting?: (id: dat.SettingId) => number;
  hasQuestionTrue?: (id: dat.QuestionId) => boolean;
  noLeads?: [id: dat.SettingId, name: string];
}

export function FilterLifepaths({ rulesetLifepaths, stock, age, lifepaths, gender, attributes, hasAttribute, hasSkillOpen, hasTraitOpen, hasSetting, hasQuestionTrue, noLeads }: FilterLifepathsProps): Lifepath[] {
  const checkLifepath = (id: dat.LifepathId): number => lifepaths.findIndex(lp => lp.id === id);
  const countLifepath = (id: dat.LifepathId): number => lifepaths.filter(lp => lp.id === id).length;

  const checkRequirementBlock = (lifepath: Lifepath, block: LifepathRequirementBlock): boolean => {
    const itemResults = block.items.map((item): boolean => {
      // TODO: item.forCompanion is not evaluated: doing so correctly would require tracking the
      // companion's own attributes/skills/traits separately from the character, which isn't modeled
      // (special.companionLifepath/companionSkills only record which lifepath/skills a companion has).

      if ("isUnique" in item) return lifepath.id !== null && checkLifepath(lifepath.id) === -1;
      else if ("isSettingEntry" in item) return hasSetting !== undefined && lifepath.setting[0] !== null ? hasSetting(lifepath.setting[0]) === 0 : true;
      else if ("minLpIndex" in item && item.minLpIndex !== undefined) return lifepaths.length >= item.minLpIndex;
      else if ("maxLpIndex" in item && item.maxLpIndex !== undefined) return lifepaths.length <= item.maxLpIndex;
      else if ("minYears" in item && item.minYears !== undefined) return age >= item.minYears;
      else if ("maxYears" in item && item.maxYears !== undefined) return age <= item.maxYears;
      else if ("gender" in item) {
        if (gender !== undefined) return item.gender === gender;
        else return true;
      }
      // TODO: oldestBy is not evaluated: "must be oldest in the party by N years" requires knowing
      // other party members' ages, which needs a campaign/party feature that doesn't exist in this
      // single-character burner. Always treated as satisfied until that feature exists.
      else if ("oldestBy" in item) return true;
      else if (attributes !== undefined && "attribute" in item && item.attribute !== undefined) {
        const exp = attributes.find(item.attribute[0])?.exponent;
        if (item.min !== undefined) return exp !== undefined && exp >= item.min;
        else if (item.max !== undefined) return exp !== undefined && exp <= item.max;
        else if (hasAttribute !== undefined) return hasAttribute(item.attribute[0]);
        else return true;
      }
      else if ("skill" in item && item.skill !== undefined) {
        if (hasSkillOpen !== undefined) return hasSkillOpen(item.skill[0]);
        else return true;
      }
      else if ("trait" in item && item.trait !== undefined) {
        if (hasTraitOpen !== undefined) return hasTraitOpen(item.trait[0]);
        else return true;
      }
      else if ("lifepath" in item && item.lifepath !== undefined && block.fulfillmentAmount !== null) return countLifepath(item.lifepath[0]) >= block.fulfillmentAmount;
      else if ("setting" in item && item.setting !== undefined && block.fulfillmentAmount !== null) {
        if (hasSetting !== undefined) return hasSetting(item.setting[0]) >= block.fulfillmentAmount;
        else return true;
      }
      else if ("question" in item && item.question !== undefined) {
        if (hasQuestionTrue !== undefined) return hasQuestionTrue((item.question as [dat.QuestionId, unknown])[0]);
        else return true;
      }
      else throw new Error(`Unidentified requirement block item: ${item.logicType.toString()}`);
    });

    if (block.logicType[1] === "OR") return itemResults.some(v => v);
    else if (block.logicType[1] === "AND") return itemResults.every(v => v);
    else if (block.logicType[1] === "NOT") return !itemResults.every(v => !v);
    return false;
  };

  const isSettingEntryLifepath = (lp: Lifepath): boolean =>
    (lp.requirements ?? []).some(block => block.items.some(item => "isSettingEntry" in item));

  let possibleLifepaths: Lifepath[] = [];

  if (lifepaths.length === 0) possibleLifepaths = rulesetLifepaths.filter(lp => lp.flags.isBorn === true && stock[0] === lp.stock[0]);
  else {
    const lastLifepath = lifepaths[lifepaths.length - 1];
    const possibleSettingIds = lastLifepath.leads !== undefined ? [lastLifepath.setting[0], ...lastLifepath.leads] : [lastLifepath.setting[0]];

    possibleLifepaths =
      possibleSettingIds
        .map(settingId => {
          const settingLifepaths = rulesetLifepaths.filter(x => stock[0] === x.stock[0] && x.setting[0] === settingId && x.flags.isBorn !== true);
          const hasUntakenEntry = settingId !== null && (hasSetting === undefined || hasSetting(settingId) === 0) && settingLifepaths.some(isSettingEntryLifepath);
          return hasUntakenEntry ? settingLifepaths.filter(isSettingEntryLifepath) : settingLifepaths;
        })
        .flat()
        .filter(lifepath => {
          if (lifepath.requirements !== undefined) {
            const blockResults = lifepath.requirements.map(block => ({ mustFulfill: block.mustFulfill, result: checkRequirementBlock(lifepath, block) }));
            const musts = blockResults.every(v => v.mustFulfill === true && v.result);
            const atLeastOne = blockResults.some(v => v.result);
            return musts && atLeastOne;
          }
          return true;
        });
  }

  if (noLeads !== undefined) possibleLifepaths = possibleLifepaths.filter(lp => lp.setting[0] === noLeads[0]);

  return possibleLifepaths;
}
