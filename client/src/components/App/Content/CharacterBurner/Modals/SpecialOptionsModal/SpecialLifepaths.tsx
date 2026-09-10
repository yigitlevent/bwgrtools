import { Grid, Select, Text } from "@mantine/core";
import { Fragment, useCallback } from "react";

import { useRulesetStore } from "../../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerLifepathStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSpecialStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { RecordGet } from "../../../../../../utils/RecordGet";
import { AbilityButton } from "../../../../../Shared/AbilityButton";


export function SpecialLifepaths(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { lifepaths } = useCharacterBurnerLifepathStore();

  const { special, modifyVariableAge, modifyCompanionLifepath, modifyCompanionSkills } = useCharacterBurnerSpecialStore();

  const getPossibleLifepaths = useCallback(() => {
    return ruleset.lifepaths
      .filter(lifepath => lifepath.flags.isBorn !== true && ["City Dweller", "Noble", "Professional Soldier", "Villager"].some(v => (lifepath.setting[1]).includes(v)))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .filter((lifepath): lifepath is Lifepath & { id: dat.LifepathId; } => lifepath.id !== null);
  }, [ruleset.lifepaths]);

  const possibleLifepaths = getPossibleLifepaths();

  return (
    <Fragment>
      {lifepaths // variable age
        .map((lifepath, i) => {
          if (Array.isArray(lifepath.years) && lifepath.id !== null) {
            const years = lifepath.years;
            const lifepathId = lifepath.id;
            // Checked via `in` rather than truthiness so a resolved value of 0 years is treated as
            // already-chosen (not re-rolled from scratch on the next +/- click).
            const hasChosenYears = lifepathId in special.variableAge;
            const chosenYears: number | undefined = hasChosenYears ? special.variableAge[lifepathId] : undefined;
            return (
              <Fragment key={i}>
                <Grid.Col span={1}>
                  <Text>
                    {lifepath.name}
                    {" "}
                    years
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <AbilityButton
                    onClick={() => { modifyVariableAge(lifepathId, chosenYears !== undefined ? chosenYears + 1 : 1, years); }}
                    onContextMenu={() => { modifyVariableAge(lifepathId, chosenYears !== undefined ? chosenYears - 1 : 1, years); }}
                  >
                    {chosenYears}
                  </AbilityButton>
                </Grid.Col>
              </Fragment>
            );
          }
          else return null;
        })}

      {lifepaths // companion gives skills
        .map((lifepath, i) => {
          if (lifepath.companion?.givesSkills === true) {
            const companionName = lifepath.companion.name;

            return (
              <Fragment key={i}>
                <Grid.Col span={1}>
                  <Text>
                    {lifepath.name}
                    {" "}
                    {companionName}
                    {" "}
                    lifepath
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Select
                    label={`${companionName}'s Lifepath`}
                    value={RecordGet(special.companionLifepath, companionName)?.toString() ?? null}
                    data={possibleLifepaths.map(lp => ({ value: lp.id.toString(), label: lp.name ?? "" }))}
                    onChange={v => {
                      const found = possibleLifepaths.find(lp => lp.id.toString() === v);
                      if (found !== undefined) {
                        modifyCompanionLifepath(companionName, found.id);
                        modifyCompanionSkills(found.id, ruleset.getLifepath(found.id).skills);
                      }
                    }}
                    allowDeselect={false}
                    size="sm"
                  />
                </Grid.Col>
              </Fragment>
            );
          }
          else return null;
        })}
    </Fragment>
  );
}
