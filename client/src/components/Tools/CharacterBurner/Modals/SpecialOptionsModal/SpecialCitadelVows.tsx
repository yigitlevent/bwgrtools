import { Checkbox, Grid, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialCitadelVows(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyServantOfCitadelQualifies, modifySwornToProtectQualifies } = useCharacterBurnerMiscStore();

  return (
    <Fragment>
      {hasTraitOpenByName("Servant of the Citadel") ? (
        <Fragment>
          <Grid.Col span={1}>
            <Title order={5} style={{ display: "inline-block" }}>Servant of the Citadel</Title>
          </Grid.Col>

          <Grid.Col span={2}>
            <Checkbox
              label="Wrote a Belief and Instinct about the citadel's welfare"
              checked={special.servantOfCitadelQualifies}
              onChange={e => { modifyServantOfCitadelQualifies(e.currentTarget.checked); }}
            />
          </Grid.Col>
        </Fragment>
      ) : null}

      {hasTraitOpenByName("Sworn to Protect") ? (
        <Fragment>
          <Grid.Col span={1}>
            <Title order={5} style={{ display: "inline-block" }}>Sworn to Protect</Title>
          </Grid.Col>

          <Grid.Col span={2}>
            <Checkbox
              label="Wrote a Belief about defending the citadel/Wilderlands/royalty"
              checked={special.swornToProtectQualifies}
              onChange={e => { modifySwornToProtectQualifies(e.currentTarget.checked); }}
            />
          </Grid.Col>
        </Fragment>
      ) : null}
    </Fragment>
  );
}
