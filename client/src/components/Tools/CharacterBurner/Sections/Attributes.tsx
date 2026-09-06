import { Grid, Group, Title } from "@mantine/core";
import { Fragment } from "react";

import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { AbilityButton } from "../../../Shared/AbilityButton";
import { BlockText } from "../BlockText";

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
            <Grid.Col key={i} span={{ base: 6, sm: 3, md: 2 }}>
              <Grid columns={5} justify="flex-start" align="center" style={{ background: "#353535", borderRadius: 1, marginTop: "8px" }}>
                <BlockText text={attribute.name} hasLeftPadding />

                <Grid.Col span="content">
                  <Group gap={0}>
                    <Attribute attribute={attribute} />
                  </Group>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          )
          )}
      </Fragment>
    </Grid>
  );
}
