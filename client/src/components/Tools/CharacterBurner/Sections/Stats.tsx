import { Grid, Group, Title, Text, Paper } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerStatStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { AbilityButton } from "../../../Shared/AbilityButton";


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
    <Grid columns={6} align="center" mt="lg" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Stats</Title>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text c={mental.remaining < 0 ? "red" : undefined} fw={mental.remaining < 0 ? 700 : undefined}>{mentalText}</Text>
        <Text c={physical.remaining < 0 ? "red" : undefined} fw={physical.remaining < 0 ? 700 : undefined}>{physicalText}</Text>
        <Text c={either.remaining < 0 ? "red" : undefined} fw={either.remaining < 0 ? 700 : undefined}>{eitherText}</Text>
      </Grid.Col>

      <Fragment>
        {abilities
          .filter(a => a.abilityType[1].includes("Stat"))
          .sort((pv, cv) => (pv.id ?? 0) - (cv.id ?? 0))
          .map((v, i) => {
            const stat = getStat(v.name ?? "");
            return (
              <Grid.Col key={i} span={{ base: 3, sm: 2, md: 1 }}>
                <Paper shadow="xs" radius={0} p={8} withBorder>
                  <Group justify="space-between" gap={0}>
                    <Text>{v.name ?? ""}</Text>

                    <Group gap={0}>
                      <AbilityButton onClick={() => { shiftStatShade(v.name ?? ""); }}>{stat.shade}</AbilityButton>
                      <AbilityButton onClick={() => { modifyStatExponent(v.name ?? ""); }} onContextMenu={() => { modifyStatExponent(v.name ?? "", true); }}>{stat.exponent}</AbilityButton>
                    </Group>
                  </Group>
                </Paper>
              </Grid.Col>
            );
          })}
      </Fragment>
    </Grid>
  );
}
