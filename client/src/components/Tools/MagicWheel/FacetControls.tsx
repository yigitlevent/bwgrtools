import { Grid, Select } from "@mantine/core";
import { Fragment } from "react";

import type { ElementCategories, OneOfWheelObjects, UseMagicWheelReturn } from "../../../hooks/useMagicWheel";


interface MagicWheelAltFacetControlsProps<T extends OneOfWheelObjects> {
  magicWheel: UseMagicWheelReturn<T>;
  spellFacets: T;
  selectedElementCategory?: ElementCategories;
  setSelectedElementCategory?: React.Dispatch<React.SetStateAction<ElementCategories>>;
}

export function FacetControls<T extends OneOfWheelObjects>({ magicWheel, spellFacets, selectedElementCategory, setSelectedElementCategory }: MagicWheelAltFacetControlsProps<T>): React.JSX.Element {
  const columnCount = selectedElementCategory ? 6 : 5;

  return (
    <Grid columns={columnCount} align="center" justify="center" mt="md">
      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Area of Effect"
          variant="filled"
          value={magicWheel.areaOfEffectId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("areaOfEffects", Number(v)); }}
          data={Object.values(spellFacets.areaOfEffects).sort((a, b) => Number(a.id) - Number(b.id)).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      {selectedElementCategory && setSelectedElementCategory && selectedElementCategory in spellFacets ? (
        <Fragment>
          <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
            <Select
              label="Element Category"
              variant="filled"
              value={selectedElementCategory}
              onChange={v => { if (v) setSelectedElementCategory(v); }}
              data={[
                { value: "primeElements", label: "Prime Elements" },
                { value: "lowerElements", label: "Lower Elements" },
                { value: "higherElements", label: "Higher Elements" }
              ]}
              allowDeselect={false}
            />
          </Grid.Col>

          <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
            <Select
              label={selectedElementCategory === "higherElements" ? "Higher Element" : selectedElementCategory === "lowerElements" ? "Lower Element" : "Prime Element"}
              variant="filled"
              value={magicWheel.elementId.toString()}
              onChange={v => { if (v) magicWheel.setFacet(selectedElementCategory as keyof T, Number(v)); }}
              data={(Object.values(spellFacets[selectedElementCategory as keyof OneOfWheelObjects]) as { id: string; name: string; }[])
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map(v => ({ value: v.id, label: v.name }))}
              allowDeselect={false}
            />
          </Grid.Col>
        </Fragment>
      ) : (
        <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
          <Select
            label="Element"
            variant="filled"
            value={magicWheel.elementId.toString()}
            onChange={v => { if (v) magicWheel.setFacet("elements" as keyof T, Number(v)); }}
            data={(Object.values(spellFacets["elements" as keyof OneOfWheelObjects]) as { id: string; name: string; }[])
              .sort((a, b) => Number(a.id) - Number(b.id))
              .map(v => ({ value: v.id, label: v.name }))}
            allowDeselect={false}
          />
        </Grid.Col>
      )}

      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Law"
          variant="filled"
          value={magicWheel.impetusId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("impetus", Number(v)); }}
          data={Object.values(spellFacets.impetus).sort((a, b) => Number(a.id) - Number(b.id)).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Duration"
          variant="filled"
          value={magicWheel.durationId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("duration", Number(v)); }}
          data={Object.values(spellFacets.duration).sort((a, b) => Number(a.id) - Number(b.id)).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Origin"
          variant="filled"
          value={magicWheel.originId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("origins", Number(v)); }}
          data={Object.values(spellFacets.origins).sort((a, b) => Number(a.id) - Number(b.id)).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>
    </Grid>
  );
}
