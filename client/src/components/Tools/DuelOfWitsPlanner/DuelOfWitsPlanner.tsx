import { ActionIcon, Button, Card, Divider, Grid, Paper, Select, Title } from "@mantine/core";
import { Eye } from "lucide-react";
import { Fragment, useMemo } from "react";

import { DuelOfWitsActionDetails } from "./DuelOfWitsActionDetails";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useDuelOfWitsPlannerStore } from "../../../hooks/featureStores/useDuelOfWitsPlannerStore";


export function DuelOfWitsPlanner(): React.JSX.Element {
  const { dowActions } = useRulesetStore();

  const { actions, selectedAction, addAction, changeSelectedAction, toggleActionVisibility } = useDuelOfWitsPlannerStore();

  const sortedActionNames = useMemo(() => {
    return [...dowActions].map(v => v.name).sort((a, b) => a.localeCompare(b));
  }, [dowActions]);

  return (
    <Fragment>
      <Title order={3}>Duel of Wits Planner</Title>

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
                {action !== undefined ? action.visible ? <DuelOfWitsActionDetails action={action} volleyIndex={volleyIndex} /> : (
                  <ActionIcon variant="subtle" style={{ width: "100%", height: "auto", padding: "16px" }} onClick={() => { toggleActionVisibility(volleyIndex); }}>
                    <Eye size={100} />
                  </ActionIcon>
                ) : (
                  <Fragment>
                    <Select
                      value={selectedAction[volleyIndex]}
                      onChange={v => { if (v !== null) changeSelectedAction(v, volleyIndex); }}
                      data={sortedActionNames}
                      allowDeselect={false}
                      searchable
                    />

                    <Button size="lg" fullWidth style={{ padding: "16px", margin: "16px 0 8px" }} onClick={() => { addAction(dowActions, volleyIndex, selectedAction[volleyIndex]); }}>Add Action</Button>
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
