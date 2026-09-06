import { Button, Grid, Group, Title, Text } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerSkillStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { AbilityButton } from "../../../Shared/AbilityButton";
import { BlockSkillPopover } from "../BlockText";

import type { UniqueArrayItem } from "../../../../utils/UniqueArray";


function Skill({ skill, remove }: { skill: UniqueArrayItem<dat.SkillId, CharacterSkill>; remove?: (skillId: dat.SkillId) => void; }): React.JSX.Element {
  const { getSkill, openSkill, modifySkillExponent } = useCharacterBurnerSkillStore();
  const skillPoints = getSkill(skill.id);

  return (
    <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
      <Grid columns={5} justify="flex-start" align="center" style={{ background: "#353535", borderRadius: 1, marginTop: "8px" }}>
        <BlockSkillPopover
          skill={[skill.id, skill.name]}
          checkbox={{ checked: skill.isOpen !== "no", disabled: skill.type === "Mandatory", onClick: () => { openSkill(skill.id); } }}
          deleteCallback={remove ? () => { remove(skill.id); } : undefined}
        />

        <Grid.Col span="content">
          <Group gap={0}>
            <AbilityButton disabled>
              {skillPoints.shade}
            </AbilityButton>

            <AbilityButton onClick={() => { modifySkillExponent(skill.id); }} onContextMenu={() => { modifySkillExponent(skill.id, true); }} disabled={!skill.isOpen}>
              {skillPoints.exponent}
            </AbilityButton>
          </Group>
        </Grid.Col>
      </Grid>
    </Grid.Col>
  );
}

function MandatorySkills(): React.JSX.Element {
  const { skills } = useCharacterBurnerSkillStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "12px 0 0 24px" }}>Mandatory</Title>
      </Grid.Col>

      <Fragment>
        {skills
          .filter(s => s.type === "Mandatory")
        // TODO: re-enable .filter(v => !SpecialSkills.includes(v as SkillPath))
          .map((skill, i) => <Skill key={i} skill={skill} />)}
      </Fragment>
    </Fragment>
  );
}

function LifepathSkills(): React.JSX.Element {
  const { skills } = useCharacterBurnerSkillStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "12px 0 0 24px" }}>Lifepath</Title>
      </Grid.Col>

      <Fragment>
        {skills
          .filter(s => s.type === "Lifepath")
        // TODO: re-enable .filter(v => !SpecialSkills.includes(v as SkillPath))
          .map((skill, i) => <Skill key={i} skill={skill} />)}
      </Fragment>
    </Fragment>
  );
}

function GeneralSkills({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { skills, removeGeneralSkill } = useCharacterBurnerSkillStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "12px 0 0 24px" }}>General</Title>
      </Grid.Col>

      <Fragment>
        {skills
          .filter(s => s.type === "General")
        // TODO: re-enable .filter(v => !SpecialSkills.includes(v as SkillPath))
          .map((skill, i) => <Skill key={i} skill={skill} remove={removeGeneralSkill} />)}
      </Fragment>

      <Button variant="outline" style={{ margin: "10px" }} onClick={() => { openModal("geSk"); }}>Add General Skill</Button>
    </Fragment>
  );
}

export function Skills({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { skills, getSkillPools } = useCharacterBurnerSkillStore();

  const skillPools = getSkillPools();

  const generalText = `General Skill Points / Total: ${skillPools.general.total.toString()}, Remaining: ${skillPools.general.remaining.toString()}`;
  const lifepathText = `Lifepath Skill Points / Total: ${skillPools.lifepath.total.toString()}, Remaining: ${skillPools.lifepath.remaining.toString()}`;

  return (
    <Grid columns={6} align="center" gap="xl" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Skills</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 5 }}>
        <Text>{generalText}</Text>
        <Text>{lifepathText}</Text>
      </Grid.Col>

      {skills.existsAny("type", "Mandatory") > 0 ? <MandatorySkills /> : null}
      {skills.existsAny("type", "Lifepath") > 0 ? <LifepathSkills /> : null}
      <GeneralSkills openModal={openModal} />
    </Grid>
  );
}
