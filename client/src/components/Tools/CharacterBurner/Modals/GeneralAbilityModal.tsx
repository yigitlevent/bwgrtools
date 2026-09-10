import { Button, Grid, Modal, Select } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";


interface GeneralAbilityModalProps<T extends Skill | Trait> {
  isOpen: boolean;
  close: () => void;
  title: string;
  addButtonLabel: string;
  possibleAbilities: T[];
  renderDetails: (ability: T) => React.ReactNode;
  onAdd: (ability: T) => void;
}

export function GeneralAbilityModal<T extends Skill | Trait>({ isOpen, close, title, addButtonLabel, possibleAbilities, renderDetails, onAdd }: GeneralAbilityModalProps<T>): React.JSX.Element {
  const [chosenAbility, setChosenAbility] = useState<T>();

  const addNewAbility = (): void => {
    if (chosenAbility !== undefined) {
      onAdd(chosenAbility);
      close();
    }
  };

  useEffect(() => {
    if (possibleAbilities.length > 0) setChosenAbility(possibleAbilities[0]);
  }, [possibleAbilities]);

  const groupedAbilityData = useMemo(() => {
    const sorted = [...possibleAbilities].sort((a, b) => {
      const categoryComparison = a.category[1].localeCompare(b.category[1]);
      return categoryComparison !== 0 ? categoryComparison : (a.name ?? "").localeCompare(b.name ?? "");
    });
    const groups = new Map<string, { value: string; label: string; }[]>();
    sorted.forEach(v => {
      const groupName = v.category[1];
      const items = groups.get(groupName) ?? [];
      items.push({ value: v.id?.toString() ?? "", label: v.name ?? "" });
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [possibleAbilities]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={1} gap="md" align="center" justify="center">
        {chosenAbility !== undefined
          ? (
            <Grid.Col span={1}>
              <Select
                label={title}
                value={chosenAbility.id?.toString() ?? null}
                data={groupedAbilityData}
                onChange={v => {
                  const found = possibleAbilities.find(a => a.id?.toString() === v);
                  if (found !== undefined) setChosenAbility(found);
                }}
                allowDeselect={false}
                searchable
              />
            </Grid.Col>
          )
          : null}

        {chosenAbility !== undefined
          ? (
            <Grid.Col span={1}>
              {renderDetails(chosenAbility)}
            </Grid.Col>
          )
          : null}

        <Grid.Col span={1}>
          <Button variant="outline" size="md" onClick={addNewAbility} fullWidth>{addButtonLabel}</Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
