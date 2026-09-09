import { Grid, MultiSelect, Select, Text } from "@mantine/core";
import { Fragment, useCallback, useEffect, useState } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSkillStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { RecordGet } from "../../../../../utils/RecordGet";


export function SpecialSkills(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { lifepaths } = useCharacterBurnerLifepathStore();
  const { skills } = useCharacterBurnerSkillStore();
  const { special, resetSkillSubskills, modifySkillSubskills } = useCharacterBurnerSpecialStore();
  const { hasAttribute } = useCharacterBurnerAttributeStore();
  const [specialSkillIds, setSpecialSkillIds] = useState<dat.SkillId[]>([]);

  const getSpecialSkillIds = useCallback((lps: Lifepath[]): dat.SkillId[] => {
    const ids = new Set<dat.SkillId>();

    lps.forEach(lp => {
      (lp.skills ?? []).forEach(skillId => {
        const rulesetSkill = ruleset.getSkill(skillId);
        if (rulesetSkill.name === "Any Skill" || rulesetSkill.name === "Any Wise" || rulesetSkill.subskillIds !== undefined) ids.add(skillId);
      });
    });

    return [...ids];
  }, [ruleset]);

  useEffect(() => {
    setSpecialSkillIds(getSpecialSkillIds(lifepaths));
  }, [getSpecialSkillIds, lifepaths]);

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

        const chosenForThis = RecordGet(special.chosenSubskills, charSkillId) ?? [];
        const isTakenElsewhere = (id: dat.SkillId): boolean => skills.has(id) && !chosenForThis.includes(id);

        if (skill.name === "Any Skill") {
          subskills = ruleset.skills.filter(s =>
            s.id !== null
            && !isTakenElsewhere(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock !== undefined ? s.restriction.onlyStock[0] === stock[0] : true))
            && (s.restriction?.onlyWithAbility !== undefined ? hasAttribute(s.restriction.onlyWithAbility[0]) : true)
            && s.flags.dontList !== true
          );
        }
        else if (skill.name === "Any Wise") {
          subskills = ruleset.skills.filter(s =>
            s.id !== null
            && !isTakenElsewhere(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock !== undefined ? s.restriction.onlyStock[0] === stock[0] : true))
            && (s.restriction?.onlyWithAbility !== undefined ? hasAttribute(s.restriction.onlyWithAbility[0]) : true)
            && s.category[1] === "Wise"
            && s.flags.dontList !== true
          );
        }
        else if (subskillIds !== undefined) {
          subskills = ruleset.skills.filter(s =>
            s.id !== null
            && !isTakenElsewhere(s.id)
            && subskillIds.includes(s.id)
            && (s.stock === stock || (s.restriction?.onlyStock !== undefined ? s.restriction.onlyStock[0] === stock[0] : true))
            && (s.restriction?.onlyWithAbility !== undefined ? hasAttribute(s.restriction.onlyWithAbility[0]) : true)
          );
        }

        const sortedSubskills = subskills.sort((a, b) => {
          const categoryComparison = a.category[1].localeCompare(b.category[1]);
          return categoryComparison !== 0 ? categoryComparison : (a.name ?? "").localeCompare(b.name ?? "");
        });
        const subskillData = sortedSubskills.map(s => ({ value: s.id?.toString() ?? "", label: s.name ?? "" }));

        return (
          <Fragment key={i}>
            <Grid.Col span={1}>
              <Text>
                {skill.name}
                {" "}
                skill
              </Text>
            </Grid.Col>

            <Grid.Col span={2}>
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
                  onChange={v => { modifySkillSubskills(charSkillId, v !== null ? [Number(v) as dat.SkillId] : null, canSelectMultiple); }}
                />
              ) : null}
            </Grid.Col>
          </Fragment>
        );
      })}
    </Fragment>
  );
}
