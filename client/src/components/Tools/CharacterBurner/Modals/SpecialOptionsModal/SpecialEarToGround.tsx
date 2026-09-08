import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialEarToGround(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { resources } = useCharacterBurnerResourceStore();
  const { special, modifyEarToGroundResource } = useCharacterBurnerMiscStore();

  if (!hasTraitOpenByName("Ear to the Ground")) return <Fragment />;

  const relationshipOptions = Object.entries(resources)
    .filter(([, v]) => v.type[1] === "Relationship")
    .map(([key, v]) => ({ value: key, label: v.name }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Ear to the Ground</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Captain Relationship"
          value={special.earToGroundResource ?? null}
          data={relationshipOptions}
          onChange={v => { modifyEarToGroundResource(v ?? undefined); }}
          placeholder={relationshipOptions.length === 0 ? "No relationships owned" : undefined}
          disabled={relationshipOptions.length === 0}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
