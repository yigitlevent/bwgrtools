import { Box, Button, Grid, Stack, Text, Title } from "@mantine/core";

import { useRangeAndCoverPlannerStore } from "../../../hooks/featureStores/useRangeAndCoverPlannerStore";
import { GetActionResolutionString } from "../../../utils/GetActionResolutionString";

import type { RaCActionExtended } from "../../../hooks/featureStores/useRangeAndCoverPlannerStore";


export function RangeAndCoverActionDetails({ action, volleyIndex }: { action: RaCActionExtended; volleyIndex: number; }): React.JSX.Element {
  const { deleteAction, toggleActionVisibility } = useRangeAndCoverPlannerStore();

  return (
    <Stack gap={0} style={{ width: "100%" }}>
      <Title order={5} mb="8px">{action.name}</Title>

      <Box mb="10px">
        <b>Action Group:</b>
        <Text size="sm">{action.group[1]}</Text>
      </Box>

      {action.effect ? (
        <Box mb="10px">
          <b>Effect:</b>

          {action.effect.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.specialRestriction ? (
        <Box mb="10px">
          <b>Special Restriction:</b>

          {action.specialRestriction.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.specialAction ? (
        <Box mb="10px">
          <b>Special Action:</b>

          {action.specialAction.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.however ? (
        <Box mb="10px">
          <b>There is a big &quot;however&quot;:</b>

          {action.however.split("<br>").map((v, i) =>
            <Text size="sm" key={i}>{v}</Text>
          )}
        </Box>
      ) : null}

      {action.resolutions ? (
        <Box mb="10px">
          <b>Resolution:</b>

          {action.resolutions
            .map(v => GetActionResolutionString(v))
            .map((v, i) => <Text size="sm" key={i}>{v}</Text>)}
        </Box>
      ) : null}

      <Grid>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { toggleActionVisibility(volleyIndex); }}>Hide</Button>
        <Button size="lg" style={{ width: "50%", padding: "16px 8px", marginTop: "8px" }} onClick={() => { deleteAction(volleyIndex); }}>Delete</Button>
      </Grid>
    </Stack>
  );
}
