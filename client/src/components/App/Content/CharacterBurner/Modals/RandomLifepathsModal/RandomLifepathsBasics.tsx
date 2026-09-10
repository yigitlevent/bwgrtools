import { Grid, Text } from "@mantine/core";

import { useCharacterBurnerLifepathStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerTraitStore } from "../../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function RandomLifepathsBasics({ chosenLifepaths }: { chosenLifepaths: Lifepath[]; }): React.JSX.Element {
  const { getAge, getMentalPool, getPhysicalPool, getEitherPool } = useCharacterBurnerLifepathStore();
  const { getResourcePools } = useCharacterBurnerResourceStore();
  const { getSkillPools } = useCharacterBurnerSkillStore();
  const { getTraitPools } = useCharacterBurnerTraitStore();

  const age = getAge(chosenLifepaths);
  const resourcePoints = getResourcePools(chosenLifepaths);
  const mentalPool = getMentalPool(chosenLifepaths);
  const physicalPool = getPhysicalPool(chosenLifepaths);
  const eitherPool = getEitherPool(chosenLifepaths);
  const skillPools = getSkillPools(chosenLifepaths);
  const traitPools = getTraitPools(chosenLifepaths);

  return (
    <Grid columns={2}>
      <Grid.Col span={1}>
        <Text>
          Years:
          {" "}
          {age}
        </Text>
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>
          Resources:
          {" "}
          {resourcePoints.total}
        </Text>
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>
          Stats:
          {" "}
          {mentalPool.total}
          M,
          {" "}
          {physicalPool.total}
          P,
          {" "}
          {eitherPool.total}
          M/P
        </Text>
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>
          Trait Points:
          {" "}
          {traitPools.total}
        </Text>
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>
          General Skill Points:
          {" "}
          {skillPools.general.total}
        </Text>
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>
          Lifepath Skill Points:
          {" "}
          {skillPools.lifepath.total}
        </Text>
      </Grid.Col>
    </Grid>
  );
}
