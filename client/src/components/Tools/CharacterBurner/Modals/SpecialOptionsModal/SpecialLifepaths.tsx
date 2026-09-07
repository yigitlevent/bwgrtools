import { Grid, Select, Text } from "@mantine/core";
import { Fragment, useCallback } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerLifepathStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { AbilityButton } from "../../../../Shared/AbilityButton";


export function SpecialLifepaths(): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { lifepaths } = useCharacterBurnerLifepathStore();

  const { special, modifyVariableAge, modifyCompanionLifepath, modifyCompanionSkills } = useCharacterBurnerMiscStore();

  const getPossibleLifepaths = useCallback(() => {
    return ruleset.lifepaths
      .filter(lifepath => !lifepath.flags.isBorn && ["City Dweller", "Noble", "Professional Soldier", "Villager"].some(v => (lifepath.setting[1]).includes(v)))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .filter((lifepath): lifepath is Lifepath & { id: dat.LifepathId; } => lifepath.id !== null);
  }, [ruleset.lifepaths]);

  const possibleLifepaths = getPossibleLifepaths();

  return (
    <Fragment>
      {lifepaths // variable age
        .map((lifepath, i) => {
          if (Array.isArray(lifepath.years) && lifepath.id) {
            const years = lifepath.years;
            const lifepathId = lifepath.id;
            const chosenYears = special.variableAge[lifepathId];
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
                    onClick={() => { modifyVariableAge(lifepathId, chosenYears ? chosenYears + 1 : 1, years); }}
                    onContextMenu={() => { modifyVariableAge(lifepathId, chosenYears ? chosenYears - 1 : 1, years); }}
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
          if (lifepath.companion?.givesSkills) {
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
                    value={special.companionLifepath[companionName]?.toString() ?? null}
                    data={possibleLifepaths.map(lp => ({ value: lp.id.toString(), label: lp.name ?? "" }))}
                    onChange={v => {
                      const found = possibleLifepaths.find(lp => lp.id.toString() === v);
                      if (found) {
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
