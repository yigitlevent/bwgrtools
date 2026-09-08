import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialLordOfAges(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { resources } = useCharacterBurnerResourceStore();
  const { special, modifyLordOfAgesResource } = useCharacterBurnerMiscStore();

  if (!hasTraitOpenByName("Lord of Ages")) return <Fragment />;

  const options = Object.entries(resources)
    .filter(([, v]) => v.type[1] === "Reputation" || v.type[1] === "Affiliation")
    .map(([key, v]) => ({ value: key, label: `${v.name} (${v.type[1]})` }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Lord of Ages</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Boosted Reputation/Affiliation"
          value={special.lordOfAgesResource ?? null}
          data={options}
          onChange={v => { modifyLordOfAgesResource(v ?? undefined); }}
          placeholder={options.length === 0 ? "None owned" : undefined}
          disabled={options.length === 0}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
