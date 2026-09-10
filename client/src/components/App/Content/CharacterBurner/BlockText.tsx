import { ActionIcon, Button, Checkbox, Grid, Group, Popover, Stack, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../../Shared/PopoverLink";


interface BlockAbilityCheckbox {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

interface BlockAbilityPopoverProps {
  data: Skill | Trait;
  checkbox?: BlockAbilityCheckbox;
  deleteCallback?: () => void;
}

function BlockAbilityPopover({ data, checkbox, deleteCallback }: BlockAbilityPopoverProps): React.JSX.Element {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Grid>
      {checkbox !== undefined
        ? (
          <Checkbox
            checked={checkbox.checked}
            disabled={checkbox.disabled}
            onChange={checkbox.onToggle}
            style={{ margin: "4px 0", padding: 0 }}
          />
        )
        : null}

      <Text component="div" style={{ display: "inline-block" }}>
        <PopoverLink data={data} />
      </Text>

      {deleteCallback !== undefined
        ? (
          <Popover opened={confirmingDelete} onChange={setConfirmingDelete} withArrow position="bottom" width={260}>
            <Popover.Target>
              <ActionIcon
                variant="subtle"
                onClick={() => { setConfirmingDelete(true); }}
                style={{ padding: 0, margin: "0 0 2px 6px" }}
              >
                <Trash2 size={18} />
              </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown>
              <Stack gap="xs">
                <Text size="sm">
                  Remove
                  {" "}
                  <Text span fw={700}>{data.name}</Text>
                  ? This cannot be undone.
                </Text>

                <Group justify="flex-end" gap="xs">
                  <Button variant="subtle" size="xs" onClick={() => { setConfirmingDelete(false); }}>Cancel</Button>

                  <Button
                    color="red"
                    size="xs"
                    onClick={() => {
                      deleteCallback();
                      setConfirmingDelete(false);
                    }}
                  >
                    Remove
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )
        : null}
    </Grid>
  );
}

export function BlockSkillPopover({ skill, checkbox, deleteCallback }: { skill: [id: dat.SkillId, name: string | null]; checkbox?: BlockAbilityCheckbox; deleteCallback?: () => void; }): React.JSX.Element {
  const { getSkill } = useRulesetStore();
  return <BlockAbilityPopover data={getSkill(skill[0])} checkbox={checkbox} deleteCallback={deleteCallback} />;
}

export function BlockTraitPopover({ trait, checkbox, deleteCallback }: { trait: [id: dat.TraitId, name: string | null]; checkbox?: BlockAbilityCheckbox; deleteCallback?: () => void; }): React.JSX.Element {
  const { getTrait } = useRulesetStore();
  return <BlockAbilityPopover data={getTrait(trait[0])} checkbox={checkbox} deleteCallback={deleteCallback} />;
}
