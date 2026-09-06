import { ActionIcon, Checkbox, Grid, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


interface BlockTextProps {
  text: string;
  hasLeftPadding?: boolean;
}

export function BlockText({ text, hasLeftPadding }: BlockTextProps): React.JSX.Element {
  return (
    <Grid>
      <Text style={{ paddingLeft: hasLeftPadding ? "10px" : undefined, paddingTop: "3px" }}>{text}</Text>
    </Grid>
  );
}

interface BlockSkillPopoverProps {
  skill: [id: dat.SkillId, name: string | null];
  checkbox?: {
    checked: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    onClick?: () => void;
  };
  deleteCallback?: () => void;
}

export function BlockSkillPopover({ skill, checkbox, deleteCallback }: BlockSkillPopoverProps): React.JSX.Element {
  const { getSkill } = useRulesetStore();

  const rulesetSkill = getSkill(skill[0]);

  return (
    <Grid>
      {checkbox ? (
        <Checkbox
          checked={checkbox.checked}
          disabled={checkbox.disabled}
          onChange={e => { checkbox.onChange?.(e, e.currentTarget.checked); }}
          onClick={checkbox.onClick}
          style={{ margin: "0 0 4px 0", padding: 0 }}
        />
      ) : null}

      <Text style={{ cursor: "pointer", display: "inline-block", margin: "6px 0 0 8px" }}>
        <PopoverLink data={rulesetSkill} />
      </Text>

      {deleteCallback ? (
        <ActionIcon variant="subtle" onClick={deleteCallback} style={{ padding: 0, margin: "0 0 2px 6px" }}>
          <Trash2 size={18} />
        </ActionIcon>
      ) : null}
    </Grid>
  );
}

interface BlockTraitPopoverProps {
  trait: [id: dat.TraitId, name: string | null];
  checkbox?: {
    checked: boolean;
    disabled?: boolean;
    onClick?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  };
  deleteCallback?: () => void;
}

export function BlockTraitPopover({ trait, checkbox, deleteCallback }: BlockTraitPopoverProps): React.JSX.Element {
  const { getTrait } = useRulesetStore();

  const rulesetTrait = getTrait(trait[0]);

  return (
    <Grid>
      {checkbox ? (
        <Checkbox
          checked={checkbox.checked}
          disabled={checkbox.disabled}
          onChange={e => { checkbox.onClick?.(e, e.currentTarget.checked); }}
          style={{ margin: "0 0 4px 0", padding: 0 }}
        />
      ) : null}

      <Text style={{ cursor: "pointer", display: "inline-block", margin: "6px 0 0 8px" }}>
        <PopoverLink data={rulesetTrait} />
      </Text>

      {deleteCallback ? (
        <ActionIcon variant="subtle" onClick={deleteCallback} style={{ padding: 0, margin: "0 0 2px 6px" }}>
          <Trash2 size={18} />
        </ActionIcon>
      ) : null}
    </Grid>
  );
}
