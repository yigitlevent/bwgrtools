import { Box, Button, Grid, Group, Popover, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";

import { useFightPlannerStore } from "../../../../hooks/featureStores/useFightPlannerStore";
import { GetActionResolutionString } from "../../../../utils/GetActionResolutionString";

import type { FightActionExtended } from "../../../../hooks/featureStores/useFightPlannerStore";


function DeleteActionButton({ onDelete }: { onDelete: () => void; }): React.JSX.Element {
  const [confirming, setConfirming] = useState(false);

  return (
    <Popover opened={confirming} onChange={setConfirming} withArrow position="top" width={260}>
      <Popover.Target>
        <Button size="lg" style={{ width: "100%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { setConfirming(true); }}>Delete</Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="xs">
          <Text size="sm">Delete this action? This cannot be undone.</Text>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" size="xs" onClick={() => { setConfirming(false); }}>Cancel</Button>

            <Button
              color="red"
              size="xs"
              onClick={() => {
                onDelete();
                setConfirming(false);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export function FightPlannerActionDetails({ action, volleyIndex, actionIndex }: { action: FightActionExtended; volleyIndex: number; actionIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useFightPlannerStore();

  return (
    <Stack gap={0} style={{ width: "100%" }}>
      <Title order={5} mb="8px">{action.name}</Title>

      {action.tests !== undefined
        ? (
          <Box mb="10px">
            <b>Tests:</b>
            <Text size="sm">{[...action.tests.abilities, ...action.tests.skills].map(v => v[1]).join(", ")}</Text>
          </Box>
        )
        : null}

      <Box mb="10px">
        <b>Action Group:</b>
        <Text size="sm">{action.group[1]}</Text>
      </Box>

      {action.restrictions !== null && action.restrictions !== undefined && action.restrictions.length > 0
        ? (
          <Box mb="10px">
            <b>Restrictions:</b>

            {action.restrictions.split("<br>").map((v, i) =>
              <Text size="sm" key={i}>{v}</Text>
            )}
          </Box>
        )
        : null}

      {action.effect !== null && action.effect !== undefined && action.effect.length > 0
        ? (
          <Box mb="10px">
            <b>Effect:</b>

            {action.effect.split("<br>").map((v, i) =>
              <Text size="sm" key={i}>{v}</Text>
            )}
          </Box>
        )
        : null}

      {action.special !== null && action.special !== undefined && action.special.length > 0
        ? (
          <Box mb="10px">
            <b>Special:</b>

            {action.special.split("<br>").map((v, i) =>
              <Text size="sm" key={i}>{v}</Text>
            )}
          </Box>
        )
        : null}

      {action.actionCost !== null && action.actionCost !== undefined
        ? (
          <Box mb="10px">
            <b>Action Cost:</b>
            <Text size="sm">{action.actionCost}</Text>
          </Box>
        )
        : null}

      {action.resolutions !== undefined
        ? (
          <Box mb="10px">
            <b>Resolution:</b>
            {action.resolutions.map((v, i) => <Text size="sm" key={i}>{GetActionResolutionString(v)}</Text>)}
          </Box>
        )
        : null}

      <Grid>
        <Box style={{ width: "50%" }}>
          <Button size="lg" style={{ width: "100%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { toggleActionVisibility(volleyIndex, actionIndex); }}>Hide</Button>
        </Box>

        <Box style={{ width: "50%" }}>
          <DeleteActionButton onDelete={() => { deleteAction(volleyIndex, actionIndex); }} />
        </Box>
      </Grid>
    </Stack>
  );
}
