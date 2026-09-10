import { Box, Grid, Text } from "@mantine/core";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { UniqueArray } from "../../../../../utils/UniqueArray";
import { PopoverLink } from "../../../../Shared/PopoverLink";


export function RandomLifepathsLists({ chosenLifepaths }: { chosenLifepaths: Lifepath[]; }): React.JSX.Element {
  const { getSkill, getTrait } = useRulesetStore();

  const mandatorySkills = new UniqueArray(chosenLifepaths.map(lp => lp.skills !== undefined ? [getSkill(lp.skills[0])] : []).flat());
  const lifepathSkills = new UniqueArray(chosenLifepaths.map(lp => lp.skills !== undefined ? lp.skills.filter(skillId => !mandatorySkills.has(skillId)).map(getSkill) : []).flat());

  const mandatoryTraits = new UniqueArray(chosenLifepaths.map(lp => lp.traits !== undefined ? [getTrait(lp.traits[0])] : []).flat());
  const lifepathTraits = new UniqueArray(chosenLifepaths.map(lp => lp.traits !== undefined ? lp.traits.filter(traitId => !mandatoryTraits.has(traitId)).map(getTrait) : []).flat());

  return (
    <Grid columns={1} gap="xs">
      <Grid.Col span={1}>
        <Text mr={4} fw={700} style={{ display: "inline-block" }}>Mandatory Skills:</Text>

        {mandatorySkills.length > 0
          ? mandatorySkills.map((skill, i) =>
            <PopoverLink key={skill.id} data={skill} hasComma={i < mandatorySkills.length - 1} />
          )
          : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        <Text mr={4} fw={700} style={{ display: "inline-block" }}>Skills:</Text>

        {lifepathSkills.length > 0
          ? lifepathSkills.map((skill, i) =>
            <PopoverLink key={skill.id} data={skill} hasComma={i < lifepathSkills.length - 1} />
          )
          : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        <Text mr={4} fw={700} style={{ display: "inline-block" }}>Mandatory Traits:</Text>

        {mandatoryTraits.length > 0
          ? mandatoryTraits.map((trait, i) =>
            <PopoverLink key={trait.id} data={trait} hasComma={i < mandatoryTraits.length - 1} />
          )
          : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        <Text mr={4} fw={700} style={{ display: "inline-block" }}>Traits:</Text>

        {lifepathTraits.length > 0
          ? lifepathTraits.map((trait, i) =>
            <PopoverLink key={trait.id} data={trait} hasComma={i < lifepathTraits.length - 1} />
          )
          : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>
    </Grid>
  );
}
