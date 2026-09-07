import { Grid, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { GeneralAbilityModal } from "./GeneralAbilityModal";
import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerSkillStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";


function GetRestrictionString(skill: Skill): string | null {
  if (skill.restriction) {
    const rest = [];
    if (skill.restriction.onlyStock) rest.push(`Only ${skill.restriction.onlyStock[1]}.`);
    if (skill.restriction.onlyWithAbility) rest.push(`Only ${skill.restriction.onlyWithAbility[1]}.`);
    if (skill.restriction.onlyAtBurn) rest.push("Only during character burn.");
    return rest.join(" ");
  }
  return null;
}

function SkillDetails({ skill }: { skill: Skill; }): React.JSX.Element {
  return (
    <Grid gap="xs" columns={2}>
      <Grid.Col span={2}>
        <Title order={6}>{skill.name}</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 2, md: 1 }}>
        {skill.roots ? (
          <Text size="xs">
            Root:
            {skill.roots.join("/")}
          </Text>
        ) : null}
      </Grid.Col>

      <Grid.Col span={{ base: 2, md: 1 }}>
        <Text size="xs">
          Type:
          {skill.type[1]}
        </Text>
      </Grid.Col>

      <Grid.Col span={2}>
        <Text size="xs">
          Tools:
          {skill.tool.tool}
          {" "}
          {skill.tool.description}
        </Text>
      </Grid.Col>

      <Grid.Col span={2}>
        {skill.restriction ? (
          <Text size="xs">
            Restrictions:
            {GetRestrictionString(skill)}
          </Text>
        ) : null}
      </Grid.Col>

      <Grid.Col span={2}>
        {skill.description ? skill.description.split("<br>").map(v => <Text key={v} size="sm">{v}</Text>) : null}
      </Grid.Col>
    </Grid>
  );
}

export function GeneralSkillModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { stock } = useCharacterBurnerBasicsStore();
  const { skills, addGeneralSkill } = useCharacterBurnerSkillStore();
  const { hasAttribute } = useCharacterBurnerAttributeStore();

  const [possibleSkills, setPossibleSkills] = useState<Skill[]>([]);

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

  return (
    <GeneralAbilityModal
      isOpen={isOpen}
      close={close}
      title="Chosen Skill"
      addButtonLabel="Add Skill"
      possibleAbilities={possibleSkills}
      renderDetails={skill => <SkillDetails skill={skill} />}
      onAdd={addGeneralSkill}
    />
  );
}
