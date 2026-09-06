import { Box, Paper } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


export function LifepathTraits({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element {
  const { getTrait } = useRulesetStore();

  const lifepathTraits =
    lifepath.traits ? lifepath.traits.map(traitId => getTrait(traitId)) : undefined;

  const traitPool = lifepath.pools.traitPool ?? 0;
  const text = `${traitPool.toString()}${traitPool > 1 ? "pts: " : "pt: "}`;

  return (
    <Fragment>
      <b>Traits: </b>
      {text}

      {lifepathTraits ? lifepathTraits.map((trait, i) => {
        return (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "0 0 0 2px", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={trait} />
          </Paper>
        );
      }) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
    </Fragment>
  );
}
