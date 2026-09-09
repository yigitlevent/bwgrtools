import { ActionIcon, Alert, Button, Grid, Menu, Modal, Stack, Tooltip } from "@mantine/core";
import { Check, ChevronRight, CircleCheck, Database, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { HasCharacterBurnerProgress, ResetCharacterBurnerCompletely } from "../../../hooks/featureStores/CharacterBurnerStores/characterBurnerFullReset";
import { useDrawerStore } from "../../../hooks/useDrawerStore";


function TogglePendingRuleset(pending: dat.RulesetId[], rulesets: Ruleset[], ruleset: dat.RulesetId): dat.RulesetId[] {
  if (rulesets.find(v => v.id === ruleset)?.isExpansion !== true) return [ruleset];
  if (pending.includes(ruleset) && pending.length > 1) return pending.filter(v => v !== ruleset);
  return [...pending, ruleset];
}

export function RulesetSelector({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const { rulesets, chosenRulesets, applyChosenRulesets } = useRulesetStore();
  const { toggleDrawer } = useDrawerStore();

  const [pending, setPending] = useState(chosenRulesets);
  const [confirmingApply, setConfirmingApply] = useState(false);

  useEffect(() => {
    if (expanded) setPending(chosenRulesets);
  }, [expanded, chosenRulesets]);

  const isPendingChecked = (id: dat.RulesetId): boolean => pending.includes(id);
  const isPendingExactChecked = (ids: dat.RulesetId[]): boolean => ids.every(id => pending.includes(id));

  const hasChanges = pending.length !== chosenRulesets.length || !pending.every(id => chosenRulesets.includes(id));

  const cancel = (): void => {
    if (confirmingApply) return;
    setPending(chosenRulesets);
    toggleDrawer();
  };

  const reset = (): void => {
    const defaultRuleset = rulesets.find(v => v.isExpansion !== true && v.id !== null)?.id;
    setPending(defaultRuleset !== undefined && defaultRuleset !== null ? [defaultRuleset] : []);
  };

  const commitApply = (): void => {
    applyChosenRulesets(pending);
    ResetCharacterBurnerCompletely();
    setConfirmingApply(false);
    toggleDrawer();
  };

  const apply = (): void => {
    if (!hasChanges) return;
    if (HasCharacterBurnerProgress()) setConfirmingApply(true);
    else commitApply();
  };

  return (
    <Menu opened={expanded} onClose={cancel} closeOnItemClick={false} position="bottom-end" withArrow>
      <Menu.Target>
        <Tooltip color="gray" label="Datasets">
          <ActionIcon size="lg" mt={16} p={4} variant="light" onClick={() => { toggleDrawer("Datasets"); }} aria-label="Datasets">
            <Database />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        {rulesets.filter(ruleset => ruleset.isExpansion !== true && ruleset.id !== null).map((ruleset, i) => {
          const rulesetId = ruleset.id;
          if (rulesetId === null) return null;

          const rulesetLeftSection = isPendingChecked(rulesetId) ? <Check size={18} color="var(--mantine-color-green-6)" /> : <X size={18} color="var(--mantine-color-red-6)" />;
          const rulesetRightSection = ruleset.isOfficial === true ? (
            <Tooltip color="gray" label="Official"><CircleCheck size={16} /></Tooltip>
          ) : null;

          if (ruleset.expansionIds === undefined) {
            return (
              <Menu.Item
                key={i}
                leftSection={rulesetLeftSection}
                rightSection={rulesetRightSection}
                onClick={() => { setPending(p => TogglePendingRuleset(p, rulesets, rulesetId)); }}
              >
                {ruleset.name}
              </Menu.Item>
            );
          }

          return (
            <Menu.Sub key={i} position="left-start">
              <Menu.Sub.Target>
                <Menu.Sub.Item
                  leftSection={rulesetLeftSection}
                  rightSection={(
                    <Fragment>
                      {rulesetRightSection}
                      <ChevronRight size={14} />
                    </Fragment>
                  )}
                  onClick={() => { setPending(p => TogglePendingRuleset(p, rulesets, rulesetId)); }}
                >
                  {ruleset.name}
                </Menu.Sub.Item>
              </Menu.Sub.Target>

              <Menu.Sub.Dropdown>
                {ruleset.expansionIds.map((expansionId, ii) => {
                  const expansion = rulesets.find(v => v.id === expansionId);
                  const expansionId2 = expansion?.id;

                  return (
                    expansion !== undefined && expansionId2 !== undefined && expansionId2 !== null ? (
                      <Menu.Item
                        key={ii}
                        disabled={!isPendingChecked(rulesetId)}
                        leftSection={isPendingExactChecked([rulesetId, expansionId2]) ? <Check size={18} color="var(--mantine-color-green-6)" /> : <X size={18} color="var(--mantine-color-red-6)" />}
                        rightSection={ruleset.isOfficial === true ? (
                          <Tooltip color="gray" label="Official"><CircleCheck size={16} /></Tooltip>
                        ) : null}
                        onClick={() => { setPending(p => TogglePendingRuleset(p, rulesets, expansionId2)); }}
                      >
                        {expansion.name}
                      </Menu.Item>
                    ) : null
                  );
                })}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
          );
        })}

        <Menu.Divider />

        <Grid columns={3} gap="xs" px="sm">
          <Grid.Col span={1}>
            <Button variant="light" size="compact-sm" onClick={reset} fullWidth>Reset</Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button variant="light" size="compact-sm" onClick={cancel} fullWidth>Cancel</Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button variant="light" size="compact-sm" onClick={apply} disabled={!hasChanges} fullWidth>Apply</Button>
          </Grid.Col>
        </Grid>
      </Menu.Dropdown>

      <Modal opened={confirmingApply} onClose={() => { setConfirmingApply(false); }} size="500px">
        <Stack gap="md">
          <Alert color="yellow">
            Changing datasets resets the entire Character Burner - name, concept, stock, lifepaths, stats, skills, traits, resources, beliefs, and instincts. This cannot be undone.
          </Alert>

          <Grid columns={2} gap="xs">
            <Grid.Col span={1}>
              <Button variant="outline" size="sm" onClick={() => { setConfirmingApply(false); }} fullWidth>Cancel</Button>
            </Grid.Col>

            <Grid.Col span={1}>
              <Button size="sm" onClick={commitApply} fullWidth>Apply Anyway</Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Modal>
    </Menu>
  );
}
