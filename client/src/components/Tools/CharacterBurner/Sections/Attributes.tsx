import { Grid, Group, Paper, Title, Text, Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import { Fragment } from "react";

import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { HesitationSituationalTraits } from "../../../../logic/attributeFormulas";
import { AbilityButton } from "../../../Shared/AbilityButton";

import type { UniqueArrayItem } from "../../../../utils/UniqueArray";


function Attribute({ attribute }: { attribute: UniqueArrayItem<dat.AbilityId, CharacterAttribute>; }): React.JSX.Element {
  const { getAttribute, shiftAttributeShade } = useCharacterBurnerAttributeStore();

  const attributeDetails = getAttribute([attribute.id, attribute.name]);

  return (
    <Fragment>
      {attribute.hasShade
        ? (
          <AbilityButton
            disabled={attributeDetails.exponent < 6}
            onClick={() => { shiftAttributeShade(attribute.id); }}
            onContextMenu={() => { shiftAttributeShade(attribute.id); }}
          >
            {attributeDetails.shade}
          </AbilityButton>
        )
        : null}

      <AbilityButton disabled>
        {attributeDetails.exponent}
      </AbilityButton>
    </Fragment>
  );
}

export function Attributes(): React.JSX.Element {
  const { attributes } = useCharacterBurnerAttributeStore();
  const { hasTraitOpenByName } = useCharacterBurnerTraitStore();

  const hesitationNotes = HesitationSituationalTraits.filter(v => hasTraitOpenByName(v.name));

  return (
    <Grid columns={6} align="center" gap="xl" mb="xl">
      <Grid.Col span={6}>
        <Group gap={4}>
          <Title order={4}>Attributes</Title>

          <Tooltip
            multiline
            w={320}
            color="gray"
            label="Attributes are derived from your stats, lifepaths, and traits. The letter is the attribute's shade (Black/Grey/White); click it to shift shade where allowed. The number (exponent) is calculated automatically."
          >
            <Info size={14} />
          </Tooltip>
        </Group>
      </Grid.Col>

      <Fragment>
        {attributes
          .map((attribute, i) => (
            <Grid.Col key={i} span={{ base: 3, sm: 2, md: 1 }}>
              <Paper shadow="xs" radius={0} p={8} withBorder>
                <Group justify="space-between" gap={0}>
                  <Group gap={4}>
                    <Text>{attribute.name}</Text>

                    {attribute.name === "Hesitation" && hesitationNotes.length > 0
                      ? (
                        <Tooltip
                          multiline
                          w={320}
                          color="gray"
                          label={hesitationNotes.map(v => `${v.name}: ${v.note}`).join("\n\n")}
                        >
                          <Info size={14} />
                        </Tooltip>
                      )
                      : null}
                  </Group>

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
