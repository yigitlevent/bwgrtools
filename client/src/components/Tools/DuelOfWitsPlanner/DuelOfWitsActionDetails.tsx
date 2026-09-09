import { Box, Button, Grid, Stack, Text, Title } from "@mantine/core";

import { useDuelOfWitsPlannerStore } from "../../../hooks/featureStores/useDuelOfWitsPlannerStore";
import { GetActionResolutionString } from "../../../utils/GetActionResolutionString";

import type { DoWActionExtended } from "../../../hooks/featureStores/useDuelOfWitsPlannerStore";


export function DuelOfWitsActionDetails({ action, volleyIndex }: { action: DoWActionExtended; volleyIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useDuelOfWitsPlannerStore();

  return (
    <Stack gap={0} style={{ width: "100%" }}>
      <Title order={5} mb="8px">{action.name}</Title>

      {action.tests !== undefined ? (
        <Box mb="10px">
          <b>Tests:</b>
          <Text size="sm">{[...action.tests.abilities, ...action.tests.skills].map(v => v[1]).join(", ")}</Text>
        </Box>
      ) : null}

      {action.speakingThePart !== null && action.speakingThePart !== undefined && action.speakingThePart.length > 0 ? (
        <Box mb="10px">
          <b>Speaking the part:</b>

          {action.speakingThePart.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.special !== null && action.special !== undefined && action.special.length > 0 ? (
        <Box mb="10px">
          <b>Special:</b>

          {action.special.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.effect !== null && action.effect !== undefined && action.effect.length > 0 ? (
        <Box mb="10px">
          <b>Effects:</b>

          {action.effect.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.resolutions !== undefined ? (
        <Box mb="10px">
          <b>Resolution:</b>
          {action.resolutions.map((v, i) => <Text size="sm" key={i}>{GetActionResolutionString(v)}</Text>)}
        </Box>
      ) : null}

      <Grid>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { toggleActionVisibility(volleyIndex); }}>Hide</Button>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { deleteAction(volleyIndex); }}>Delete</Button>
      </Grid>
    </Stack>
  );
}
