import { Grid, NumberInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerAttributeStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialAvarice(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyAvariceGreed } = useCharacterBurnerMiscStore();
  const { getNaturalGreed } = useCharacterBurnerAttributeStore();

  if (!hasTraitOpenByName("Avarice")) return <Fragment />;

  const minGreed = getNaturalGreed() + 1;

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Avarice Greed</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          label="Starting Greed"
          value={special.avariceGreed ?? ""}
          min={minGreed}
          onChange={v => { modifyAvariceGreed(v === "" ? undefined : Number(v)); }}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
