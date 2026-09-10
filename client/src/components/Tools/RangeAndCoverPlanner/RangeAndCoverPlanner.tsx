import { ActionIcon, Button, Card, Divider, Grid, Paper, Select, Title } from "@mantine/core";
import { Eye } from "lucide-react";
import { Fragment, useMemo } from "react";

import { RangeAndCoverActionDetails } from "./RangeAndCoverActionDetails";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useRangeAndCoverPlannerStore } from "../../../hooks/featureStores/useRangeAndCoverPlannerStore";


export function RangeAndCoverPlanner(): React.JSX.Element {
  const { racActions } = useRulesetStore();

  const { actions, selectedAction, addAction, changeSelectedAction, toggleActionVisibility } = useRangeAndCoverPlannerStore();

  const groupedActionData = useMemo(() => {
    const sorted = [...racActions].sort((a, b) => {
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
  }, [racActions]);

  return (
    <Fragment>
      <Title order={3}>Range and Cover Planner</Title>

      <Grid justify="space-evenly" columns={3} style={{ maxWidth: "100%", padding: "16px 0" }}>
        {actions.map((action, volleyIndex) => (
          <Grid.Col key={volleyIndex} span={{ base: 3, md: 1 }} style={{ minWidth: "30%" }}>
            <Card style={{ padding: "10px" }}>
              <Title order={5}>
                Volley
                {volleyIndex + 1}
              </Title>

              <Divider my="8px" />

              <Paper key={volleyIndex} shadow="sm" style={{ padding: "8px", marginBottom: "8px" }}>
                {action !== undefined
                  ? action.visible
                    ? <RangeAndCoverActionDetails action={action} volleyIndex={volleyIndex} />
                    : (
                      <ActionIcon variant="subtle" style={{ width: "100%", height: "auto", padding: "16px" }} onClick={() => { toggleActionVisibility(volleyIndex); }}>
                        <Eye size={100} />
                      </ActionIcon>
                    )
                  : (
                    <Fragment>
                      <Select
                        value={selectedAction[volleyIndex]}
                        data={groupedActionData}
                        onChange={v => { if (v !== null) changeSelectedAction(v, volleyIndex); }}
                        allowDeselect={false}
                        searchable
                      />

                      <Button size="lg" fullWidth style={{ padding: "16px", margin: "16px 0 8px" }} onClick={() => { addAction(racActions, volleyIndex, selectedAction[volleyIndex]); }}>Add Action</Button>
                    </Fragment>
                  )}
              </Paper>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Fragment>
  );
}
