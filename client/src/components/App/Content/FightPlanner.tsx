import { ActionIcon, Button, Card, Divider, Grid, Paper, Select, Title } from "@mantine/core";
import { Eye } from "lucide-react";
import { Fragment, useMemo } from "react";

import { FightPlannerActionDetails } from "./FightPlanner/FightActionDetails";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useFightPlannerStore } from "../../../hooks/featureStores/useFightPlannerStore";


export function FightPlanner(): React.JSX.Element {
  const { fightActions } = useRulesetStore();

  const { actions, selectedAction, addAction, changeSelectedAction, toggleActionVisibility } = useFightPlannerStore();

  const groupedActionData = useMemo(() => {
    const sorted = [...fightActions].sort((a, b) => {
      const groupComparison = a.group[1].localeCompare(b.group[1]);
      return groupComparison !== 0 ? groupComparison : (a.name ?? "").localeCompare(b.name ?? "");
    });
    const groups = new Map<string, string[]>();
    sorted.forEach(v => {
      const groupName = v.group[1];
      const items = groups.get(groupName) ?? [];
      items.push(v.name ?? "");
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [fightActions]);

  return (
    <Fragment>
      <Title order={3}>Fight Planner</Title>

      <Grid justify="space-evenly" columns={3} style={{ maxWidth: "100%", padding: "16px 0" }}>
        {actions.map((action, volleyIndex) => (
          <Grid.Col key={volleyIndex} span={{ base: 3, md: 1 }} style={{ minWidth: "30%" }}>
            <Card style={{ padding: "10px" }}>
              <Title order={5}>{`Volley ${String(volleyIndex + 1)}`}</Title>
              <Divider my="8px" />

              {action.map((action, actionIndex) => (
                <Paper key={`${volleyIndex.toString()}-${actionIndex.toString()}`} withBorder style={{ padding: "8px", marginBottom: "8px" }}>
                  {action.visible
                    ? <FightPlannerActionDetails action={action} volleyIndex={volleyIndex} actionIndex={actionIndex} />
                    : (
                      <ActionIcon variant="subtle" style={{ width: "100%", height: "auto", padding: "16px" }} onClick={() => { toggleActionVisibility(volleyIndex, actionIndex); }}>
                        <Eye size={100} />
                      </ActionIcon>
                    )}
                </Paper>
              ))}

              <Select
                value={selectedAction[volleyIndex]}
                data={groupedActionData}
                onChange={v => { if (v !== null) changeSelectedAction(v, volleyIndex); }}
                allowDeselect={false}
                searchable
              />

              <Button
                size="md"
                mt={16}
                mb={8}
                variant="light"
                fullWidth
                onClick={() => { addAction(fightActions, volleyIndex, selectedAction[volleyIndex]); }}
              >
                Add Action
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Fragment>
  );
}
