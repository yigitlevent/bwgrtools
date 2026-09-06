import { Divider, Grid, Paper, Text } from "@mantine/core";
import { Fragment } from "react";

import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";

import type { PracticePlaced } from "../../../hooks/featureStores/usePracticePlannerStore";


export function PracticePlannerTimetableSummary(): React.JSX.Element {
  const { cells } = usePracticePlannerStore();

  const grouped = Object.groupBy(cells.map(cell => cell.placed).flat(), v => v.name) as Record<string, PracticePlaced[]>;

  return (
    <Fragment>
      {cells.length > 0 && cells.some(v => v.placed.length > 0) ? <Divider label="Timetable Summary" mt="10px" /> : null}

      <Grid columns={3}>
        {Object.entries(grouped)
          .map(([k, v]) => {
            return { name: k, days: v.length, testType: v[0].testType };
          })
          .sort((a, b) => a.days - b.days)
          .map((v, i) => (
            <Grid.Col span={{ base: 3, sm: 2, md: 1 }} key={i} style={{ flexGrow: 1 }}>
              <Paper shadow="md" m="8px" style={{ padding: "8px 16px" }}>
                <Text>
                  {v.name}
                  {" "}
                  (
                  {v.testType}
                  ):
                  {" "}
                  {v.days}
                  {" "}
                  days
                </Text>
              </Paper>
            </Grid.Col>
          ))}
      </Grid>
    </Fragment>
  );
}
