import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerSpecialStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialStatPenalties(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { special, modifyCrippledStat, modifyFrailStat, modifyMissingLimb } = useCharacterBurnerSpecialStore();

  const statOptions = ruleset.abilities
    .filter((a): a is Ability & { id: dat.AbilityId; name: string; } => a.id !== null && a.name !== null && (a.abilityType[1] === "Mental Stat" || a.abilityType[1] === "Physical Stat"))
    .map(a => ({ value: a.id.toString(), label: a.name }));

  const frailOptions = statOptions.filter(o => o.label === "Power" || o.label === "Forte");

  const limbOptions = ruleset.abilities
    .filter((a): a is Ability & { id: dat.AbilityId; name: string; } => a.id !== null && (a.name === "Agility" || a.name === "Speed"))
    .map(a => ({ value: a.id.toString(), label: a.name === "Agility" ? "Arm" : "Leg" }));

  return (
    <Fragment>
      {hasTraitOpenByName("Crippled")
        ? (
          <Fragment>
            <Grid.Col span={1}>
              <Title order={5} style={{ display: "inline-block" }}>Crippled Stat</Title>
            </Grid.Col>

            <Grid.Col span={2}>
              <Select
                label="Chosen Stat"
                value={special.crippledStat?.toString() ?? null}
                data={statOptions}
                onChange={v => { modifyCrippledStat(v !== null ? Number(v) as dat.AbilityId : undefined); }}
                allowDeselect={false}
                size="sm"
              />
            </Grid.Col>
          </Fragment>
        )
        : null}

      {hasTraitOpenByName("Frail")
        ? (
          <Fragment>
            <Grid.Col span={1}>
              <Title order={5} style={{ display: "inline-block" }}>Frail Stat</Title>
            </Grid.Col>

            <Grid.Col span={2}>
              <Select
                label="Chosen Stat"
                value={special.frailStat?.toString() ?? null}
                data={frailOptions}
                onChange={v => { modifyFrailStat(v !== null ? Number(v) as dat.AbilityId : undefined); }}
                allowDeselect={false}
                size="sm"
              />
            </Grid.Col>
          </Fragment>
        )
        : null}

      {hasTraitOpenByName("Missing Limb")
        ? (
          <Fragment>
            <Grid.Col span={1}>
              <Title order={5} style={{ display: "inline-block" }}>Missing Limb</Title>
            </Grid.Col>

            <Grid.Col span={2}>
              <Select
                label="Arm or Leg"
                value={special.missingLimb?.toString() ?? null}
                data={limbOptions}
                onChange={v => { modifyMissingLimb(v !== null ? Number(v) as dat.AbilityId : undefined); }}
                allowDeselect={false}
                size="sm"
              />
            </Grid.Col>
          </Fragment>
        )
        : null}
    </Fragment>
  );
}
