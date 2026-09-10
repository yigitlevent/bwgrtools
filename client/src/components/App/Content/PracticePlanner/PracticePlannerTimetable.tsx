import { Divider, Grid, Text } from "@mantine/core";
import { Fragment } from "react";

import { usePracticePlannerStore } from "../../../../hooks/featureStores/usePracticePlannerStore";

import type { PracticePlaced } from "../../../../hooks/featureStores/usePracticePlannerStore";


export function PracticePlannerTimetable(): React.JSX.Element {
  const { cells } = usePracticePlannerStore();

  const grouped = Object.groupBy(cells.map(cell => cell.placed).flat(), v => v.name) as Record<string, PracticePlaced[]>;

  return (
    <Fragment>
      {cells.length > 0 && cells.some(v => v.placed.length > 0) ? <Divider label="Timetable" mt="10px" /> : null}

      <Grid columns={4} my={16}>
        {Object.entries(grouped)
          .map(([k, v]) => {
            return { name: k, days: v.length, testType: v[0].testType };
          })
          .sort((a, b) => a.days - b.days)
          .map((v, i) => (
            <Grid.Col span={{ base: 4, sm: 2, md: 1 }} key={i} style={{ flexGrow: 1 }}>
              <Text fw={700} display="inline-block">{v.name}</Text>
              <Text ml={4} display="inline-block">{`(${v.testType}): `}</Text>
              <Text ml={4} display="inline-block">{v.days}</Text>
            </Grid.Col>
          ))}
      </Grid>
    </Fragment>
  );
}
