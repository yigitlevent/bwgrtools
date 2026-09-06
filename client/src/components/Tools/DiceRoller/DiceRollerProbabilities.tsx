import { Card, Divider, Grid, Text } from "@mantine/core";
import { Fragment } from "react";


export function DiceRollerProbabilities({ probabilities, isDoubleObstacle, obstacle }: { probabilities: number[]; isDoubleObstacle: boolean; obstacle: number; }): React.JSX.Element {
  return (
    <Fragment>
      <Divider label="Probabilities" mt="10px" />

      <Grid columns={20} gap={0} style={{ padding: 0 }}>
        {Array.from(Array(20)).map((_, obIndex) => {
          const probability = probabilities.at(obIndex);

          return (
            <Grid.Col
              key={obIndex}
              span={{ base: 5, sm: 4, md: 2, lg: 1 }}
              style={{ padding: "4px", margin: "8px 0" }}
            >
              <Card
                style={{
                  width: "100%",
                  padding: "4px",
                  background: `hsl(0, 0%, ${(probability === undefined ? 0 : probability * 50).toString()}%)`,
                  textAlign: "center",
                  border: (obIndex + 1) === (isDoubleObstacle ? obstacle * 2 : obstacle) ? "1px solid white" : "1px solid transparent"
                }}
              >
                <Text style={{ borderBottom: "1px solid white" }}>
                  {obIndex + 1}
                  ob
                </Text>

                {probability === undefined ? <Text>0%</Text> : (
                  <Text>
                    {Math.round(probability * 100)}
                    %
                  </Text>
                )}
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Fragment>
  );
}
