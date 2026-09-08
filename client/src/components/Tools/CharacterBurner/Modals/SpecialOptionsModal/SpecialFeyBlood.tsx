import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerSpecialStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialFeyBlood(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyFeyBloodTrait } = useCharacterBurnerSpecialStore();

  if (!hasTraitOpenByName("Fey Blood")) return <Fragment />;

  const traitOptions = ruleset.traits
    .filter((t): t is Trait & { id: dat.TraitId; name: string; stock: [id: dat.StockId, name: string]; } =>
      t.id !== null && t.name !== null && t.stock !== undefined
      && ["Elf", "Dwarf", "Orc"].includes(t.stock[1])
      && ["Lifepath", "Common", "Special"].includes(t.category[1]))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(t => ({ value: t.id.toString(), label: `${t.name} (${t.stock[1]}, ${t.category[1]}${t.cost ? `, ${t.cost.toString()} pts` : ""})` }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Fey Blood</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Chosen Trait"
          value={special.feyBloodTrait?.toString() ?? null}
          data={traitOptions}
          onChange={v => {
            const found = ruleset.traits.find(t => t.id?.toString() === v);
            modifyFeyBloodTrait(found);
          }}
          searchable
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
