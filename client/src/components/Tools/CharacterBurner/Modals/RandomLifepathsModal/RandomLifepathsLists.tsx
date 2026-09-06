import { Box, Grid, Paper } from "@mantine/core";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { UniqueArray } from "../../../../../utils/UniqueArray";
import { PopoverLink } from "../../../../Shared/PopoverLink";


export function RandomLifepathsLists({ chosenLifepaths }: { chosenLifepaths: Lifepath[]; }): React.JSX.Element {
  const { getSkill, getTrait } = useRulesetStore();

  const mandatorySkills = new UniqueArray(chosenLifepaths.map(lp => lp.skills ? [getSkill(lp.skills[0])] : []).flat());
  const lifepathSkills = new UniqueArray(chosenLifepaths.map(lp => lp.skills ? lp.skills.filter(skillId => !mandatorySkills.has(skillId)).map(getSkill) : []).flat());

  const mandatoryTraits = new UniqueArray(chosenLifepaths.map(lp => lp.traits ? [getTrait(lp.traits[0])] : []).flat());
  const lifepathTraits = new UniqueArray(chosenLifepaths.map(lp => lp.traits ? lp.traits.filter(traitId => !mandatoryTraits.has(traitId)).map(getTrait) : []).flat());

  return (
    <Grid columns={1} gap="xs">
      <Grid.Col span={1}>
        Mandatory Skills:
        {mandatorySkills.length > 0 ? mandatorySkills.map((skill, i) => (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "3px 3px 0", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={skill} />
          </Paper>
        )
        ) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        Skills:
        {lifepathSkills.length > 0 ? lifepathSkills.map((skill, i) => (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "3px 3px 0", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={skill} />
          </Paper>
        )
        ) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        Mandatory Traits:
        {mandatoryTraits.length > 0 ? mandatoryTraits.map((trait, i) => (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "3px 3px 0", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={trait} />
          </Paper>
        )
        ) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>

      <Grid.Col span={1}>
        Traits:
        {lifepathTraits.length > 0 ? lifepathTraits.map((trait, i) => (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "3px 3px 0", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={trait} />
          </Paper>
        )
        ) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
      </Grid.Col>
    </Grid>
  );
}
