import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialDarlingOfCourt(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { resources } = useCharacterBurnerResourceStore();
  const { special, modifyDarlingOfCourtResource } = useCharacterBurnerMiscStore();

  if (!hasTraitOpenByName("Darling of the Court")) return <Fragment />;

  const reputationOptions = Object.entries(resources)
    .filter(([, v]) => v.type[1] === "Reputation")
    .map(([key, v]) => ({ value: key, label: v.name }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Darling of the Court</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Boosted Reputation"
          value={special.darlingOfCourtResource ?? null}
          data={reputationOptions}
          onChange={v => { modifyDarlingOfCourtResource(v ?? undefined); }}
          placeholder={reputationOptions.length === 0 ? "No reputations owned" : undefined}
          disabled={reputationOptions.length === 0}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
