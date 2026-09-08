import { Button, Grid, Modal, Select } from "@mantine/core";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { LifepathBox } from "../../LifepathLists/LifepathBox";


export function LifepathSelectionModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const { availableLifepaths, lifepaths, addLifepath, removeLastLifepath } = useCharacterBurnerLifepathStore();

  const [disabled, setDisabled] = useState(false);
  const [chosen, setChosen] = useState<Lifepath | undefined>(availableLifepaths[0]);
  const [available, setAvailable] = useState(availableLifepaths);

  const handle = useCallback((lifepath?: Lifepath) => {
    setDisabled(true);
    if (lifepath) addLifepath(lifepath);
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
            value={chosen ? available.indexOf(chosen).toString() : null}
            data={groupedLifepathData}
            onChange={v => { if (v) setChosen(available[Number(v)]); }}
            allowDeselect={false}
            disabled={disabled}
            searchable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 5, sm: 1, md: 1 }}>
          <Button variant="outline" size="md" onClick={() => { handle(chosen); }} fullWidth disabled={disabled}>Add Lifepath</Button>
        </Grid.Col>

        <Grid.Col span={{ base: 5, sm: 1, md: 1 }}>
          <Button variant="outline" size="md" onClick={() => { handle(); }} fullWidth disabled={disabled}>Remove Lifepath</Button>
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
