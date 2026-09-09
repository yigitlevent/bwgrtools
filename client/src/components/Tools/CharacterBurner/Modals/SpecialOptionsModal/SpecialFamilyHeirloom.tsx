import { Grid, Select, Text, Title } from "@mantine/core";
import { Fragment, useState } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialFamilyHeirloom(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { resources, setFamilyHeirloomResource } = useCharacterBurnerResourceStore();

  const [stockId, setStockId] = useState<string | null>(null);

  if (!hasTraitOpenByName("Family Heirloom")) return <Fragment />;

  const current: CharacterResource | undefined = "family-heirloom" in resources ? resources["family-heirloom"] : undefined;

  const stockOptions = ruleset.stocks
    .filter((s): s is Stock & { id: dat.StockId; name: string; } => s.id !== null && s.name !== null)
    .map(s => ({ value: s.id.toString(), label: s.name }));

  const resourceOptions = ruleset.resources
    .filter(r => (stockId !== null ? r.stock[0]?.toString() === stockId : true) && r.costs.some(c => c[0] <= 50))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(r => ({ value: r.id.toString(), label: `${r.name} (${r.stock[1]})` }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Family Heirloom</Title>
      </Grid.Col>

      <Grid.Col span={1}>
        <Select
          label="Stock List"
          value={stockId}
          data={stockOptions}
          onChange={setStockId}
          placeholder="Any"
          clearable
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Free Item (≤50 rps)"
          value={current !== undefined ? current.id.toString() : null}
          data={resourceOptions}
          onChange={v => {
            const found = ruleset.resources.find(r => r.id.toString() === v);
            if (found !== undefined) {
              const cost = found.costs.filter(c => c[0] <= 50).sort((a, b) => b[0] - a[0])[0]?.[0] ?? found.costs[0][0];
              const trait = ruleset.getTrait("Family Heirloom");
              if (trait.id !== null) setFamilyHeirloomResource(trait.id, found, cost);
            }
          }}
          searchable
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <Text size="xs" c="dimmed">Only available if the character starts with 20 or fewer resource points.</Text>
      </Grid.Col>
    </Fragment>
  );
}
