import { Box, Grid, Paper, Text } from "@mantine/core";

import { LifepathRequirements } from "./LifepathRequirements";
import { LifepathSkills } from "./LifepathSkills";
import { LifepathTraits } from "./LifepathTraits";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";


export function LifepathBox({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element {
  const { getSetting } = useRulesetStore();

  const getYears = (l: Lifepath): string => {
    const years = typeof l.years === "number" ? `${l.years.toString()}${l.years > 1 ? "yrs" : "yr"}` : l.years.join("-") + "yrs";
    return years;
  };

  const getResources = (l: Lifepath): string => {
    const rp = l.pools.resourcePoints ?? 0;
    return `${rp.toString()}${rp > 1 ? "rps" : "rp"}`;
  };

  const getStatPools = (l: Lifepath): string => {
    const statPoolsString = [];

    const either = l.pools.eitherStatPool ?? 0;
    const mental = l.pools.mentalStatPool ?? 0;
    const physical = l.pools.physicalStatPool ?? 0;

    if (either === 0 && mental === 0 && physical === 0) statPoolsString.push("—");
    else if (either !== 0) statPoolsString.push(`${(either > 0) ? "+" : ""}${either.toString()}M/P`);
    else {
      if (mental !== 0) statPoolsString.push(`${(mental > 0) ? "+" : ""}${mental.toString()}M`);
      if (physical !== 0) statPoolsString.push(`${(physical > 0) ? "+" : ""}${physical.toString()}P`);
    }
    return statPoolsString.join(", ");
  };

  const getLeads = (l: Lifepath): string => {
    const leads = (l.leads && l.leads.length > 0) ? l.leads.map(settingId => getSetting(settingId).nameShort) : ["—"];

    return leads.join(", ");
  };

  return (
    <Grid gap={0} columns={18}>
      <Grid.Col span={{ lg: 6, md: 12, sm: 18, base: 18 }}>
        <Paper shadow="md" radius={0} style={{ padding: "2px 6px 4px" }}>
          <Text>{lifepath.name}</Text>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ lg: 1, md: 2, sm: 6, base: 6 }}>
        <Paper shadow="md" radius={0} style={{ padding: "2px 6px 4px" }}>
          <Text size="xs">{getYears(lifepath)}</Text>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ lg: 1, md: 2, sm: 6, base: 6 }}>
        <Paper shadow="md" radius={0} style={{ padding: "2px 6px 4px" }}>
          <Text size="xs">{getResources(lifepath)}</Text>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ lg: 1, md: 2, sm: 6, base: 6 }}>
        <Paper shadow="md" radius={0} style={{ padding: "2px 6px 4px" }}>
          <Text size="xs">{getStatPools(lifepath)}</Text>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ lg: 9, md: 18, sm: 18, base: 18 }}>
        <Paper shadow="md" radius={0} style={{ padding: "2px 6px 4px" }}>
          <Text size="xs">{getLeads(lifepath)}</Text>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ md: 16 }}>
        <Box fz="xs">
          <LifepathSkills lifepath={lifepath} />
        </Box>
      </Grid.Col>

      <Grid.Col span={{ md: 16 }}>
        <Box fz="xs">
          <LifepathTraits lifepath={lifepath} />
        </Box>
      </Grid.Col>

      {lifepath.requirements ? (
        <Grid.Col span={{ md: 16 }}>
          <Box fz="xs">
            <LifepathRequirements lifepath={lifepath} />
          </Box>
        </Grid.Col>
      ) : null}
    </Grid>
  );
}
