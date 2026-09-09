import { Button, Grid, Group, Title, Text, Paper, Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
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
      <Paper shadow="xs" radius={0} p={8} withBorder>
        <Group justify="space-between" gap={0}>
          <BlockSkillPopover
            skill={[skill.id, skill.name]}
            checkbox={{ checked: skill.isOpen !== "no", disabled: skill.type === "Mandatory", onToggle: () => { openSkill(skill.id); } }}
            deleteCallback={remove ? () => { remove(skill.id); } : undefined}
          />

          <Group gap={0}>
            <AbilityButton disabled>
              {skillPoints.shade}
            </AbilityButton>

            <AbilityButton onClick={() => { modifySkillExponent(skill.id); }} onContextMenu={() => { modifySkillExponent(skill.id, true); }} disabled={!skill.isOpen}>
              {skillPoints.exponent}
            </AbilityButton>
          </Group>
        </Group>
      </Paper>
    </Grid.Col>
  );
}

function SkillBlock({ title, skills, remove, addButton }: {
  title: string;
  skills: UniqueArrayItem<dat.SkillId, CharacterSkill>[];
  remove?: (skillId: dat.SkillId) => void;
  addButton?: { label: string; onClick: () => void; };
}): React.JSX.Element {
  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>{title}</Title>
      </Grid.Col>

      <Fragment>
        {skills.map(skill => <Skill key={skill.id} skill={skill} remove={remove} />)}
      </Fragment>

      {addButton ? <Button variant="outline" style={{ margin: "10px" }} onClick={addButton.onClick}>{addButton.label}</Button> : null}
    </Fragment>
  );
}

export function Skills({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { skills, removeGeneralSkill, getSkillPools } = useCharacterBurnerSkillStore();

  const skillPools = getSkillPools();

  const generalText = `General Skill Points / Total: ${skillPools.general.total.toString()}, Remaining: ${skillPools.general.remaining.toString()}`;
  const lifepathText = `Lifepath Skill Points / Total: ${skillPools.lifepath.total.toString()}, Remaining: ${skillPools.lifepath.remaining.toString()}`;

  return (
    <Grid columns={6} align="center" mb="xl">
      <Grid.Col span={6}>
        <Group gap={4}>
          <Title order={4}>Skills</Title>

          <Tooltip
            multiline
            w={320}
            color="gray"
            label="The letter is the skill's shade (Black/Grey/White, inherited from its root stats). Click the number to raise a skill's exponent, right-click (or press and hold) to lower it."
          >
            <Info size={14} />
          </Tooltip>
        </Group>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 5 }}>
        <Text>{generalText}</Text>
        <Text>{lifepathText}</Text>
      </Grid.Col>

      {skills.existsAny("type", "Mandatory") > 0 ? <SkillBlock title="Mandatory" skills={skills.filter(s => s.type === "Mandatory")} /> : null}
      {skills.existsAny("type", "Lifepath") > 0 ? <SkillBlock title="Lifepath" skills={skills.filter(s => s.type === "Lifepath")} /> : null}

      <SkillBlock
        title="General"
        skills={skills.filter(s => s.type === "General")}
        remove={removeGeneralSkill}
        addButton={{ label: "Add General Skill", onClick: () => { openModal("geSk"); } }}
      />
    </Grid>
  );
}
