import { ActionIcon, Accordion, Button, Divider, Grid, TextInput, Title, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { Fragment } from "react";

import { useCharacterBurnerResourceStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";


export function Resources({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const { resources, getResourcePools, removeResource, editResourceDescription } = useCharacterBurnerResourceStore();

  const resourcePools = getResourcePools();

  return (
    <Grid columns={6} justify="flex-start" align="center" mb="xl">
      <Grid.Col span={6}>
        <Title order={4}>Resources</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 5 }}>
        <Text>
          Total Points:
          {resourcePools.total}
          , Remaining:
          {resourcePools.remaining}
        </Text>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 1 }}>
        <Button variant="outline" size="sm" onClick={() => { openModal("re"); }} fullWidth>Add Resource</Button>
      </Grid.Col>

      <Fragment>
        {Object.keys(resources).map((resourceKey, i) => (
          <Grid.Col key={i} span={{ base: 6, sm: 3 }}>
            <Accordion>
              <Accordion.Item value={resourceKey}>
                <Accordion.Control
                  icon={(
                    <ActionIcon variant="subtle" onClick={e => { e.stopPropagation(); removeResource(resourceKey); }}>
                      <Trash2 size={18} />
                    </ActionIcon>
                  )}
                >
                  <Text size="lg">
                    {resources[resourceKey].name}
                    {" "}
                    (
                    {resources[resourceKey].cost}
                    rps)
                  </Text>
                </Accordion.Control>

                <Accordion.Panel>
                  <Grid columns={2} gap="xs" align="center">
                    <Grid.Col span={2}>
                      <Divider />
                    </Grid.Col>

                    <Grid.Col span={2}>
                      <Text size="sm">
                        Type:
                        {resources[resourceKey].type[1]}
                      </Text>
                    </Grid.Col>

                    {resources[resourceKey].modifiers.length > 0 ? (
                      <Grid.Col span={2}>
                        <Text size="sm">
                          Modifiers:
                          {resources[resourceKey].modifiers.join(", ")}
                        </Text>
                      </Grid.Col>
                    ) : null}

                    <Grid.Col span={2}>
                      <TextInput
                        label="Description"
                        variant="filled"
                        value={resources[resourceKey].description}
                        onChange={e => { editResourceDescription(resourceKey, e.target.value); }}
                      />
                    </Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Grid.Col>
        )
        )}
      </Fragment>
    </Grid>
  );
}
