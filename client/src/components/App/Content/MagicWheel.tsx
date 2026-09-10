import { useState } from "react";

import { MagicWheelShell } from "./MagicWheel/MagicWheelShell";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";

import type { BandBlock } from "../../../hooks/useMagicWheel";


export function MagicWheel(): React.JSX.Element {
  const { spellFacets } = useRulesetStore();

  const [bands, setBands] =
    useState<Record<keyof SpellFacets, BandBlock>>({
      origins: { index: 0, angle: 2 * Math.PI / spellFacets.origins.length, currentAmount: 0, targetAmount: 0, items: spellFacets.origins.map(v => v.name) },
      duration: { index: 1, angle: 2 * Math.PI / spellFacets.duration.length, currentAmount: 0, targetAmount: 0, items: spellFacets.duration.map(v => v.name) },
      impetus: { index: 2, angle: 2 * Math.PI / spellFacets.impetus.length, currentAmount: 0, targetAmount: 0, items: spellFacets.impetus.map(v => v.name) },
      elements: { index: 3, angle: 2 * Math.PI / spellFacets.elements.length, currentAmount: 0, targetAmount: 0, items: spellFacets.elements.map(v => v.name) },
      areaOfEffects: { index: 4, angle: 2 * Math.PI / spellFacets.areaOfEffects.length, currentAmount: 0, targetAmount: 0, items: spellFacets.areaOfEffects.map(v => v.name) }
    });

  return (
    <MagicWheelShell<SpellFacets>
      spellFacets={spellFacets}
      bands={bands}
      setBands={setBands}
      isAvailable={() => true}
    />
  );
}
