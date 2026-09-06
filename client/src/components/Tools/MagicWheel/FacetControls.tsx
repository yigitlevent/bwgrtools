import { Button, Grid, Select } from "@mantine/core";
import { Fragment } from "react";

import type { ElementCategories, OneOfWheelObjects, OneOfWheelObjectKeys, UseMagicWheelReturn } from "../../../hooks/useMagicWheel";


interface MagicWheelAltFacetControlsProps<T extends OneOfWheelObjects, P extends OneOfWheelObjectKeys> {
  magicWheel: UseMagicWheelReturn<T, P>;
  spellFacets: T;
  setFacetsSet: React.Dispatch<React.SetStateAction<boolean>>;
  selectedElementCategory?: ElementCategories;
  setSelectedElementCategory?: React.Dispatch<React.SetStateAction<ElementCategories>>;
}

export function FacetControls<T extends OneOfWheelObjects, P extends OneOfWheelObjectKeys>({ magicWheel, spellFacets, setFacetsSet, selectedElementCategory, setSelectedElementCategory }: MagicWheelAltFacetControlsProps<T, P>): React.JSX.Element {
  const columnCount = selectedElementCategory ? 6 : 5;

  return (
    <Grid columns={columnCount} align="center" justify="center" mt="md">
      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Area of Effect"
          variant="filled"
          value={magicWheel.areaOfEffectId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("areaOfEffects" as P, Number(v)); }}
          data={Object.values(spellFacets.areaOfEffects).sort(a => a.id).map(v => ({ value: v.id.toString(), label: v.name }))}
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
              onChange={v => { if (v) magicWheel.setFacet(selectedElementCategory as P, Number(v)); }}
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
            onChange={v => { if (v) magicWheel.setFacet("elements" as P, Number(v)); }}
            data={(Object.values(spellFacets[selectedElementCategory as keyof OneOfWheelObjects]) as { id: string; name: string; }[])
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
          onChange={v => { if (v) magicWheel.setFacet("impetus" as P, Number(v)); }}
          data={Object.values(spellFacets.impetus).sort(a => a.id).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Duration"
          variant="filled"
          value={magicWheel.durationId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("duration" as P, Number(v)); }}
          data={Object.values(spellFacets.duration).sort(a => a.id).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: columnCount, sm: 2, md: 1 }}>
        <Select
          label="Origin"
          variant="filled"
          value={magicWheel.originId.toString()}
          onChange={v => { if (v) magicWheel.setFacet("origins" as P, Number(v)); }}
          data={Object.values(spellFacets.origins).sort(a => a.id).map(v => ({ value: v.id.toString(), label: v.name }))}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={columnCount}>
        <Button
          variant="outline"
          onClick={() => { setFacetsSet(true); }}
          fullWidth
        >
          Bring me the Wheel
        </Button>
      </Grid.Col>
    </Grid>
  );
}
