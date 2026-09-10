import { Box, Button, Divider, Group, Stack, Text, Title } from "@mantine/core";

import { useRangeAndCoverPlannerStore } from "../../../../hooks/featureStores/useRangeAndCoverPlannerStore";
import { GetActionResolutionString } from "../../../../utils/GetActionResolutionString";

import type { RaCActionExtended } from "../../../../hooks/featureStores/useRangeAndCoverPlannerStore";


export function RangeAndCoverActionDetails({ action, volleyIndex }: { action: RaCActionExtended; volleyIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useRangeAndCoverPlannerStore();

  return (
    <Stack gap={8} style={{ width: "100%" }}>
      <Title order={5}>{action.name}</Title>
      <Divider />

      <Box>
        <Text fw={700}>Action Group:</Text>
        <Text>{action.group[1]}</Text>
      </Box>

      {action.effect !== null && action.effect !== undefined && action.effect.length > 0
        ? (
          <Box>
            <Text fw={700}>Effect:</Text>
            {action.effect.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.specialRestriction !== null && action.specialRestriction !== undefined && action.specialRestriction.length > 0
        ? (
          <Box>
            <Text fw={700}>Special Restriction:</Text>
            {action.specialRestriction.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.specialAction !== null && action.specialAction !== undefined && action.specialAction.length > 0
        ? (
          <Box>
            <Text fw={700}>Special Action:</Text>
            {action.specialAction.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.however !== null && action.however !== undefined && action.however.length > 0
        ? (
          <Box>
            <Text fw={700}>There is a big "however":</Text>
            {action.however.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.resolutions !== undefined
        ? (
          <Box>
            <Text fw={700}>Resolution:</Text>
            {action.resolutions.map(v => GetActionResolutionString(v)).map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      <Group grow>
        <Button size="compact-md" variant="light" onClick={() => { deleteAction(volleyIndex); }}>Delete</Button>
        <Button size="compact-md" variant="light" onClick={() => { toggleActionVisibility(volleyIndex); }}>Hide</Button>
      </Group>
    </Stack>
  );
}
