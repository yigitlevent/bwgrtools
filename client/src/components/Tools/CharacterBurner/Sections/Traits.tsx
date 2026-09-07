import { Button, Grid, Title, Text, Paper, Group } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { BlockTraitPopover } from "../BlockText";

import type { UniqueArrayItem } from "../../../../utils/UniqueArray";


function Trait({ trait, remove }: { trait: UniqueArrayItem<dat.TraitId, CharacterTrait>; remove?: (traitId: dat.TraitId) => void; }): React.JSX.Element {
  const { openTrait } = useCharacterBurnerTraitStore();

  return (
    <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
      <Paper shadow="xs" radius={0} p={8} withBorder>
        <Group justify="space-between" gap={0}>
          <BlockTraitPopover
            trait={[trait.id, trait.name]}
            checkbox={{ checked: trait.isOpen, disabled: trait.type === "Mandatory" || trait.type === "Common", onClick: () => { openTrait(trait.id); } }}
            deleteCallback={remove ? () => { remove(trait.id); } : undefined}
          />
        </Group>
      </Paper>
    </Grid.Col>
  );
}

function CommonTraitsBlock(): React.JSX.Element {
  const { traits } = useCharacterBurnerTraitStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>Common</Title>
      </Grid.Col>

      <Fragment>
        {traits
          .filter(t => t.type === "Common")
          .map(trait => <Trait key={trait.id} trait={trait} />)}
      </Fragment>
    </Fragment>
  );
}

function MandatoryTraitsBlock(): React.JSX.Element {
  const { traits } = useCharacterBurnerTraitStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>Mandatory</Title>
      </Grid.Col>

      <Fragment>
        {traits
          .filter(t => t.type === "Mandatory")
          .map(trait => <Trait key={trait.id} trait={trait} />)}
      </Fragment>
    </Fragment>
  );
}

function LifepathTraitsBlock(): React.JSX.Element {
  const { traits } = useCharacterBurnerTraitStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>Lifepath</Title>
      </Grid.Col>

      {traits
        .filter(t => t.type === "Lifepath")
        .map(trait => <Trait key={trait.id} trait={trait} />)}
    </Fragment>
  );
}

function GeneralTraitsBlock({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { traits, removeGeneralTrait } = useCharacterBurnerTraitStore();

  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>General</Title>
      </Grid.Col>

      <Fragment>
        {traits
          .filter(t => t.type === "General")
          .map(trait => <Trait key={trait.id} trait={trait} remove={removeGeneralTrait} />)}
      </Fragment>

      <Button variant="outline" style={{ margin: "10px" }} onClick={() => { openModal("geTr"); }}>Add General Trait</Button>
    </Fragment>
  );
}

export function Traits({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { traits, getTraitPools } = useCharacterBurnerTraitStore();
  const traitPools = getTraitPools();

  const text = `Trait Points: ${traitPools.total.toString()}, Remaining: ${traitPools.remaining.toString()}`;

  return (
    <Grid columns={6} align="center" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Traits</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 5 }}>
        <Text>{text}</Text>
      </Grid.Col>

      {traits.existsAny("type", "Common") > 0 ? <CommonTraitsBlock /> : null}
      {traits.existsAny("type", "Mandatory") > 0 ? <MandatoryTraitsBlock /> : null}
      {traits.existsAny("type", "Lifepath") > 0 ? <LifepathTraitsBlock /> : null}
      <GeneralTraitsBlock openModal={openModal} />
    </Grid>
  );
}
