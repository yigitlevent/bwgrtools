import { Grid, TextInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerMiscStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";


export function Beliefs(): React.JSX.Element {
  const { limits } = useCharacterBurnerMiscStore();
  const { beliefs, setBelief } = useCharacterBurnerBasicsStore();

  return (
    <Grid columns={6} align="center" justify="center" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Beliefs</Title>
      </Grid.Col>

      <Fragment>
        {beliefs.slice(0, limits.beliefs).map((v, i) => (
          <Grid.Col key={i} span={6}>
            <TextInput
              label={i !== 3 ? `Belief ${(i + 1).toString()}` : beliefs[3].name}
              value={v.belief}
              onChange={e => { setBelief(i, e.target.value); }}
              variant="filled"
            />
          </Grid.Col>
        ))}
      </Fragment>
    </Grid>
  );
}
