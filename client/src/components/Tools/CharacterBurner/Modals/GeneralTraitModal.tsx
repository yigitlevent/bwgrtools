import { Button, Grid, Modal, Select, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function GeneralTraitModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { traits, addGeneralTrait, getTraitPools } = useCharacterBurnerTraitStore();
  const { hasAttribute } = useCharacterBurnerAttributeStore();

  const [possibleTraits, setPossibleTraits] = useState<Trait[]>([]);
  const [chosenTrait, setChosenTrait] = useState<Trait>();

  const addNewTrait = (): void => {
    if (chosenTrait) {
      addGeneralTrait(chosenTrait);
      close();
    }
  };

  useEffect(() => {
    if (ruleset.fetchState === "done") {
      const traitPools = getTraitPools();

      const possible = ruleset.traits.filter(trait =>
        trait.id
        && !traits.has(trait.id)
        && (trait.stock ? trait.stock === stock : true)
        && (trait.cost ?? 0) <= traitPools.remaining
      );
      setPossibleTraits(possible);
    }
  }, [hasAttribute, ruleset.fetchState, ruleset.traits, traits, stock, getTraitPools]);

  useEffect(() => {
    if (possibleTraits.length > 0) setChosenTrait(possibleTraits[0]);
  }, [possibleTraits]);

  const groupedTraitData = useMemo(() => {
    const sorted = [...possibleTraits].sort((a, b) => a.category[1].localeCompare(b.category[1]) || (a.name ?? "").localeCompare(b.name ?? ""));
    const groups = new Map<string, string[]>();
    sorted.forEach(v => {
      const groupName = v.category[1];
      const items = groups.get(groupName) ?? [];
      items.push(v.id?.toString() ?? "");
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [possibleTraits]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={1} gap="md" align="center" justify="center">
        {chosenTrait ? (
          <Grid.Col span={1}>
            <Select
              label="Chosen Trait"
              value={chosenTrait.id?.toString() ?? null}
              data={groupedTraitData}
              onChange={v => {
                const found = possibleTraits.find(t => t.id?.toString() === v);
                if (found) setChosenTrait(found);
              }}
              allowDeselect={false}
              searchable
            />
          </Grid.Col>
        ) : null}

        {chosenTrait ? (
          <Grid.Col span={1}>
            <Grid gap="xs" columns={3}>
              <Grid.Col span={3}>
                <Title order={6}>{chosenTrait.name}</Title>
              </Grid.Col>

              <Grid.Col span={{ base: 3, md: 1 }}>
                <Text size="xs">
                  Type:
                  {chosenTrait.type[1]}
                </Text>
              </Grid.Col>

              {chosenTrait.cost !== 0 ? (
                <Grid.Col span={{ base: 3, md: 1 }}>
                  <Text size="xs">
                    Cost:
                    {" "}
                    {chosenTrait.cost}
                  </Text>
                </Grid.Col>
              ) : null}

              <Grid.Col span={{ base: 3, md: 1 }}>
                {chosenTrait.stock ? (
                  <Text size="xs">
                    Stock:
                    {chosenTrait.stock[1]}
                  </Text>
                ) : null}
              </Grid.Col>

              <Grid.Col span={3}>
                {chosenTrait.description ? chosenTrait.description.split("<br>").map(v => <Text key={v} size="sm" style={{ textIndent: "8px" }}>{v}</Text>) : null}
              </Grid.Col>
            </Grid>
          </Grid.Col>
        ) : null}

        <Grid.Col span={1}>
          <Button variant="outline" size="md" onClick={addNewTrait} fullWidth>Add Trait</Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
