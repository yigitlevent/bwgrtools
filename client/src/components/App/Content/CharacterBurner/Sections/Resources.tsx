import { ActionIcon, Accordion, Button, Divider, Grid, Group, Popover, Radio, Stack, TextInput, Title, Text, Tooltip } from "@mantine/core";
import { Lock, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";


function DeleteResourceButton({ name, onDelete }: { name: string; onDelete: () => void; }): React.JSX.Element {
  const [confirming, setConfirming] = useState(false);

  return (
    <Popover opened={confirming} onChange={setConfirming} withArrow position="bottom" width={260}>
      <Popover.Target>
        <ActionIcon variant="subtle" onClick={e => { e.stopPropagation(); setConfirming(true); }}>
          <Trash2 size={18} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown onClick={e => { e.stopPropagation(); }}>
        <Stack gap="xs">
          <Text size="sm">
            Remove
            {" "}
            <Text span fw={700}>{name}</Text>
            ? This cannot be undone.
          </Text>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" size="xs" onClick={() => { setConfirming(false); }}>Cancel</Button>

            <Button
              color="red"
              size="xs"
              onClick={() => {
                onDelete();
                setConfirming(false);
              }}
            >
              Remove
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export function Resources({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { resources, getResourcePools, removeResource, editResourceDescription, upgradeResourceCost } = useCharacterBurnerResourceStore();

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
        {Object.keys(resources).map((resourceKey, i) => {
          const resource = resources[resourceKey];
          const isLocked = resource.sourceTraitId !== undefined;
          const rulesetResource = isLocked ? ruleset.getResource(resource.id) : undefined;

          return (
            <Grid.Col key={i} span={{ base: 6, sm: 3 }}>
              <Accordion>
                <Accordion.Item value={resourceKey}>
                  <Accordion.Control
                    icon={
                      isLocked
                        ? (
                          <Tooltip color="gray" label="Granted by a trait, cannot be removed while the trait is open.">
                            <Lock size={18} />
                          </Tooltip>
                        )
                        : <DeleteResourceButton name={resource.name} onDelete={() => { removeResource(resourceKey); }} />
                    }
                  >
                    <Text size="lg">
                      {resource.name}
                      {" "}
                      (
                      {resource.cost}
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
                          {resource.type[1]}
                        </Text>
                      </Grid.Col>

                      {resource.modifiers.length > 0
                        ? (
                          <Grid.Col span={2}>
                            <Text size="sm">
                              Modifiers:
                              {resource.modifiers.join(", ")}
                            </Text>
                          </Grid.Col>
                        )
                        : null}

                      {isLocked && rulesetResource !== undefined && rulesetResource.costs.length > 1
                        ? (
                          <Grid.Col span={2}>
                            <Title order={6}>
                              Tier (first
                              {" "}
                              {resource.minCost}
                              {" "}
                              rps free)
                            </Title>

                            <Radio.Group value={resource.cost.toString()} onChange={v => { upgradeResourceCost(resourceKey, parseInt(v)); }}>
                              {rulesetResource.costs.map((v, ii) => {
                                if (v[1] === null || v[1] === "") return null;
                                const disabled = v[0] < (resource.minCost ?? 0);
                                return <Radio key={ii} disabled={disabled} label={`${v[1]} (${v[0].toString()}rps)`} value={v[0].toString()} />;
                              })}
                            </Radio.Group>
                          </Grid.Col>
                        )
                        : null}

                      <Grid.Col span={2}>
                        <TextInput
                          label="Description"
                          variant="filled"
                          value={resource.description}
                          onChange={e => { editResourceDescription(resourceKey, e.target.value); }}
                        />
                      </Grid.Col>
                    </Grid>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Grid.Col>
          );
        })}
      </Fragment>
    </Grid>
  );
}
