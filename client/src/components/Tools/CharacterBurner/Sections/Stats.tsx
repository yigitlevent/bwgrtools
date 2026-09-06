import { Grid, Group, Title, Text } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerStatStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { AbilityButton } from "../../../Shared/AbilityButton";
import { BlockText } from "../BlockText";


export function Stats(): React.JSX.Element {
  const { abilities } = useRulesetStore();
  const { getMentalPool, getPhysicalPool, getEitherPool } = useCharacterBurnerLifepathStore();
  const { shiftStatShade, modifyStatExponent, getStat } = useCharacterBurnerStatStore();

  const mental = getMentalPool();
  const physical = getPhysicalPool();
  const either = getEitherPool();

  const mentalText = `Mental Pool / Total: ${mental.total.toString()}, Remaining: ${mental.remaining.toString()}`;
  const physicalText = `Physical Pool / Total: ${physical.total.toString()}, Remaining: ${physical.remaining.toString()}`;
  const eitherText = `Either Pool / Total: ${either.total.toString()}, Remaining: ${either.remaining.toString()}`;

  return (
    <Grid columns={6} align="center" gap="xl" mt="lg" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Stats</Title>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text>{mentalText}</Text>
        <Text>{physicalText}</Text>
        <Text>{eitherText}</Text>
      </Grid.Col>

      <Fragment>
        {abilities
          .filter(a => a.abilityType[1].includes("Stat"))
          .sort((pv, cv) => (pv.id ?? 0) - (cv.id ?? 0))
          .map((v, i) => {
            const stat = getStat(v.name ?? "");
            return (
              <Grid.Col key={i} span={{ base: 6, sm: 3, md: 2 }}>
                <Grid columns={5} justify="flex-start" align="center" style={{ background: "#353535", borderRadius: 1, marginTop: "8px" }}>
                  <BlockText text={v.name ?? ""} hasLeftPadding />

                  <Grid.Col span="content">
                    <Group gap={0}>
                      <AbilityButton onClick={() => { shiftStatShade(v.name ?? ""); }}>{stat.shade}</AbilityButton>
                      <AbilityButton onClick={() => { modifyStatExponent(v.name ?? ""); }} onContextMenu={() => { modifyStatExponent(v.name ?? "", true); }}>{stat.exponent}</AbilityButton>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
            );
          })}
      </Fragment>
    </Grid>
  );
}
