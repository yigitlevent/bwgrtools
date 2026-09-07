import { Grid, Group, Paper, Title, Text } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { AbilityButton } from "../../../Shared/AbilityButton";

import type { UniqueArrayItem } from "../../../../utils/UniqueArray";


function Attribute({ attribute }: { attribute: UniqueArrayItem<dat.AbilityId, CharacterAttribute>; }): React.JSX.Element {
  const { getAttribute, shiftAttributeShade } = useCharacterBurnerAttributeStore();

  const attributeDetails = getAttribute([attribute.id, attribute.name]);

  return (
    <Fragment>
      {attribute.hasShade ? (
        <AbilityButton
          disabled={attributeDetails.exponent < 6}
          onClick={() => { shiftAttributeShade(attribute.id); }}
          onContextMenu={() => { shiftAttributeShade(attribute.id); }}
        >
          {attributeDetails.shade}
        </AbilityButton>
      ) : null}

      <AbilityButton disabled>
        {attributeDetails.exponent}
      </AbilityButton>
    </Fragment>
  );
}

export function Attributes(): React.JSX.Element {
  const { attributes } = useCharacterBurnerAttributeStore();

  return (
    <Grid columns={6} align="center" gap="xl" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Attributes</Title>
      </Grid.Col>

      <Fragment>
        {attributes
          .map((attribute, i) => (
            <Grid.Col key={i} span={{ base: 3, sm: 2, md: 1 }}>
              <Paper shadow="xs" radius={0} p={8} withBorder>
                <Group justify="space-between" gap={0}>
                  <Text>{attribute.name}</Text>

                  <Group gap={0}>
                    <Attribute attribute={attribute} />
                  </Group>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
      </Fragment>
    </Grid>
  );
}
