import { Alert, Grid, MultiSelect, Paper, Select, TextInput, Title } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useSearch } from "../../../hooks/useSearch";
import { PopoverLink } from "../../Shared/PopoverLink";


export function TraitLists(): React.JSX.Element {
  const { stocks, traits, traitCategories, traitTypes } = useRulesetStore();
  const { searchValues, setFilter, filteredList } = useSearch<Trait>(traits, ["stock", "category", "type"]);

  return (
    <Fragment>
      <Title order={3}>Trait Explorer</Title>

      <Grid columns={3} align="center" justify="center" mt="md">
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
            label="Category"
            variant="filled"
            value={searchValues.filters.category}
            onChange={v => { if (v) setFilter([{ key: "category", value: v }]); }}
            data={["Any", ...traitCategories]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Type"
            variant="filled"
            value={searchValues.filters.type}
            onChange={v => { if (v) setFilter([{ key: "type", value: v }]); }}
            data={["Any", ...traitTypes]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 2 }}>
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
            data={["Name", "Description"]}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        {filteredList.length > 0 ? [...filteredList].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")).map((trait, i) => (
          <Grid.Col span="content" key={i}>
            <Paper shadow="sm" style={{ cursor: "pointer", padding: "2px 6px" }}>
              <PopoverLink data={trait} />
            </Paper>
          </Grid.Col>
        )
        ) : (
          <Alert color="yellow" style={{ width: "100%", maxWidth: "600px", margin: "12px auto" }}>
            Could not find any matches. Try adding more fields or changing search text or filters.
          </Alert>
        )}
      </Grid>
    </Fragment>
  );
}
