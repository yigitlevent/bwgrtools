import { Box, Divider, EmptyState, Grid, MultiSelect, Select, Title } from "@mantine/core";
import { SearchX } from "lucide-react";
import { Fragment, useMemo } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useSearch } from "../../../hooks/useSearch";
import { PopoverLink } from "../../Shared/PopoverLink";
import { SearchTextInput } from "../../Shared/SearchTextInput";


export function TraitLists(): React.JSX.Element {
  const { stocks, traits, traitCategories, traitTypes } = useRulesetStore();
  const { searchValues, setFilter, filteredList, isPending } = useSearch<Trait>(traits, ["stock", "category", "type"]);

  const groupedList = useMemo(() => {
    const sorted = [...filteredList].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    const groups = new Map<string, Trait[]>();
    sorted.forEach(v => {
      const upperFirstChar = (v.name ?? "").charAt(0).toUpperCase();
      const letter = upperFirstChar.length > 0 ? upperFirstChar : "#";
      const items = groups.get(letter) ?? [];
      items.push(v);
      groups.set(letter, items);
    });
    return [...groups.entries()];
  }, [filteredList]);

  return (
    <Fragment>
      <Title order={3}>Trait Explorer</Title>

      <Grid columns={3} align="center" justify="center" mt="md">
        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Stock"
            variant="filled"
            value={searchValues.filters.stock}
            onChange={v => { if (v !== null) setFilter([{ key: "stock", value: v }]); }}
            data={["Any", ...stocks.map(v => v.name ?? "")]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Category"
            variant="filled"
            value={searchValues.filters.category}
            onChange={v => { if (v !== null) setFilter([{ key: "category", value: v }]); }}
            data={["Any", ...traitCategories]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 1 }}>
          <Select
            label="Type"
            variant="filled"
            value={searchValues.filters.type}
            onChange={v => { if (v !== null) setFilter([{ key: "type", value: v }]); }}
            data={["Any", ...traitTypes]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 2 }}>
          <SearchTextInput
            variant="filled"
            value={searchValues.text}
            onChange={v => { setFilter([{ key: "s", value: v }]); }}
            isPending={isPending}
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

      {filteredList.length > 0
        ? (
          <Box mt="md" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {groupedList.map(([letter, items]) => (
              <Fragment key={letter}>
                <Divider label={letter} labelPosition="left" mt="sm" mb="xs" />

                <Grid gap={4}>
                  {items.map((trait, i) => (
                    <Grid.Col span="content" key={trait.id}>
                      <PopoverLink data={trait} hasComma={i < items.length - 1} />
                    </Grid.Col>
                  ))}
                </Grid>
              </Fragment>
            ))}
          </Box>
        )
        : (
          <EmptyState
            mt="md"
            icon={<SearchX />}
            title="No matches found"
            description="Try adding more fields or changing search text or filters."
          />
        )}
    </Fragment>
  );
}
