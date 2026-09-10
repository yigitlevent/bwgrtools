import { Anchor, Box, Divider, Grid, Group, Popover, Text } from "@mantine/core";
import { memo } from "react";

import { LifepathBox } from "../Tools/LifepathLists/LifepathBox";


function GetSkillRestrictionString(skill: Skill): string {
  if (skill.restriction?.onlyStock !== undefined) {
    const attribute = (skill.restriction.onlyWithAbility !== undefined) ? ` with ${skill.restriction.onlyWithAbility[1]} ` : " ";
    const type = (skill.restriction.onlyAtBurn === true) ? " in character burning" : "";
    return `${skill.restriction.onlyStock[1]}${attribute}only${type}.`;
  }

  return "N/A";
}

function SkillPop({ skill }: { skill: Skill; }): React.JSX.Element {
  return (
    <Grid gap={4} columns={2}>
      <Grid.Col span={2}>
        <Text fw={700} size="lg">{skill.name}</Text>
        <Divider />
      </Grid.Col>

      {skill.roots !== undefined
        ? (
          <Grid.Col span={{ base: 2, md: 1 }}>
            <Group gap={4} justify="start">
              <Text fw={700}>Root:</Text>
              <Text>{skill.roots.map(v => v[1]).join("/")}</Text>
            </Group>
          </Grid.Col>
        )
        : null}

      <Grid.Col span={{ base: 2, md: 1 }}>
        <Group gap={4} justify="start">
          <Text fw={700}>Type:</Text>
          <Text>{skill.type[1]}</Text>
        </Group>
      </Grid.Col>

      <Grid.Col span={2}>
        <Group gap={4} justify="start">
          <Text fw={700}>Tools:</Text>
          <Text>{skill.tool.tool}</Text>
          <Text>{skill.tool.description !== undefined && skill.tool.description.length > 0 ? `(${skill.tool.description})` : ""}</Text>
        </Group>
      </Grid.Col>

      <Grid.Col span={2}>
        <Group gap={4} justify="start">
          <Text fw={700}>Restrictions:</Text>
          <Text>{GetSkillRestrictionString(skill)}</Text>
        </Group>
      </Grid.Col>

      {skill.description !== undefined && skill.description.length > 0
        ? (
          <Grid.Col span={2}>
            <Divider mb={4} />
            {skill.description.split("<br>").map(v => <Text key={v}>{v}</Text>)}
          </Grid.Col>
        )
        : null}
    </Grid>
  );
}

function TraitPop({ trait }: { trait: Trait; }): React.JSX.Element {
  return (
    <Grid gap={4} columns={2}>
      <Grid.Col span={3}>
        <Text fw={700} size="lg">{trait.name}</Text>
        <Divider />
      </Grid.Col>

      <Grid.Col span={{ base: 3, md: 1 }}>
        <Group gap={4} justify="start">
          <Text fw={700}>Type:</Text>
          <Text>{trait.type[1]}</Text>
        </Group>
      </Grid.Col>

      {trait.cost !== 0
        ? (
          <Grid.Col span={{ base: 3, md: 1 }}>
            <Group gap={4} justify="start">
              <Text fw={700}>Cost:</Text>
              <Text>{trait.cost}</Text>
            </Group>
          </Grid.Col>
        )
        : null}

      {trait.stock !== undefined
        ? (
          <Grid.Col span={{ base: 3, md: 1 }}>
            <Group gap={4} justify="start">
              <Text fw={700}>Stock:</Text>
              <Text>{trait.stock[1]}</Text>
            </Group>
          </Grid.Col>
        )
        : (
          <Grid.Col span={{ base: 3, md: 1 }}>
            <Group gap={4} justify="start">
              <Text fw={700}>Stock:</Text>
              <Text>Any</Text>
            </Group>
          </Grid.Col>
        )}

      {trait.description !== undefined && trait.description.length > 0
        ? (
          <Grid.Col span={2}>
            <Divider mb={4} />
            {trait.description.split("<br>").map(v => <Text key={v}>{v}</Text>)}
          </Grid.Col>
        )
        : null}
    </Grid>
  );
}

export const PopoverLink = memo(({ data, noColor, hasComma }: { data: Skill | Trait | Lifepath; noColor?: boolean; hasComma?: boolean; }): React.JSX.Element => {
  return (
    <Box style={{ cursor: "var(--cursor-pointer)", width: "max-content", display: "inline-block" }}>
      <Popover withArrow position="bottom-start">
        <Popover.Target>
          <Box>
            <Anchor underline="hover" c={noColor === true ? "var(--mantine-color-text)" : undefined} style={{ cursor: "var(--cursor-pointer)" }}>
              {data.name}
            </Anchor>

            {hasComma === true
              ? <Box mr={4} style={{ display: "inline-block" }}>,</Box>
              : null}
          </Box>
        </Popover.Target>

        <Popover.Dropdown style={{ maxWidth: "400px" }}>
          {"pools" in data
            ? <LifepathBox lifepath={data} noBorder />
            : "tool" in data ? <SkillPop skill={data} /> : <TraitPop trait={data} />}
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
});
