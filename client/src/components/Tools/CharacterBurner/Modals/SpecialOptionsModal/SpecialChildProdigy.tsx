import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerSkillStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialChildProdigy(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { skills, hasSkillOpen } = useCharacterBurnerSkillStore();
  const { special, modifyChildProdigyStat, modifyChildProdigyShiftedSkill } = useCharacterBurnerMiscStore();

  if (!hasTraitOpenByName("Child Prodigy")) return <Fragment />;

  const statOptions = ruleset.abilities
    .filter((a): a is Ability & { id: dat.AbilityId; name: string; } => a.id !== null && (a.name === "Perception" || a.name === "Will"))
    .map(a => ({ value: a.id.toString(), label: a.name }));

  const skillOptions = skills.filter(s => hasSkillOpen(s.id)).map(s => ({ value: s.id.toString(), label: s.name }));

  const mode = special.childProdigyStat !== undefined ? "stat" : special.childProdigyShiftedSkill !== undefined ? "skill" : null;

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Child Prodigy</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Bonus Type"
          value={mode}
          data={[{ value: "stat", label: "+3D Stat" }, { value: "skill", label: "Shade-Shift Skill" }]}
          onChange={v => {
            if (v === "stat") modifyChildProdigyStat(statOptions[0] ? Number(statOptions[0].value) as dat.AbilityId : undefined);
            else if (v === "skill") modifyChildProdigyShiftedSkill(skillOptions[0] ? Number(skillOptions[0].value) as dat.SkillId : undefined);
          }}
          size="sm"
        />
      </Grid.Col>

      {mode === "stat" ? (
        <Grid.Col span={2}>
          <Select
            label="Chosen Stat"
            value={special.childProdigyStat?.toString() ?? null}
            data={statOptions}
            onChange={v => { modifyChildProdigyStat(v ? Number(v) as dat.AbilityId : undefined); }}
            allowDeselect={false}
            size="sm"
          />
        </Grid.Col>
      ) : null}

      {mode === "skill" ? (
        <Grid.Col span={2}>
          <Select
            label="Chosen Skill"
            value={special.childProdigyShiftedSkill?.toString() ?? null}
            data={skillOptions}
            onChange={v => { modifyChildProdigyShiftedSkill(v ? Number(v) as dat.SkillId : undefined); }}
            allowDeselect={false}
            size="sm"
          />
        </Grid.Col>
      ) : null}
    </Fragment>
  );
}
