import { Alert, Grid, MultiSelect, Paper, Select, TextInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { ResourceItem } from "./ResourceItem";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useSearch } from "../../../hooks/useSearch";


export function ResourcesList(): React.JSX.Element {
  const { stocks, resources, resourceTypes } = useRulesetStore();
  const { searchValues, setFilter, filteredList } = useSearch<Resource>(resources, ["stock", "type"]);

  return (
    <Fragment>
      <Title order={3}>Resources List</Title>

      <Grid columns={4} align="center" justify="center" mt="md">
        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Stock"
            variant="filled"
            value={searchValues.filters.stock}
            onChange={v => { if (v) setFilter([{ key: "stock", value: v }]); }}
            data={["Any", ...stocks.map(v => v.name ?? "")]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Type"
            variant="filled"
            value={searchValues.filters.type}
            onChange={v => { if (v) setFilter([{ key: "type", value: v }]); }}
            data={["Any", ...resourceTypes]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <TextInput
            label="Search"
            variant="filled"
            value={searchValues.text}
            onChange={e => { setFilter([{ key: "s", value: e.target.value }]); }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <MultiSelect
            label="Search Fields"
            variant="filled"
            value={searchValues.fields}
            onChange={v => { setFilter([{ key: "sf", value: v.join(",") }]); }}
            data={["Name"]}
          />
        </Grid.Col>
      </Grid>

      <Grid columns={1} mt="md">
        {filteredList.length > 0 ? filteredList.map((resource, i) => (
          <Grid.Col span={1} key={i}>
            <Paper shadow="sm" style={{ padding: "0 12px 16px" }}>
              <ResourceItem resource={resource} />
            </Paper>
          </Grid.Col>
        )
        ) : <Alert color="yellow" style={{ width: "100%", maxWidth: "600px", margin: "12px auto" }}>Could not find any matches. Try adding more fields or changing search text.</Alert>}
      </Grid>
    </Fragment>
  );
}
