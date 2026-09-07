import { ActionIcon, Checkbox, Grid, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


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
  return (
    <Grid>
      {checkbox ? (
        <Checkbox
          checked={checkbox.checked}
          disabled={checkbox.disabled}
          onChange={checkbox.onToggle}
          style={{ margin: "4px 0", padding: 0 }}
        />
      ) : null}

      <Text component="div" style={{ display: "inline-block" }}>
        <PopoverLink data={data} />
      </Text>

      {deleteCallback ? (
        <ActionIcon variant="subtle" onClick={deleteCallback} style={{ padding: 0, margin: "0 0 2px 6px" }}>
          <Trash2 size={18} />
        </ActionIcon>
      ) : null}
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
