import { Grid, Select, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerMiscStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function SpecialLessonOfOne(): React.JSX.Element {
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();
  const { resources } = useCharacterBurnerResourceStore();
  const { special, modifyLessonOfOneRelationship } = useCharacterBurnerMiscStore();

  if (!hasTraitOpenByName("Lesson of One")) return <Fragment />;

  const relationshipOptions = Object.entries(resources)
    .filter(([key, v]) => v.type[1] === "Relationship" && key !== "lesson-of-one")
    .map(([key, v]) => ({ value: key, label: `${v.name} (${v.cost.toString()} rps)` }));

  return (
    <Fragment>
      <Grid.Col span={1}>
        <Title order={5} style={{ display: "inline-block" }}>Lesson of One</Title>
      </Grid.Col>

      <Grid.Col span={2}>
        <Select
          label="Mentor Relationship"
          value={special.lessonOfOneRelationship ?? null}
          data={relationshipOptions}
          onChange={v => { modifyLessonOfOneRelationship(v ?? undefined); }}
          placeholder={relationshipOptions.length === 0 ? "No relationships owned" : undefined}
          disabled={relationshipOptions.length === 0}
          size="sm"
        />
      </Grid.Col>
    </Fragment>
  );
}
