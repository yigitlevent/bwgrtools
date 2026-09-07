import { Divider, Grid, Paper, Text, Title } from "@mantine/core";
import { Fragment, memo } from "react";

import { GetObstacleString } from "../../../utils/GetMagicalObstacleString";


export const ResourceItem = memo(({ resource }: { resource: Resource; }): React.JSX.Element => {
  const getAreaOfEffectDetails = (aoeDetails: { unit?: [id: dat.DistanceUnitId | null, name: string | null]; modifier?: [id: dat.UnitModifierId | null, name: string | null]; }): string => {
    const texts = [];
    if (aoeDetails.unit) { texts.push(aoeDetails.unit[1]); }
    if (aoeDetails.modifier) { texts.push(aoeDetails.modifier[1]); }
    return ` (${texts.join(", ")})`;
  };

  const getText = (res: [cost: number | null, description: string | null] | [cost: number, isPer: boolean, description: string]): string => {
    if (res.length === 2) {
      const cost = res[0] ?? 0;
      if (res[1]) return `${res[1]}: ${cost.toString()}${cost > 1 ? "rps" : "rp"}`;
      else return `${cost.toString()}${cost > 1 ? "rps" : "rp"}`;
    }
    else {
      if (res[2]) return `${res[2]}: ${res[0].toString()}${res[0] > 1 ? "rps" : "rp"} ${res[1] ? "per" : ""}`;
      else return `${res[0].toString()}${res[0] > 1 ? "rps" : "rp"} ${res[1] ? "per" : ""}`;
    }
  };

  return (
    <Paper withBorder px={12} pt={8} pb={12} mr={8} radius={0}>
      <Grid columns={3}>
        <Grid.Col span={2}>
          <Title order={4}>{resource.name}</Title>
        </Grid.Col>

        <Grid.Col span={1}>
          <Text style={{ float: "right" }}>{resource.type[1]}</Text>
        </Grid.Col>

        <Grid.Col span={resource.magical ? 1 : 3}>
          {resource.variableCost ? <Text size="sm">variable</Text> : resource.costs.every(v => v[1]) ? resource.costs.map((res, i) => (
            <Text size="sm" key={i}>
              Resources:
              {res[0]}
              {res[0] > 1 ? "rps" : "rp"}
            </Text>
          )
          ) : resource.costs.map((res, i) =>
            <Text size="sm" key={i}>{getText(res)}</Text>
          )}
        </Grid.Col>

        <Grid.Col span={resource.magical ? 1 : 3}>
          {resource.modifiers.map((res, i) =>
            <Text size="sm" key={i}>{getText(res)}</Text>
          )}
        </Grid.Col>

        {resource.magical ? (
          <Fragment>
            <Grid.Col span={1}>
              <Text size="sm">
                Actions:
                {resource.magical.doActionsMultiply ? "x" : ""}
                {resource.magical.actions}
              </Text>
            </Grid.Col>
          </Fragment>
        ) : null}

        {resource.magical?.obstacleDetails ? (
          <Grid.Col span={3}>
            <Text size="sm">
              Obstacles:
              {GetObstacleString(resource, resource.magical.obstacleDetails)}
            </Text>
          </Grid.Col>
        ) : null}

        {resource.magical ? (
          <Fragment>
            <Grid.Col span={3}><Divider /></Grid.Col>

            <Grid.Col span={1}>
              <Text size="sm">
                Origin:
                {resource.magical.origin[1]}
              </Text>
            </Grid.Col>

            <Grid.Col span={1}>
              <Text size="sm">
                Element:
                {resource.magical.elements.map(x => x[1]).join("/")}
              </Text>
            </Grid.Col>

            <Grid.Col span={1}>
              <Text size="sm">
                Duration:
                {resource.magical.duration[1]}
              </Text>
            </Grid.Col>

            <Grid.Col span={1}>
              <Text size="sm">
                Area of Effect:
                {resource.magical.areaOfEffect[1]}
                {resource.magical.areaOfEffectDetails?.unit || resource.magical.areaOfEffectDetails?.modifier ? getAreaOfEffectDetails(resource.magical.areaOfEffectDetails) : ""}
              </Text>
            </Grid.Col>

            <Grid.Col span={1}>
              <Text size="sm">
                Impetus:
                {resource.magical.impetus.map(x => x[1]).join("/")}
              </Text>
            </Grid.Col>
          </Fragment>
        ) : null}

        {resource.description ? (
          <Fragment>
            <Grid.Col span={3}><Divider /></Grid.Col>

            <Grid.Col span={3}>
              {resource.description.split("<br>").map((v, i) => {
                if (resource.magical && i === 0) return <Text key={i} size="sm" fw={600}>{v}</Text>;
                return <Text key={i} size="sm">{v}</Text>;
              })}
            </Grid.Col>
          </Fragment>
        ) : null}
      </Grid>
    </Paper>
  );
});
