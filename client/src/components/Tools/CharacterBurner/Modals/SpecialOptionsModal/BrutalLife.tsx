import { Alert, Button, Grid, Title, Text } from "@mantine/core";
import { Fragment, useCallback } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSpecialStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { GetOrdinalSuffix } from "../../../../../utils/GetOrdinalSuffix";
import { RandomNumber } from "../../../../../utils/RandomNumber";
import { BlockTraitPopover } from "../../BlockText";


export function BrutalLife(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { lifepaths } = useCharacterBurnerLifepathStore();
  const { special, addBrutalLifeTrait } = useCharacterBurnerSpecialStore();

  const rollBrutalLife = useCallback((lifepathNumber: number) => {
    const isBrutal =
      (lifepathNumber < 10) ? RandomNumber(1, 6) <= 4 : RandomNumber(1, 6) <= 2;

    let traitToAdd: [id: dat.TraitId, name: string] | "No Trait" | undefined = "No Trait";

    if (isBrutal) {
      if (lifepathNumber === 5) {
        const trait = ruleset.getTrait("Missing Digit");
        if (trait.id !== null) traitToAdd = [trait.id, trait.name ?? ""];
      }
      else if (lifepathNumber === 6) {
        const trait = ruleset.getTrait("Lame");
        if (trait.id !== null) traitToAdd = [trait.id, trait.name ?? ""];
      }
      else if (lifepathNumber === 7) {
        const trait = ruleset.getTrait("Missing Eye");
        if (trait.id !== null) traitToAdd = [trait.id, trait.name ?? ""];
      }
      else if (lifepathNumber === 8) {
        const trait = ruleset.getTrait("Missing Hand");
        if (trait.id !== null) traitToAdd = [trait.id, trait.name ?? ""];
      }
      else if (lifepathNumber > 8) {
        const trait = ruleset.getTrait("Missing Limb");
        if (trait.id !== null) traitToAdd = [trait.id, trait.name ?? ""];
      }
    }

    addBrutalLifeTrait(traitToAdd);
  }, [addBrutalLifeTrait, ruleset]);

  return (
    <Fragment>
      {stock[1] === "Orc"
        ? lifepaths.length > 4
          ? lifepaths.slice(4).map((v, i) => {
            const traitId = special.stock.brutalLifeTraits[i];
            return (
              <Fragment key={i}>
                <Grid.Col span={1}>
                  <Title order={6} style={{ display: "inline-block" }}>
                    {GetOrdinalSuffix(i + 5)}
                    {" "}
                    Lifepath:
                    {" "}
                    {v.name}
                  </Title>
                </Grid.Col>

                <Grid.Col span={2}>
                  {traitId !== undefined
                    ? traitId === "No Trait"
                      ? <Text style={{ margin: "0 0 0 8px" }}>No Trait</Text>
                      : <BlockTraitPopover trait={traitId} />
                    : <Button variant="outline" size="sm" onClick={() => { rollBrutalLife(i + 5); }}>Roll</Button>}
                </Grid.Col>
              </Fragment>
            );
          })
          : (
            <Grid.Col span={3}>
              <Alert color="blue">
                Orc character only needs to roll for Brutal Life after 5th lifepath.
              </Alert>
            </Grid.Col>
          )
        : null}
    </Fragment>
  );
}
