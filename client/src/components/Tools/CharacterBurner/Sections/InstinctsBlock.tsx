import { Grid, TextInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerMiscStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";


export function Instincts(): React.JSX.Element {
  const { limits } = useCharacterBurnerMiscStore();
  const { instincts, setInstinct } = useCharacterBurnerBasicsStore();

  return (
    <Grid columns={6} align="center" justify="center" mb="xl">
      <Grid.Col span={4}>
        <Title order={4}>Instincts</Title>
      </Grid.Col>

      <Fragment>
        {instincts.slice(0, limits.instincts).map((v, i) => (
          <Grid.Col key={i} span={6}>
            <TextInput
              label={i !== 3 ? `Instinct ${(i + 1).toString()}` : instincts[3].name}
              value={v.instinct}
              onChange={e => { setInstinct(i, e.target.value); }}
              variant="filled"
            />
          </Grid.Col>
        ))}
      </Fragment>
    </Grid>
  );
}
