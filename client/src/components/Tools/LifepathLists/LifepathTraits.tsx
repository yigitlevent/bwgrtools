import { Box, Text } from "@mantine/core";
import { Fragment, memo, useMemo } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


export const LifepathTraits = memo(({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element => {
  const { getTrait } = useRulesetStore();

  const lifepathTraits = useMemo(() => lifepath.traits ? lifepath.traits.map(traitId => getTrait(traitId)) : undefined, [lifepath.traits, getTrait]);

  const traitPool = lifepath.pools.traitPool ?? 0;

  return (
    <Box>
      <Text mr={4} fw={700} style={{ display: "inline-block" }}>Traits:</Text>

      <Text mr={4} style={{ display: "inline-block" }}>
        {`${traitPool.toString()}${traitPool > 1 ? "pts: " : "pt: "}`}
      </Text>

      {lifepathTraits ? lifepathTraits.map((trait, i) => (
        <Fragment key={trait.id}>
          <PopoverLink data={trait} />
          {i < lifepathTraits.length - 1 ? <Box mr={4} style={{ display: "inline-block" }}>,</Box> : null}
        </Fragment>
      )
      ) : <Box style={{ padding: "0 4px", display: "inline-block" }}>—</Box>}
    </Box>
  );
});
