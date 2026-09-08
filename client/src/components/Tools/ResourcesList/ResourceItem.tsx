import { Divider, Grid, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Fragment, memo } from "react";

import { GetObstacleString } from "../../../utils/GetMagicalObstacleString";


export const ResourceItem = memo(({ resource }: { resource: Resource; }): React.JSX.Element => {
  const getAreaOfEffectDetails = (aoeDetails: { unit?: [id: dat.DistanceUnitId | null, name: string | null]; modifier?: [id: dat.UnitModifierId | null, name: string | null]; }): string => {
    const texts = [];
    if (aoeDetails.unit) { texts.push(aoeDetails.unit[1]); }
    if (aoeDetails.modifier) { texts.push(aoeDetails.modifier[1]); }
    return ` (${texts.join(", ")})`;
  };

  const getModifier = (res: [cost: number | null, description: string | null] | [cost: number, isPer: boolean, description: string]): React.JSX.Element => {
    if (res.length === 2) {
      const cost = res[0] ?? 0;

      return (
        <Fragment>
          <Text>{`${String(cost)}${cost > 1 ? "rps" : "rp"}`}</Text>
          {res[1] && <Text>{`— ${res[1]}`}</Text>}
        </Fragment>
      );
    }
    else {
      return (
        <Fragment>
          <Text>{`${String(res[0])}${res[0] > 1 ? "rps" : "rp"}`}</Text>
          {res[2] && <Text>{`— ${res[2]}`}</Text>}
          <Text>{res[1] ? "(per)" : ""}</Text>
        </Fragment>
      );
    }
  };

  return (
    <Paper withBorder px={12} pt={8} pb={12} mr={8} radius={0}>
      <Grid columns={3} gap={8}>
        <Grid.Col span={2}>
          <Title order={4}>{resource.name}</Title>
        </Grid.Col>

        <Grid.Col span={1}>
          <Text style={{ float: "right" }}>{resource.type[1]}</Text>
        </Grid.Col>

        <Grid.Col span={resource.magical ? 1 : 3}>
          {resource.variableCost ? (
            <Group gap={4} justify="start">
              <Text fw={700}>Resources:</Text>
              <Text>variable</Text>
            </Group>
          ) : null}

          {resource.costs.length === 1 ? (
            <Group gap={4} justify="start">
              <Text fw={700}>Resources:</Text>
              <Text>{`${String(resource.costs[0][0])}${resource.costs[0][0] > 1 ? "rps" : "rp"}`}</Text>
              {resource.costs[0][1] && <Text>{`— ${resource.costs[0][1]}`}</Text>}
            </Group>
          ) : null}

          {resource.costs.length > 1 ? (
            <Stack gap={4} justify="start">
              <Text fw={700}>Resources:</Text>

              {resource.costs.map((res, i) => (
                <Group key={i} gap={4} justify="start">
                  <Text>{`${String(res[0])}${res[0] > 1 ? "rps" : "rp"}`}</Text>
                  {res[1] && <Text>{`— ${res[1]}`}</Text>}
                </Group>
              ))}
            </Stack>
          ) : null}
        </Grid.Col>

        {resource.modifiers.length > 0 ? (
          <Grid.Col span={resource.magical ? 1 : 3}>
            <Text fw={700}>Resource Modifiers:</Text>

            {resource.modifiers.map((res, i) => (
              <Group key={i} gap={4} justify="start">
                {getModifier(res)}
              </Group>
            ))}
          </Grid.Col>
        ) : null}

        {resource.magical ? (
          <Grid.Col span={1}>
            <Group gap={4} justify="start">
              <Text fw={700}>Actions:</Text>

              <Text>
                {resource.magical.doActionsMultiply ? "x" : ""}
                {resource.magical.actions}
              </Text>
            </Group>
          </Grid.Col>
        ) : null}

        {resource.magical?.obstacleDetails ? (
          <Grid.Col span={3}>
            <Group gap={4} justify="start">
              <Text fw={700}>Obstacles:</Text>
              <Text>{GetObstacleString(resource, resource.magical.obstacleDetails)}</Text>
            </Group>
          </Grid.Col>
        ) : null}

        {resource.magical ? (
          <Fragment>
            <Grid.Col span={3}><Divider /></Grid.Col>

            <Grid.Col span={1}>
              <Group gap={4} justify="start">
                <Text fw={700}>Origin:</Text>
                <Text>{resource.magical.origin[1]}</Text>
              </Group>
            </Grid.Col>

            <Grid.Col span={1}>
              <Group gap={4} justify="start">
                <Text fw={700}>Element:</Text>
                <Text>{resource.magical.elements.map(x => x[1]).join("/")}</Text>
              </Group>
            </Grid.Col>

            <Grid.Col span={1}>
              <Group gap={4} justify="start">
                <Text fw={700}>Duration:</Text>
                <Text>{resource.magical.duration[1]}</Text>
              </Group>
            </Grid.Col>

            <Grid.Col span={1}>
              <Group gap={4} justify="start">
                <Text fw={700}>Area of Effect:</Text>

                <Text>
                  {resource.magical.areaOfEffect[1]}
                  {resource.magical.areaOfEffectDetails?.unit || resource.magical.areaOfEffectDetails?.modifier ? getAreaOfEffectDetails(resource.magical.areaOfEffectDetails) : ""}
                </Text>
              </Group>
            </Grid.Col>

            <Grid.Col span={1}>
              <Group gap={4} justify="start">
                <Text fw={700}>Impetus:</Text>
                <Text>{resource.magical.impetus.map(x => x[1]).join("/")}</Text>
              </Group>
            </Grid.Col>
          </Fragment>
        ) : null}

        {resource.description ? (
          <Fragment>
            <Grid.Col span={3}><Divider /></Grid.Col>

            <Grid.Col span={3}>
              {resource.description.split("<br>").map((v, i) => {
                if (resource.magical && i === 0) return <Text key={i} fw={600}>{v}</Text>;
                return <Text key={i}>{v}</Text>;
              })}
            </Grid.Col>
          </Fragment>
        ) : null}
      </Grid>
    </Paper>
  );
});
