import { Button, Grid, Title, Text, Paper, Group } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { BlockTraitPopover } from "../BlockText";

import type { UniqueArrayItem } from "../../../../utils/UniqueArray";


// TODO: show a warning on call-on traits (ruleset Trait.type "Call-on" / "Call-on and Die") when the
// character doesn't have the skill/ability the trait calls on. Needs the same per-trait "what does
// this call on" data as the call-on trait effects TODO in useCharacterBurnerMisc.tsx's
// refreshTraitEffects -- there's no ruleset field linking a Trait to the skill/ability it calls on,
// so this is blocked on the same missing data, not just missing UI.
function Trait({ trait, remove }: { trait: UniqueArrayItem<dat.TraitId, CharacterTrait>; remove?: (traitId: dat.TraitId) => void; }): React.JSX.Element {
  const { openTrait } = useCharacterBurnerTraitStore();

  return (
    <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
      <Paper shadow="xs" radius={0} p={8} withBorder>
        <Group justify="space-between" gap={0}>
          <BlockTraitPopover
            trait={[trait.id, trait.name]}
            checkbox={{ checked: trait.isOpen, disabled: trait.type === "Mandatory" || trait.type === "Common", onToggle: () => { openTrait(trait.id); } }}
            deleteCallback={remove ? () => { remove(trait.id); } : undefined}
          />
        </Group>
      </Paper>
    </Grid.Col>
  );
}

function TraitBlock({ title, traits, remove, addButton }: {
  title: string;
  traits: UniqueArrayItem<dat.TraitId, CharacterTrait>[];
  remove?: (traitId: dat.TraitId) => void;
  addButton?: { label: string; onClick: () => void; };
}): React.JSX.Element {
  return (
    <Fragment>
      <Grid.Col span={6}>
        <Title order={5} style={{ margin: "0 0 0 24px" }}>{title}</Title>
      </Grid.Col>

      <Fragment>
        {traits.map(trait => <Trait key={trait.id} trait={trait} remove={remove} />)}
      </Fragment>

      {addButton ? <Button variant="outline" style={{ margin: "10px" }} onClick={addButton.onClick}>{addButton.label}</Button> : null}
    </Fragment>
  );
}

export function Traits({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { traits, removeGeneralTrait, getTraitPools } = useCharacterBurnerTraitStore();
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

      {traits.existsAny("type", "Common") > 0 ? <TraitBlock title="Common" traits={traits.filter(t => t.type === "Common")} /> : null}
      {traits.existsAny("type", "Mandatory") > 0 ? <TraitBlock title="Mandatory" traits={traits.filter(t => t.type === "Mandatory")} /> : null}
      {traits.existsAny("type", "Lifepath") > 0 ? <TraitBlock title="Lifepath" traits={traits.filter(t => t.type === "Lifepath")} /> : null}

      <TraitBlock
        title="General"
        traits={traits.filter(t => t.type === "General")}
        remove={removeGeneralTrait}
        addButton={{ label: "Add General Trait", onClick: () => { openModal("geTr"); } }}
      />
    </Grid>
  );
}
