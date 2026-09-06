import { Box, Button, Grid, Stack, Text, Title } from "@mantine/core";

import { useFightPlannerStore } from "../../../hooks/featureStores/useFightPlannerStore";
import { GetActionResolutionString } from "../../../utils/GetActionResolutionString";

import type { FightActionExtended } from "../../../hooks/featureStores/useFightPlannerStore";


export function FightPlannerActionDetails({ action, volleyIndex, actionIndex }: { action: FightActionExtended; volleyIndex: number; actionIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useFightPlannerStore();

  return (
    <Stack gap={0} style={{ width: "100%" }}>
      <Title order={5} mb="8px">{action.name}</Title>

      {action.tests ? (
        <Box mb="10px">
          <b>Tests:</b>
          <Text size="sm">{[...action.tests.abilities, ...action.tests.skills].map(v => v[1]).join(", ")}</Text>
        </Box>
      ) : null}

      <Box mb="10px">
        <b>Action Group:</b>
        <Text size="sm">{action.group[1]}</Text>
      </Box>

      {action.restrictions ? (
        <Box mb="10px">
          <b>Restrictions:</b>

          {action.restrictions.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.effect ? (
        <Box mb="10px">
          <b>Effect:</b>

          {action.effect.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.special ? (
        <Box mb="10px">
          <b>Special:</b>

          {action.special.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.actionCost ? (
        <Box mb="10px">
          <b>Action Cost:</b>
          <Text size="sm">{action.actionCost}</Text>
        </Box>
      ) : null}

      {action.resolutions ? (
        <Box mb="10px">
          <b>Resolution:</b>
          {action.resolutions.map((v, i) => <Text size="sm" key={i}>{GetActionResolutionString(v)}</Text>)}
        </Box>
      ) : null}

      <Grid>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { toggleActionVisibility(volleyIndex, actionIndex); }}>Hide</Button>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { deleteAction(volleyIndex, actionIndex); }}>Delete</Button>
      </Grid>
    </Stack>
  );
}
