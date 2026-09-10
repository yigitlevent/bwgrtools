import { Grid, NumberInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerAttributeStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerSpecialStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialMourner(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyMournerGrief } = useCharacterBurnerSpecialStore();
  const { getNaturalGrief } = useCharacterBurnerAttributeStore();

  if (!hasTraitOpenByName("Mourner")) return <Fragment />;

  const minGrief = getNaturalGrief();

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Mourner Grief</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          label="Starting Grief (max 9)"
          value={special.mournerGrief ?? ""}
          min={minGrief}
          max={9}
          onChange={v => { modifyMournerGrief(v === "" ? undefined : Number(v)); }}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
