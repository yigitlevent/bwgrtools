import { Button, Grid, Modal, Select, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerSkillStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";


export function GeneralSkillModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { skills, addGeneralSkill } = useCharacterBurnerSkillStore();
  const { hasAttribute } = useCharacterBurnerAttributeStore();

  const [possibleSkills, setPossibleSkills] = useState<Skill[]>([]);
  const [chosenSkill, setChosenSkill] = useState<Skill>();

  const addNewSkill = (): void => {
    if (chosenSkill) {
      addGeneralSkill(chosenSkill);
      close();
    }
  };

  const getRestrictionString = (skill: Skill): string | null => {
    if (skill.restriction) {
      const rest = [];
      if (skill.restriction.onlyStock) rest.push(`Only ${skill.restriction.onlyStock[1]}.`);
      if (skill.restriction.onlyWithAbility) rest.push(`Only ${skill.restriction.onlyWithAbility[1]}.`);
      if (skill.restriction.onlyAtBurn) rest.push("Only during character burn.");
      return rest.join(" ");
    }
    return null;
  };

  useEffect(() => {
    if (ruleset.fetchState === "done") {
      const possible = ruleset.skills.filter(skill =>
        skill.id
        && !skills.has(skill.id)
        && (skill.stock === stock || (skill.restriction?.onlyStock ? skill.restriction.onlyStock[0] === stock[0] ? true : false : true))
        && (skill.restriction?.onlyWithAbility ? hasAttribute(skill.restriction.onlyWithAbility[0]) ? true : false : true)
        && !skill.flags.dontList
      );
      setPossibleSkills(possible);
    }
  }, [hasAttribute, ruleset.fetchState, ruleset.skills, skills, stock]);

  useEffect(() => {
    if (possibleSkills.length > 0) setChosenSkill(possibleSkills[0]);
  }, [possibleSkills]);

  const groupedSkillData = useMemo(() => {
    const sorted = [...possibleSkills].sort((a, b) => a.category[1].localeCompare(b.category[1]) || (a.name ?? "").localeCompare(b.name ?? ""));
    const groups = new Map<string, string[]>();
    sorted.forEach(v => {
      const groupName = v.category[1];
      const items = groups.get(groupName) ?? [];
      items.push(v.id?.toString() ?? "");
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [possibleSkills]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={1} gap="md" align="center" justify="center">
        {chosenSkill ? (
          <Grid.Col span={1}>
            <Select
              label="Chosen Skill"
              value={chosenSkill.id?.toString() ?? null}
              data={groupedSkillData}
              onChange={v => {
                const found = possibleSkills.find(s => s.id?.toString() === v);
                if (found) setChosenSkill(found);
              }}
              allowDeselect={false}
              searchable
            />
          </Grid.Col>
        ) : null}

        {chosenSkill ? (
          <Grid.Col span={1}>
            <Grid gap="xs" columns={2}>
              <Grid.Col span={2}>
                <Title order={6}>{chosenSkill.name}</Title>
              </Grid.Col>

              <Grid.Col span={{ base: 2, md: 1 }}>
                {chosenSkill.roots ? (
                  <Text size="xs">
                    Root:
                    {chosenSkill.roots.join("/")}
                  </Text>
                ) : null}
              </Grid.Col>

              <Grid.Col span={{ base: 2, md: 1 }}>
                <Text size="xs">
                  Type:
                  {chosenSkill.type[1]}
                </Text>
              </Grid.Col>

              <Grid.Col span={2}>
                <Text size="xs">
                  Tools:
                  {chosenSkill.tool.tool}
                  {" "}
                  {chosenSkill.tool.description}
                </Text>
              </Grid.Col>

              <Grid.Col span={2}>
                {chosenSkill.restriction ? (
                  <Text size="xs">
                    Restrictions:
                    {getRestrictionString(chosenSkill)}
                  </Text>
                ) : null}
              </Grid.Col>

              <Grid.Col span={2}>
                {chosenSkill.description ? chosenSkill.description.split("<br>").map(v => <Text key={v} size="sm">{v}</Text>) : null}
              </Grid.Col>
            </Grid>
          </Grid.Col>
        ) : null}

        <Grid.Col span={1}>
          <Button variant="outline" size="md" onClick={addNewSkill} fullWidth>Add Skill</Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
