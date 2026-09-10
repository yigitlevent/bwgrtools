import { Box, Divider, Grid, Text } from "@mantine/core";
import { memo, useMemo } from "react";

import { LifepathRequirements } from "./LifepathRequirements";
import { LifepathSkills } from "./LifepathSkills";
import { LifepathTraits } from "./LifepathTraits";
import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";


export const LifepathBox = memo(({ lifepath, noBorder }: { lifepath: Lifepath; noBorder?: boolean; }): React.JSX.Element => {
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

  const leadsText = useMemo(() => {
    const leads = (lifepath.leads !== undefined && lifepath.leads.length > 0) ? lifepath.leads.map(settingId => getSetting(settingId).nameShort) : ["—"];
    return leads.join(", ");
  }, [lifepath.leads, getSetting]);

  return (
    <Box
      style={noBorder !== undefined
        ? undefined
        : {
          padding: "12px 12px 8px",
          border: "1px solid var(--mantine-color-gray-8)"
        }}
    >
      <Grid columns={18} gap={0}>
        <Grid.Col span={noBorder !== undefined ? 9 : { lg: 7, md: 12, sm: 18, base: 18 }}>
          <Text size="lg" fw={700}>{lifepath.name}</Text>
        </Grid.Col>

        <Grid.Col span={noBorder !== undefined ? 3 : { lg: 1, md: 2, sm: 6, base: 6 }}>
          <Text mt={4} size="md">{getYears(lifepath)}</Text>
        </Grid.Col>

        <Grid.Col span={noBorder !== undefined ? 3 : { lg: 1, md: 2, sm: 6, base: 6 }}>
          <Text mt={4} size="md">{getResources(lifepath)}</Text>
        </Grid.Col>

        <Grid.Col span={noBorder !== undefined ? 3 : { lg: 2, md: 2, sm: 6, base: 6 }}>
          <Text mt={4} size="md">{getStatPools(lifepath)}</Text>
        </Grid.Col>

        <Grid.Col span={noBorder !== undefined ? 18 : { lg: 7, md: 18, sm: 18, base: 18 }}>
          <Text mt={4} size="md">{leadsText}</Text>
        </Grid.Col>
      </Grid>

      <Divider mb={4} />
      <LifepathSkills lifepath={lifepath} />
      <LifepathTraits lifepath={lifepath} />
      {lifepath.requirements !== undefined ? <LifepathRequirements lifepath={lifepath} /> : null}
    </Box>
  );
});
