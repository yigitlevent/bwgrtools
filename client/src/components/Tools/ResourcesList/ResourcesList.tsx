import { Alert, Box, Grid, MultiSelect, Select, Title } from "@mantine/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Fragment } from "react";

import { ResourceItem } from "./ResourceItem";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useSearch } from "../../../hooks/useSearch";
import { SearchTextInput } from "../../Shared/SearchTextInput";


export function ResourcesList({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null>; }): React.JSX.Element {
  const { stocks, resources, resourceTypes } = useRulesetStore();
  const { searchValues, setFilter, filteredList, isPending } = useSearch<Resource>(resources, ["stock", "type"]);

  // react-virtual's useVirtualizer() returns methods (getTotalSize, getVirtualItems, measureElement)
  // the React Compiler can't statically prove are stable, so it skips memoizing this component. None
  // of those values are passed to other memoized components/hooks here, so that's safe to accept.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 8,
    getItemKey: index => filteredList[index].id
  });

  return (
    <Fragment>
      <Title order={3}>Resources List</Title>

      <Grid columns={8} align="center" justify="center" mt="md">
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
            label="Type"
            variant="filled"
            value={searchValues.filters.type}
            onChange={v => { if (v !== null) setFilter([{ key: "type", value: v }]); }}
            data={["Any", ...resourceTypes]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 4 }}>
          <SearchTextInput
            variant="filled"
            value={searchValues.text}
            onChange={v => { setFilter([{ key: "s", value: v }]); }}
            isPending={isPending}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 3, sm: 3, md: 2 }}>
          <MultiSelect
            label="Search Fields"
            variant="filled"
            value={searchValues.fields}
            onChange={v => { setFilter([{ key: "sf", value: v.join(",") }]); }}
            data={["Name", "Description"]}
          />
        </Grid.Col>
      </Grid>

      {filteredList.length > 0 ? (
        <Box mt={16} style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => (
            <Box
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start.toString()}px)`, paddingBottom: "var(--mantine-spacing-xs)" }}
            >
              <ResourceItem resource={filteredList[virtualRow.index]} />
            </Box>
          ))}
        </Box>
      ) : <Alert color="yellow" style={{ width: "100%", maxWidth: "600px", margin: "12px auto" }}>Could not find any matches. Try adding more fields or changing search text.</Alert>}
    </Fragment>
  );
}
