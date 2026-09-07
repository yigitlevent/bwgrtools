import { Alert, Button, Checkbox, Divider, Grid, Modal, Paper, Select, Stack, TextInput } from "@mantine/core";
import { Fragment, useCallback, useState } from "react";

import { RandomLifepathsBasics } from "./RandomLifepathsModal/RandomLifepathsBasics";
import { RandomLifepathsLists } from "./RandomLifepathsModal/RandomLifepathsLists";
import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useLifepathRandomizerStore } from "../../../../hooks/featureStores/useLifepathRandomizerStore";
import { FilterLifepaths } from "../../../../utils/FilterLifepaths";
import { RandomNumber } from "../../../../utils/RandomNumber";
import { UniqueArray } from "../../../../utils/UniqueArray";


export function RandomLifepathsModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const {
    stock, setting, gender, noDuplicates, maxLeads, maxLifepaths, minLifepaths,
    changeStock, changeGender, changeMaxLeads, changeMaxLifepaths, changeMinLifepaths, toggleNoDuplicates
  } = useLifepathRandomizerStore();

  const { setStockAndReset, setGender } = useCharacterBurnerBasicsStore();
  const { addLifepath } = useCharacterBurnerLifepathStore();

  const [newStock, setNewStock] = useState<Stock>();
  const [newGender, setNewGender] = useState<"Male" | "Female">("Male");
  const [chosenLifepaths, setChosen] = useState<Lifepath[]>([]);
  const [triedTooMuch, setTriedTooMuch] = useState(false);

  const createRandom = useCallback((): void => {
    const tempChosenLifepaths: Lifepath[] = [];

    let leadsCounter = 0;
    let chosenAmount = 0;
    const lpAmount = RandomNumber(minLifepaths - 1, maxLifepaths - 1);

    const chosenStock = ruleset.stocks.find(v => v.id === stock) ?? ruleset.stocks[RandomNumber(0, ruleset.stocks.length - 1)];
    setNewStock(chosenStock);

    if (!chosenStock.id) return;
    const chosenStockId = chosenStock.id;

    const possibleSettings = ruleset.settings.filter(setting => (chosenStock.settingIds ?? []).includes(setting.id ?? -1 as dat.SettingId) && !setting.isSubsetting);
    const chosenSetting = ruleset.settings[ruleset.settings.findIndex(v => v.id === setting)] || possibleSettings[RandomNumber(0, possibleSettings.length - 1)];

    const chosenGender = gender === "Random" ? (RandomNumber(0, 1) === 0 ? "Male" : "Female") : gender;
    setNewGender(chosenGender);

    // The randomizer rolls a hypothetical character that doesn't exist in the real character-burner
    // stores yet, so there's no live attribute state to check exponent-min/max attribute requirements
    // against. Passing an empty `attributes` (rather than omitting it) makes FilterLifepaths evaluate
    // those requirements as not-met instead of falling through to its "unidentified requirement" throw -
    // this means attribute-gated lifepaths are always excluded from random rolls. Variable-age and full
    // attribute-exponent simulation are still not modeled here (see on-screen warning) - closing those
    // gaps needs the randomizer to simulate stat/attribute point allocation as it rolls, which is a
    // larger follow-up.
    const noAttributes = new UniqueArray<dat.AbilityId, CharacterAttribute>();
    const bornLPs = FilterLifepaths({
      rulesetLifepaths: ruleset.lifepaths,
      stock: [chosenStockId, chosenStock.name ?? ""],
      age: 0,
      lifepaths: [],
      gender: chosenGender,
      attributes: noAttributes,
      hasAttribute: () => false
    }).filter(lp => lp.setting[0] === chosenSetting.id);
    tempChosenLifepaths.push(bornLPs[RandomNumber(0, bornLPs.length - 1)]);

    const maxTries = 50;
    let tries = 0;

    while (tries < maxTries && chosenAmount < lpAmount) {
      const lastLifepath = tempChosenLifepaths[tempChosenLifepaths.length - 1];

      const possibilities = FilterLifepaths({
        rulesetLifepaths: ruleset.lifepaths,
        stock: [chosenStockId, chosenStock.name ?? ""],
        age: tempChosenLifepaths.reduce((p, c) => (typeof c.years === "number") ? p + c.years : p + c.years[0], 0) + leadsCounter,
        lifepaths: tempChosenLifepaths,
        gender: chosenGender,
        attributes: noAttributes,
        hasAttribute: () => false,
        noLeads: maxLeads <= leadsCounter ? [lastLifepath.setting[0] ?? -1 as dat.SettingId, lastLifepath.setting[1]] : undefined
      });

      const chosenLifepath = possibilities[RandomNumber(0, possibilities.length - 1)];

      if (chosenLifepath.setting[0] !== lastLifepath.setting[0]) leadsCounter = leadsCounter + 1;


      const isDuplicate = tempChosenLifepaths.filter(v => (v.name === chosenLifepath.name && v.setting === chosenLifepath.setting)).length > 0;
      if (isDuplicate && noDuplicates) {
        tries += 1;
        continue;
      }
      else {
        tries = 0;
        chosenAmount += 1;
        tempChosenLifepaths.push(chosenLifepath);
      }
    }

    if (tempChosenLifepaths.length < minLifepaths) setTriedTooMuch(true);

    setChosen(tempChosenLifepaths);
  }, [gender, maxLeads, maxLifepaths, minLifepaths, noDuplicates, ruleset.lifepaths, ruleset.settings, ruleset.stocks, setting, stock]);

  const transferCharacter = useCallback(() => {
    if (newStock?.id) {
      setStockAndReset([newStock.id, newStock.name ?? ""]);
      setGender(newGender);
      chosenLifepaths.forEach(addLifepath);
      close();
    }
  }, [addLifepath, chosenLifepaths, close, newGender, newStock, setGender, setStockAndReset]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={8} align="center" justify="center">
        <Grid.Col span={{ base: 8, sm: 3, md: 2 }}>
          <Select
            label="Stock"
            variant="filled"
            value={stock.toString()}
            onChange={v => { if (v) changeStock(v === "Random" ? "Random" : Number(v) as dat.StockId); }}
            data={["Random", ...ruleset.stocks.map(v => v.id?.toString() ?? "")]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 8, sm: 3, md: 1 }}>
          <Select
            label="Gender"
            variant="filled"
            value={gender}
            onChange={v => { if (v) changeGender(v); }}
            data={["Random", "Male", "Female"]}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 8, sm: 4, md: 1 }}>
          <TextInput
            label="Max Leads"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxLeads}
            onChange={e => { changeMaxLeads(e.target.value); }}
            variant="filled"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 8, sm: 2, md: 1 }}>
          <TextInput
            label="Min Lifepaths"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minLifepaths}
            onChange={e => { changeMinLifepaths(e.target.value); }}
            variant="filled"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 8, sm: 2, md: 1 }}>
          <TextInput
            label="Max Lifepaths"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxLifepaths}
            onChange={e => { changeMaxLifepaths(e.target.value); }}
            variant="filled"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 8, sm: 3, md: 2 }}>
          <Checkbox
            label="No Duplicates"
            checked={noDuplicates}
            onChange={toggleNoDuplicates}
          />
        </Grid.Col>

        <Grid.Col span={8}>
          <Alert color="blue">Random lifepath selection does not consider lifepaths with variable ages, and always excludes lifepaths gated by an attribute requirement (e.g. emotional attribute minimums/maximums), since it has no way to know what those attributes will end up being. Please make sure to check those requirements seperately.</Alert>
        </Grid.Col>

        <Grid.Col span={8}>
          <Button variant="outline" onClick={() => { createRandom(); }} fullWidth>Generate Random Character</Button>
        </Grid.Col>
      </Grid>

      {chosenLifepaths.length > 0 ? (
        <Grid columns={2} mt="md">
          {triedTooMuch ? (
            <Grid.Col span={2}>
              <Alert color="yellow">There might be lifepaths missing because of the chosen options.</Alert>
            </Grid.Col>
          ) : <Fragment />}

          <Grid.Col span={{ base: 2, md: 1 }}>
            <Divider label="Lifepaths" mb="6px" />

            <Stack gap="md">
              {chosenLifepaths.map((v, i) => (
                <Paper key={i}>
                  {i + 1}
                  .
                  {" "}
                  {`${v.setting[1]} ➞ ${v.name ?? ""}`}
                </Paper>
              )
              )}
            </Stack>

            <Divider label="Basic Information" mt="30px" mb="6px" />
            <RandomLifepathsBasics chosenLifepaths={chosenLifepaths} />
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 1 }}>
            <Divider label="Skills, Traits, and Misc" mb="6px" />
            <RandomLifepathsLists chosenLifepaths={chosenLifepaths} />
          </Grid.Col>

          <Grid.Col span={2}>
            <Button variant="outline" onClick={() => { transferCharacter(); }} fullWidth>I like this Character</Button>
          </Grid.Col>
        </Grid>
      ) : null}
    </Modal>
  );
}
