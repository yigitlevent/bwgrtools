import { Button, Grid, Group, Modal, Popover, Select, Stack, Text } from "@mantine/core";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { LifepathBox } from "../../LifepathLists/LifepathBox";


export function LifepathSelectionModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const { availableLifepaths, lifepaths, addLifepath, removeLastLifepath } = useCharacterBurnerLifepathStore();

  const [disabled, setDisabled] = useState(false);
  const [chosen, setChosen] = useState<Lifepath | undefined>(availableLifepaths[0]);
  const [available, setAvailable] = useState(availableLifepaths);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const lastLifepath = lifepaths[lifepaths.length - 1] as Lifepath | undefined;

  const handle = useCallback((lifepath?: Lifepath) => {
    setDisabled(true);
    if (lifepath !== undefined) addLifepath(lifepath);
    else removeLastLifepath();
  }, [addLifepath, removeLastLifepath]);

  useEffect(() => {
    setAvailable(availableLifepaths);
    setChosen(availableLifepaths[0]);
    setDisabled(false);
  }, [availableLifepaths]);

  const groupedLifepathData = useMemo(() => {
    const groups = new Map<string, { value: string; label: string; }[]>();
    available.forEach((v, i) => {
      const groupName = v.setting[1];
      const items = groups.get(groupName) ?? [];
      items.push({ value: i.toString(), label: v.name ?? "" });
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [available]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="1000px">
      <Grid columns={5} gap="md" align="center" justify="center">
        <Grid.Col span={{ base: 5, sm: 3, md: 3 }}>
          <Select
            label="Lifepath"
            variant="filled"
            value={chosen !== undefined ? available.indexOf(chosen).toString() : null}
            data={groupedLifepathData}
            onChange={v => { if (v !== null) setChosen(available[Number(v)]); }}
            allowDeselect={false}
            disabled={disabled}
            searchable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 5, sm: 1, md: 1 }}>
          <Button variant="outline" size="md" onClick={() => { handle(chosen); }} fullWidth disabled={disabled}>Add Lifepath</Button>
        </Grid.Col>

        <Grid.Col span={{ base: 5, sm: 1, md: 1 }}>
          <Popover opened={confirmingRemove} onChange={setConfirmingRemove} withArrow position="bottom" width={280}>
            <Popover.Target>
              <Button
                variant="outline"
                size="md"
                onClick={() => { setConfirmingRemove(true); }}
                fullWidth
                disabled={disabled || lastLifepath === undefined}
              >
                Remove Last Lifepath
              </Button>
            </Popover.Target>

            <Popover.Dropdown>
              <Stack gap="xs">
                <Text size="sm">
                  Remove
                  {" "}
                  <Text span fw={700}>{lastLifepath?.name}</Text>
                  {" "}
                  (the most recently chosen lifepath)? Lifepaths can only be removed in reverse order. This cannot be undone.
                </Text>

                <Group justify="flex-end" gap="xs">
                  <Button variant="subtle" size="xs" onClick={() => { setConfirmingRemove(false); }}>Cancel</Button>

                  <Button
                    color="red"
                    size="xs"
                    onClick={() => {
                      handle();
                      setConfirmingRemove(false);
                    }}
                  >
                    Remove
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Grid.Col>

        <Fragment>
          {lifepaths.map((lp, i) => (
            <Grid.Col key={i} span={5}>
              <LifepathBox lifepath={lp} />
            </Grid.Col>
          ))}
        </Fragment>
      </Grid>
    </Modal>
  );
}
