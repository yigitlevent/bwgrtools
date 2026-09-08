import { Grid, Select, Text } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { RecordGet } from "../../../../../utils/RecordGet";


export function SpecialResourceGrants(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { traits } = useCharacterBurnerTraitStore();
  const { special, modifyChosenResourceType } = useCharacterBurnerMiscStore();

  return (
    <Fragment>
      {traits
        .filter(trait => trait.isOpen)
        .map((trait, i) => {
          const grants = ruleset.getTrait(trait.id).grantsResources ?? [];
          if (grants.length < 2) return null;

          const candidates = grants.map(grant => ruleset.getResource(grant.resource));

          return (
            <Fragment key={i}>
              <Grid.Col span={1}>
                <Text>
                  {trait.name}
                  {" "}
                  resource
                </Text>
              </Grid.Col>

              <Grid.Col span={2}>
                <Select
                  label="Chosen Resource"
                  value={RecordGet(special.chosenResourceType, trait.id)?.toString() ?? null}
                  data={candidates.map(r => ({ value: (r.type[0] ?? "").toString(), label: r.type[1] }))}
                  onChange={v => { if (v) modifyChosenResourceType(trait.id, Number(v) as dat.ResourceTypeId); }}
                  allowDeselect={false}
                  size="sm"
                />
              </Grid.Col>
            </Fragment>
          );
        })}
    </Fragment>
  );
}
