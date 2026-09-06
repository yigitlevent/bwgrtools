import { NavLink, Stack, Tooltip } from "@mantine/core";
import { Check, CircleCheck, X } from "lucide-react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { DrawerBox } from "../../Shared/DrawerBox";


export function RulesetSelector({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const { rulesets, checkRulesets, checkExactRulesets, toggleDataset } = useRulesetStore();

  return (
    <DrawerBox title="Datasets" expanded={expanded}>
      {rulesets.filter(ruleset => !ruleset.isExpansion && ruleset.id).map((ruleset, i) => {
        const rulesetId = ruleset.id;
        if (!rulesetId) return null;

        return (
          <Stack key={i} gap={0}>
            <NavLink
              onClick={() => { toggleDataset(rulesetId); }}
              leftSection={checkRulesets([rulesetId]) ? <Check size={18} color="var(--mantine-color-green-6)" /> : <X size={18} color="var(--mantine-color-red-6)" />}
              label={ruleset.name}
              rightSection={ruleset.isOfficial ? (
                <Tooltip label="Official"><CircleCheck size={16} /></Tooltip>
              ) : null}
            />

            {ruleset.expansionIds ? (
              <Stack gap={0} ml="lg">
                {ruleset.expansionIds.map((expansionId, ii) => {
                  const expansion = rulesets.find(v => v.id === expansionId);
                  const expansionId2 = expansion?.id;

                  return (
                    expansionId2 ? (
                      <NavLink
                        key={ii}
                        onClick={() => { toggleDataset(expansionId2); }}
                        disabled={!checkRulesets([rulesetId])}
                        leftSection={checkExactRulesets([rulesetId, expansionId2]) ? <Check size={18} color="var(--mantine-color-green-6)" /> : <X size={18} color="var(--mantine-color-red-6)" />}
                        label={expansion.name}
                        rightSection={ruleset.isOfficial ? (
                          <Tooltip label="Official"><CircleCheck size={16} /></Tooltip>
                        ) : null}
                      />
                    ) : null
                  );
                })}
              </Stack>
            ) : null}
          </Stack>
        );
      })}
    </DrawerBox>
  );
}
