import { Divider, Grid } from "@mantine/core";


export function BlockDivider(): React.JSX.Element {
  return (
    <Grid columns={1} align="center" justify="center">
      <Grid.Col span={1}>
        <Divider />
      </Grid.Col>
    </Grid>
  );
}
