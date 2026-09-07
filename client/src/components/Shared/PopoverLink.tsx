import { Anchor, Box, Grid, Popover, Text } from "@mantine/core";
import { memo } from "react";


function GetSkillRestrictionString(skill: Skill): string {
  if (skill.restriction?.onlyStock) {
    const attribute = (skill.restriction.onlyWithAbility) ? ` with ${skill.restriction.onlyWithAbility[1]} ` : " ";
    const type = (skill.restriction.onlyAtBurn) ? " in character burning" : "";
    return `${skill.restriction.onlyStock[1]}${attribute}only${type}.`;
  }

  return "N/A";
}

function SkillPop({ skill }: { skill: Skill; }): React.JSX.Element {
  return (
    <Grid gap="xs" columns={2}>
      <Grid.Col span={2}>
        <Text fw={700} size="lg">{skill.name}</Text>
      </Grid.Col>

      {skill.roots ? (
        <Grid.Col span={{ base: 2, md: 1 }}>
          <Text size="xs">
            Root:
            {skill.roots.map(v => v[1]).join("/")}
          </Text>
        </Grid.Col>
      ) : null}

      <Grid.Col span={{ base: 2, md: 1 }}>
        <Text size="xs">
          Type:
          {skill.type[1]}
        </Text>
      </Grid.Col>

      <Grid.Col span={2}>
        <Text size="xs">
          Tools:
          {skill.tool.tool}
          {skill.tool.description ? ` ${skill.tool.description}` : ""}
        </Text>
      </Grid.Col>

      <Grid.Col span={2}>
        <Text size="xs">
          Restrictions:
          {GetSkillRestrictionString(skill)}
        </Text>
      </Grid.Col>

      {skill.description ? (
        <Grid.Col span={2}>
          {skill.description.split("<br>").map(v => <Text key={v} size="sm">{v}</Text>)}
        </Grid.Col>
      ) : null}
    </Grid>
  );
}

function TraitPop({ trait }: { trait: Trait; }): React.JSX.Element {
  return (
    <Grid gap="xs" columns={3}>
      <Grid.Col span={3}>
        <Text fw={700} size="lg">{trait.name}</Text>
      </Grid.Col>

      <Grid.Col span={{ base: 3, md: 1 }}>
        <Text size="xs">
          Type:
          {trait.type[1]}
        </Text>
      </Grid.Col>

      {trait.cost !== 0 ? (
        <Grid.Col span={{ base: 3, md: 1 }}>
          <Text size="xs">
            Cost:
            {" "}
            {trait.cost}
          </Text>
        </Grid.Col>
      ) : null}

      {trait.stock ? (
        <Grid.Col span={{ base: 3, md: 1 }}>
          <Text size="xs">
            Stock:
            {trait.stock[1]}
          </Text>
        </Grid.Col>
      ) : (
        <Grid.Col span={{ base: 3, md: 1 }}>
          <Text size="xs">Stock: Any</Text>
        </Grid.Col>
      )}

      {trait.description ? (
        <Grid.Col span={3}>
          {trait.description.split("<br>").map(v => <Text key={v} size="sm" style={{ textIndent: "8px" }}>{v}</Text>)}
        </Grid.Col>
      ) : null}
    </Grid>
  );
}

export const PopoverLink = memo(({ data, noColor }: { data: Skill | Trait; noColor?: boolean; }): React.JSX.Element => {
  return (
    <Box style={{ cursor: "var(--cursor-pointer)", width: "max-content", display: "inline-block" }}>
      <Popover withArrow position="bottom-start">
        <Popover.Target>
          <Anchor underline="hover" c={noColor ? "var(--mantine-color-text)" : undefined} style={{ cursor: "var(--cursor-pointer)" }}>
            {data.name}
          </Anchor>
        </Popover.Target>

        <Popover.Dropdown style={{ maxWidth: "400px" }}>
          {"flags" in data ? <SkillPop skill={data} /> : <TraitPop trait={data} />}
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
});
