import { Alert, Box, Grid, MultiSelect, Select, Title } from "@mantine/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Fragment, useCallback, useMemo, useState } from "react";

import { LifepathBox } from "./LifepathBox";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useSearch } from "../../../hooks/useSearch";
import { SearchTextInput } from "../../Shared/SearchTextInput";


type SearchableLifepath = Lifepath & { leadnames: string; skillnames: string; traitnames: string; };

export function LifepathLists({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null>; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stocks, settings, lifepaths } = ruleset;

  const searchableLifepaths = useMemo((): SearchableLifepath[] => {
    return lifepaths
      .map(lifepath => ({
        ...lifepath,
        leadnames: (lifepath.leads ?? []).map(id => ruleset.getSetting(id).name ?? "").join(", "),
        skillnames: (lifepath.skills ?? []).map(id => ruleset.getSkill(id).name ?? "").join(", "),
        traitnames: (lifepath.traits ?? []).map(id => ruleset.getTrait(id).name ?? "").join(", ")
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [lifepaths, ruleset]);

  const { searchValues, setFilter, filteredList, isPending } =
    useSearch<SearchableLifepath>(searchableLifepaths, ["stock", "setting"], { "stock": stocks[0].name ?? "", "setting": settings[0].name ?? "" });

  const [allowedSettings, setAllowedSettings] = useState(settings.filter(setting => setting.stock[1] === searchValues.filters.stock).map(v => v.name ?? ""));

  const updateStock = useCallback((val: string) => {
    const newAllowed = settings.filter(setting => setting.stock[1] === val).map(v => v.name ?? "");
    setAllowedSettings(newAllowed);
    setFilter([{ key: "stock", value: val }, { key: "setting", value: newAllowed[0] }]);
  }, [setFilter, settings]);

  // react-virtual's useVirtualizer() returns methods (getTotalSize, getVirtualItems, measureElement)
  // the React Compiler can't statically prove are stable, so it skips memoizing this component. None
  // of those values are passed to other memoized components/hooks here, so that's safe to accept.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 90,
    overscan: 8,
    getItemKey: index => filteredList[index].id ?? index
  });

  return (
    <Fragment>
      <Title order={3}>Lifepath Explorer</Title>

      <Grid columns={8} align="center" justify="center" mt="md">
        <Grid.Col span={{ base: 4, sm: 2, md: 1 }}>
          <Select
            label="Stock"
            variant="filled"
            value={searchValues.filters.stock}
            onChange={v => { if (v !== null) updateStock(v); }}
            data={stocks.map(v => v.name ?? "")}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 4, sm: 2, md: 1 }}>
          <Select
            label="Setting"
            variant="filled"
            value={allowedSettings.includes(searchValues.filters.setting) ? searchValues.filters.setting : ""}
            onChange={v => { if (v !== null) setFilter([{ key: "setting", value: v }]); }}
            data={allowedSettings}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 4, sm: 2, md: 4 }}>
          <SearchTextInput
            variant="filled"
            value={searchValues.text}
            onChange={v => { setFilter([{ key: "s", value: v }]); }}
            isPending={isPending}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 4, sm: 2, md: 2 }}>
          <MultiSelect
            label="Search Fields"
            variant="filled"
            value={searchValues.fields}
            onChange={v => { setFilter([{ key: "sf", value: v.join(",") }]); }}
            data={[
              { value: "Name", label: "Name" },
              { value: "leadnames", label: "Leads" },
              { value: "skillnames", label: "Skills" },
              { value: "traitnames", label: "Traits" }
            ]}
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
              <LifepathBox lifepath={filteredList[virtualRow.index]} />
            </Box>
          ))}
        </Box>
      ) : <Alert color="yellow" style={{ width: "100%", maxWidth: "600px", margin: "12px auto" }}>Could not find any matches. Try adding more fields or changing search text.</Alert>}
    </Fragment>
  );
}
