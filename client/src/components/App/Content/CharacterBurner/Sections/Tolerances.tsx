import { Grid, Table, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { useCharacterBurnerLimitsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLimits";
import { useCharacterBurnerStatStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function Tolerances(): React.JSX.Element {
  const { stats } = useCharacterBurnerStatStore();
  const { traits } = useCharacterBurnerTraitStore();
  const { getTolerances } = useCharacterBurnerLimitsStore();

  const [tolerances, setTolerances] = useState<string[]>(Array(16).fill("—"));

  useEffect(() => {
    setTolerances(getTolerances());
    // getTolerances() also depends on hasTraitOpenByName("Tough") (mortal-wound rounding), so traits
    // must be a dependency here too, not just stats.
  }, [getTolerances, stats, traits]);

  return (
    <Grid columns={16} gap="xs" align="center" justify="center" mb="xl">
      <Grid.Col span={16}>
        <Title order={4}>Tolerances</Title>
      </Grid.Col>

      <Grid.Col span={16}>
        <Table.ScrollContainer minWidth={0}>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                {Array.from(Array(16).keys()).map(v => (
                  <Table.Th key={v} style={{ textAlign: "center" }}>
                    B
                    {v + 1}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              <Table.Tr>
                {tolerances.map((tolerance, i) => (
                  <Table.Td key={i} style={{ textAlign: "center" }}>
                    {tolerance}
                  </Table.Td>
                ))}
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Grid.Col>
    </Grid>
  );
}
