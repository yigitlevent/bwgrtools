import { useState } from "react";

import { MagicWheelShell } from "./MagicWheel/MagicWheelShell";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";

import type { ElementCategories, BandBlock } from "../../../hooks/useMagicWheel";


export function MagicWheelAlt(): React.JSX.Element {
  const [selectedElementCategory, setSelectedElementCategory] = useState<ElementCategories>("primeElements");

  const { spellAltFacets } = useRulesetStore();
  const altDurationFacets = Object.groupBy(spellAltFacets.duration, v => v.name) as Record<string, SpellDurationFacet[]>;
  const altAreaOfEffectFacets = Object.groupBy(spellAltFacets.areaOfEffects, v => v.name) as Record<string, SpellAreaOfEffectFacet[]>;
  const [spellFacets] = useState<AltSpellFacets>({
    lowerElements: spellAltFacets.lowerElements,
    primeElements: spellAltFacets.primeElements,
    higherElements: spellAltFacets.higherElements,
    areaOfEffects:
      Object.keys(altAreaOfEffectFacets)
        .map(key => {
          return {
            ...altAreaOfEffectFacets[key][0]
          };
        }),
    origins: spellAltFacets.origins,
    impetus: spellAltFacets.impetus,
    duration:
      Object.keys(altDurationFacets)
        .map(key => {
          return {
            ...altDurationFacets[key][0]
          };
        })
  });

  const [bands, setBands] =
    useState<Record<keyof AltSpellFacets, BandBlock>>({
      origins: { index: 0, angle: 2 * Math.PI / spellFacets.origins.length, currentAmount: 0, targetAmount: 0, items: spellFacets.origins.map(v => v.name) },
      duration: { index: 1, angle: 2 * Math.PI / spellFacets.duration.length, currentAmount: 0, targetAmount: 0, items: spellFacets.duration.map(v => v.name) },
      impetus: { index: 2, angle: 2 * Math.PI / spellFacets.impetus.length, currentAmount: 0, targetAmount: 0, items: spellFacets.impetus.map(v => v.name) },
      primeElements: { index: 3, angle: 2 * Math.PI / spellFacets.primeElements.length, currentAmount: 0, targetAmount: 0, items: spellFacets.primeElements.map(v => v.name) },
      lowerElements: { index: 3, angle: 2 * Math.PI / spellFacets.lowerElements.length, currentAmount: 0, targetAmount: 0, items: spellFacets.lowerElements.map(v => v.name) },
      higherElements: { index: 3, angle: 2 * Math.PI / spellFacets.higherElements.length, currentAmount: 0, targetAmount: 0, items: spellFacets.higherElements.map(v => v.name) },
      areaOfEffects: { index: 4, angle: 2 * Math.PI / spellFacets.areaOfEffects.length, currentAmount: 0, targetAmount: 0, items: spellFacets.areaOfEffects.map(v => v.name) }
    });

  return (
    <MagicWheelShell<AltSpellFacets>
      spellFacets={spellFacets}
      bands={bands}
      setBands={setBands}
      isAvailable={key => !key.toLowerCase().includes("element") || selectedElementCategory === key}
      selectedElementCategory={selectedElementCategory}
      setSelectedElementCategory={setSelectedElementCategory}
    />
  );
}
