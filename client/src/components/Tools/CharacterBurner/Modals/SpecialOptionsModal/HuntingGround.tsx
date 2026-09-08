import { Button, Grid, Title, Text } from "@mantine/core";
import { Fragment, useCallback } from "react";

import { useCharacterBurnerBasicsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSpecialStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { Clamp } from "../../../../../utils/Clamp";
import { RandomNumber } from "../../../../../utils/RandomNumber";


export function HuntingGround(): React.JSX.Element {
  const { stock } = useCharacterBurnerBasicsStore();
  const { lifepaths } = useCharacterBurnerLifepathStore();
  const { special, setHuntingGround } = useCharacterBurnerSpecialStore();

  const rollTerritory = useCallback(() => {
    const huntingGrounds: HuntingGroundsList[] = ["Waste", "Marginal", "Typical", "Plentiful", "Untouched"];
    const lastLp = lifepaths[lifepaths.length - 1];
    const roll = RandomNumber(1, 6) + RandomNumber(1, 6) + (lastLp.name === "Dominant" && lastLp.setting[1] === "Wild Pack" ? 1 : 0);

    let category = 0;
    if (roll === 2) category = 0;
    else if (roll < 7) category = 1;
    else if (roll < 10) category = 2;
    else if (roll < 12) category = 3;
    else category = 4;

    const lastSetting = lastLp.setting;
    if (["Captive", "Slave to the Legion", "Outcast Wolf"].includes(lastSetting[1])) {
      category = category - 1;
    }
    else if (lastSetting[1] === "Spirit Hunter") {
      category = category + 1;
    }
    else if (lastSetting[1] === "Ghost of the Deeping Wood") {
      category = category + 2;
    }

    setHuntingGround(huntingGrounds[Clamp(category, 0, 4)]);
  }, [setHuntingGround, lifepaths]);

  return (
    <Fragment>
      {stock[1] === "Great Wolf" ? (
        <Fragment>
          <Grid.Col span={1}>
            <Title order={5} style={{ display: "inline-block" }}>Hunting Ground</Title>
          </Grid.Col>

          <Grid.Col span={2}>
            {special.stock.huntingGround ? <Text>{special.stock.huntingGround}</Text> : <Fragment>—</Fragment>}
            <Button variant="outline" size="sm" onClick={() => { rollTerritory(); }} disabled={special.stock.huntingGround !== undefined}>Roll</Button>
          </Grid.Col>
        </Fragment>
      ) : null}
    </Fragment>
  );
}
