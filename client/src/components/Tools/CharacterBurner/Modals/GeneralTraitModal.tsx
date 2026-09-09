import { Grid, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { GeneralAbilityModal } from "./GeneralAbilityModal";
import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


function TraitDetails({ trait }: { trait: Trait; }): React.JSX.Element {
  return (
    <Grid gap="xs" columns={3}>
      <Grid.Col span={3}>
        <Title order={6}>{trait.name}</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 3, md: 1 }}>
        <Text size="xs">
          Type:
          {trait.type[1]}
        </Text>
      </Grid.Col>

      {trait.cost !== 0 ? (
        <Grid.Col span={{ base: 3, md: 1 }}>
          <Text size="xs">
            Cost:
            {" "}
            {trait.cost}
          </Text>
        </Grid.Col>
      ) : null}

      <Grid.Col span={{ base: 3, md: 1 }}>
        {trait.stock !== undefined ? (
          <Text size="xs">
            Stock:
            {trait.stock[1]}
          </Text>
        ) : null}
      </Grid.Col>

      <Grid.Col span={3}>
        {trait.description !== undefined ? trait.description.split("<br>").map(v => <Text key={v} size="sm" style={{ textIndent: "8px" }}>{v}</Text>) : null}
      </Grid.Col>
    </Grid>
  );
}

export function GeneralTraitModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { traits, addGeneralTrait, getTraitPools } = useCharacterBurnerTraitStore();

  const [possibleTraits, setPossibleTraits] = useState<Trait[]>([]);

  useEffect(() => {
    if (ruleset.fetchState === "done") {
      const traitPools = getTraitPools();

      const possible = ruleset.traits.filter(trait =>
        trait.id !== null
        && !traits.has(trait.id)
        && (trait.stock !== undefined ? trait.stock === stock : true)
        && (trait.cost ?? 0) <= traitPools.remaining
      );
      setPossibleTraits(possible);
    }
  }, [ruleset.fetchState, ruleset.traits, traits, stock, getTraitPools]);

  return (
    <GeneralAbilityModal
      isOpen={isOpen}
      close={close}
      title="Chosen Trait"
      addButtonLabel="Add Trait"
      possibleAbilities={possibleTraits}
      renderDetails={trait => <TraitDetails trait={trait} />}
      onAdd={addGeneralTrait}
    />
  );
}
