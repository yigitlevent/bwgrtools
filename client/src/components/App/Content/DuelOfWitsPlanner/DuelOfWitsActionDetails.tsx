import { Box, Button, Divider, Group, Stack, Text, Title } from "@mantine/core";

import { useDuelOfWitsPlannerStore } from "../../../../hooks/featureStores/useDuelOfWitsPlannerStore";
import { GetActionResolutionString } from "../../../../utils/GetActionResolutionString";

import type { DoWActionExtended } from "../../../../hooks/featureStores/useDuelOfWitsPlannerStore";


export function DuelOfWitsActionDetails({ action, volleyIndex }: { action: DoWActionExtended; volleyIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useDuelOfWitsPlannerStore();

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

      {action.speakingThePart !== null && action.speakingThePart !== undefined && action.speakingThePart.length > 0
        ? (
          <Box>
            <Text fw={700}>Speaking the part:</Text>
            {action.speakingThePart.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
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

      {action.effect !== null && action.effect !== undefined && action.effect.length > 0
        ? (
          <Box>
            <Text fw={700}>Effects:</Text>
            {action.effect.split("<br>").map((v, i) => <Text key={i}>{v}</Text>)}
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
        <Button size="compact-md" variant="light" onClick={() => { deleteAction(volleyIndex); }}>Delete</Button>
        <Button size="compact-md" variant="light" onClick={() => { toggleActionVisibility(volleyIndex); }}>Hide</Button>
      </Group>
    </Stack>
  );
}
