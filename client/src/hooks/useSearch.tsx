import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";


type List<T> = (T & { rulesets: string[] | null; })[];

interface SearchValues {
  text: string;
  fields: string[];
  filters: Record<string, string>;
}

interface SearchReturn<T> {
  searchValues: SearchValues;
  setFilter: (filtersToApply: { key: string; value: string; }[]) => void;
  filteredList: List<T>;
  isPending: boolean;
}

export const MinSearchTextLength = 3;

export function useSearch<T>(mainList: List<T>, filterKeys: string[], initialFilterValues?: Record<string, string>): SearchReturn<T> {
  const [urlParams, setUrlParams] = useSearchParams();

  const [originalList] = useState(mainList);
  const [filteredList, setFilteredList] = useState(mainList);
  const [isPending, setIsPending] = useState(false);

  const applyInitialFilterValues = useCallback((fKeys: string[]) => {
    const s = urlParams.get("s");
    const sf = urlParams.get("sf");

    const filters: Record<string, string> = fKeys.reduce((a, v) => ({ ...a, [v]: "Any" }), {});

    Object.keys(filters).forEach(filterKey => {
      const filterValue = urlParams.get(filterKey);
      if (filterValue !== null && filterValue !== "") filters[filterKey] = filterValue;
      else if (initialFilterValues !== undefined) filters[filterKey] = initialFilterValues[filterKey];
    });

    return {
      text: s ?? "",
      fields: (sf !== null && sf !== "") ? sf.split(",") : ["Name"],
      filters
    };
  }, [initialFilterValues, urlParams]);

  const [searchValues, setSearchValues] = useState<SearchValues>(applyInitialFilterValues(filterKeys));

  const applySearchValues = useCallback((filtersToApply: { key: string; value: string; }[]) => {
    const newSearchValues: SearchValues = { ...searchValues, fields: [...searchValues.fields], filters: { ...searchValues.filters } };

    filtersToApply.forEach(filter => {
      if (filter.key === "s") {
        if (filter.value === "") urlParams.delete(filter.key);
        else urlParams.set("s", filter.value);
        newSearchValues.text = filter.value;
      }
      else if (filter.key === "sf") {
        if (filter.value !== "") urlParams.set("sf", filter.value);
        else urlParams.delete(filter.key);
        newSearchValues.fields = filter.value === "" ? [] : filter.value.split(",");
      }
      else {
        if (filter.value !== "Any") urlParams.set(filter.key, filter.value);
        else urlParams.delete(filter.key);
        newSearchValues.filters[filter.key] = filter.value;
      }
    });

    setUrlParams(urlParams);
    setSearchValues({ ...newSearchValues });
  }, [searchValues, setUrlParams, urlParams]);

  const filteredByFilters = useMemo(() => {
    let result = originalList;

    Object.keys(searchValues.filters).forEach(filterKey => {
      const filterValue = searchValues.filters[filterKey];
      if (filterValue !== "Any") {
        result = result.filter(v => {
          const itemValue = (v as never)[filterKey] as unknown[] | undefined;
          if (itemValue !== undefined && itemValue.length > 0) return itemValue[1] === searchValues.filters[filterKey];
          return false;
        });
      }
    });

    return result;
  }, [originalList, searchValues.filters]);

  const fuse = useMemo(() => {
    if (searchValues.fields.length === 0) return undefined;

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: searchValues.fields.map(v => v.toLocaleLowerCase())
    };

    return new Fuse(filteredByFilters, options);
  }, [filteredByFilters, searchValues.fields]);

  const search = useCallback(async () => {
    await new Promise(resolve => {
      const result = (searchValues.text.length >= MinSearchTextLength && fuse !== undefined) ? fuse.search(searchValues.text).map(x => x.item) : filteredByFilters;

      setFilteredList(result);
      setIsPending(false);
      resolve(true);
    }).catch((e: unknown) => { console.error(e); });
  }, [filteredByFilters, fuse, searchValues.text]);

  useEffect(() => {
    const hasFilters = !Object.values(searchValues.filters).every(v => v === "Any");
    const hasText = searchValues.text.length >= MinSearchTextLength;

    if (!hasFilters && !hasText) {
      setIsPending(false);
      setFilteredList(originalList);
      return;
    }

    setIsPending(true);
    const delay = setTimeout(() => { void search(); }, 800);
    return () => { clearTimeout(delay); };
  }, [originalList, search, searchValues.filters, searchValues.text.length]);

  return { searchValues, setFilter: applySearchValues, filteredList, isPending };
}

