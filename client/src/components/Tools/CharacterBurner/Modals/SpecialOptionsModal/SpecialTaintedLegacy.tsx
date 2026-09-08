import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerSpecialStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialTaintedLegacy(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyTaintedLegacyTrait } = useCharacterBurnerSpecialStore();

  if (!hasTraitOpenByName("Tainted Legacy")) return <Fragment />;

  const traitOptions = ruleset.traits
    .filter((t): t is Trait & { id: dat.TraitId; name: string; } => t.id !== null && t.name !== null && t.category[1] === "Monstrous")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(t => ({ value: t.id.toString(), label: t.name }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Tainted Legacy</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Chosen Monstrous Trait"
          value={special.taintedLegacyTrait?.toString() ?? null}
          data={traitOptions}
          onChange={v => {
            const found = ruleset.traits.find(t => t.id?.toString() === v);
            modifyTaintedLegacyTrait(found);
          }}
          searchable
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
