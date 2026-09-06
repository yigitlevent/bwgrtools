import { MultiSelect, Select } from "@mantine/core";
import { Fragment, useCallback, useEffect, useState } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerSkillStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";

import type { UniqueArray } from "../../../../../utils/UniqueArray";


export function SpecialSkills(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { skills } = useCharacterBurnerSkillStore();
  const { special, resetSkillSubskills, modifySkillSubskills } = useCharacterBurnerMiscStore();
  const { hasAttribute } = useCharacterBurnerAttributeStore();
  const [specialSkillIds, setSpecialSkillIds] = useState<dat.SkillId[]>([]);

  const getSpecialSkillIds = useCallback((characterSkills: UniqueArray<dat.SkillId, CharacterSkill>): dat.SkillId[] => {
    return characterSkills
      .filter(charSkill => {
        const rulesetSkill = ruleset.getSkill(charSkill.id);
        return charSkill.name === "Any Skill"
          || charSkill.name === "Any Wise"
          || rulesetSkill.subskillIds !== undefined;
      })
      .map(charSkill => charSkill.id);
  }, [ruleset]);

  useEffect(() => {
    setSpecialSkillIds(getSpecialSkillIds(skills));
  }, [getSpecialSkillIds, skills]);

  useEffect(() => {
    resetSkillSubskills(specialSkillIds);
  }, [resetSkillSubskills, specialSkillIds]);

  return (
    <Fragment>
      {specialSkillIds.map((charSkillId, i) => {
        const skill = ruleset.getSkill(charSkillId);
        const canSelectMultiple = skill.name === "Appropriate Weapons";

        const subskillIds = skill.subskillIds;
        let subskills: Skill[] = [];

        if (skill.name === "Any Skill") {
          subskills = ruleset.skills.filter(s =>
            s.id
            && !skills.has(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock ? s.restriction.onlyStock[0] === stock[0] ? true : false : true))
            && (s.restriction?.onlyWithAbility ? hasAttribute(s.restriction.onlyWithAbility[0]) ? true : false : true)
            && !s.flags.dontList
          );
        }
        else if (skill.name === "Any Wise") {
          subskills = ruleset.skills.filter(s =>
            s.id
            && !skills.has(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock ? s.restriction.onlyStock[0] === stock[0] ? true : false : true))
            && (s.restriction?.onlyWithAbility ? hasAttribute(s.restriction.onlyWithAbility[0]) ? true : false : true)
            && s.category[1] === "Wise"
            && !s.flags.dontList
          );
        }
        else if (subskillIds) {
          subskills = ruleset.skills.filter(s =>
            s.id
            && !skills.has(s.id)
            && subskillIds.includes(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock ? s.restriction.onlyStock[0] === stock[0] ? true : false : true))
            && (s.restriction?.onlyWithAbility ? hasAttribute(s.restriction.onlyWithAbility[0]) ? true : false : true)
          );
        }

        const sortedSubskills = subskills.sort((a, b) => a.category[1].localeCompare(b.category[1]) || (a.name ?? "").localeCompare(b.name ?? ""));
        const subskillData = sortedSubskills.map(s => ({ value: s.id?.toString() ?? "", label: s.name ?? "" }));

        return (
          <Fragment key={i}>
            {charSkillId in special.chosenSubskills ? canSelectMultiple ? (
              <MultiSelect
                label="Chosen Skills"
                value={special.chosenSubskills[charSkillId].map(id => id.toString())}
                data={subskillData}
                onChange={v => { modifySkillSubskills(charSkillId, v.map(id => Number(id) as dat.SkillId), canSelectMultiple); }}
              />
            ) : (
              <Select
                label="Chosen Skill"
                value={special.chosenSubskills[charSkillId][0]?.toString() ?? null}
                data={subskillData}
                onChange={v => { modifySkillSubskills(charSkillId, v ? [Number(v) as dat.SkillId] : null, canSelectMultiple); }}
              />
            ) : null}
          </Fragment>
        );
      })}
    </Fragment>
  );
}
