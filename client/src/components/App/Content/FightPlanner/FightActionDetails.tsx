import { Box, Button, Divider, Group, Stack, Text, Title } from "@mantine/core";

import { useFightPlannerStore } from "../../../../hooks/featureStores/useFightPlannerStore";
import { GetActionResolutionString } from "../../../../utils/GetActionResolutionString";

import type { FightActionExtended } from "../../../../hooks/featureStores/useFightPlannerStore";


export function FightPlannerActionDetails({ action, volleyIndex, actionIndex }: { action: FightActionExtended; volleyIndex: number; actionIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useFightPlannerStore();

  return (
    <Stack gap={8} style={{ width: "100%" }}>
      <Title order={5}>{action.name}</Title>
      <Divider />

      {action.tests !== undefined
        ? (
          <Box>
            <Text fw={700}>Tests:</Text>
            <Text>{[...action.tests.abilities, ...action.tests.skills].map(v => v[1]).join(", ")}</Text>
          </Box>
        )
        : null}

      <Box>
        <Text fw={700}>Action Group:</Text>
        <Text>{action.group[1]}</Text>
      </Box>

      {action.restrictions !== null && action.restrictions !== undefined && action.restrictions.length > 0
        ? (
          <Box>
            <Text fw={700}>Restrictions:</Text>
            {action.restrictions.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.effect !== null && action.effect !== undefined && action.effect.length > 0
        ? (
          <Box>
            <Text fw={700}>Effect:</Text>
            {action.effect.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.special !== null && action.special !== undefined && action.special.length > 0
        ? (
          <Box>
            <Text fw={700}>Special:</Text>
            {action.special.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
          </Box>
        )
        : null}

      {action.actionCost !== null && action.actionCost !== undefined
        ? (
          <Box>
            <Text fw={700}>Action Cost:</Text>
            <Text>{action.actionCost}</Text>
          </Box>
        )
        : null}

      {action.resolutions !== undefined
        ? (
          <Box>
            <Text fw={700}>Resolution:</Text>
            {action.resolutions.map((v, i) => <Text key={i}>{GetActionResolutionString(v)}</Text>)}
          </Box>
        )
        : null}

      <Group grow>
        <Button size="compact-md" variant="light" onClick={() => { deleteAction(volleyIndex, actionIndex); }}>Delete</Button>
        <Button size="compact-md" variant="light" onClick={() => { toggleActionVisibility(volleyIndex, actionIndex); }}>Hide</Button>
      </Group>
    </Stack>
  );
}
