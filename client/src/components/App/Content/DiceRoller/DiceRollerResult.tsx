import { ActionIcon, Divider, Grid, Text, Title, Tooltip, Group } from "@mantine/core";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices } from "lucide-react";
import { Fragment } from "react";

import type { TestResult } from "../DiceRoller";


interface DiceRollerResultProps {
  result: TestResult | undefined;
  shade: string;
  isDoubleObstacle: boolean;
  isOpenEnded: boolean;
  obstacle: number;
  rerollFailure: (dice: number[]) => void;
  rerollSixes: (dice: number[], spendingFate: boolean) => void;
}

export function DiceRollerResult({ result, shade, isDoubleObstacle, isOpenEnded, obstacle, rerollFailure, rerollSixes }: DiceRollerResultProps): React.JSX.Element {
  const getResultText = (testResult: TestResult): string => {
    const actualObstacle = (isDoubleObstacle) ? obstacle * 2 : obstacle;
    return (testResult.successes > actualObstacle) ? `Success with a margin of ${(testResult.successes - actualObstacle).toString()}.` : (testResult.successes < actualObstacle) ? `Failure with a margin of ${(actualObstacle - testResult.successes).toString()}.` : "Tie.";
  };

  return (
    <Fragment>
      {result !== undefined
        ? (
          <Fragment>
            <Divider label="Result" mt="10px" />

            <Grid columns={3}>
              <Grid.Col span={{ base: 2, sm: 1 }}>
                <Title order={5}>Result</Title>
                <Text>{getResultText(result)}</Text>
              </Grid.Col>

              <Grid.Col span={{ base: 1, sm: 1 }}>
                <Title order={5}>Test</Title>
                <Text>{result.test}</Text>
              </Grid.Col>

              <Grid.Col span={{ base: 3, sm: 1 }}>
                <Title order={5}>Dice</Title>

                <Group justify="start" align="center" gap={2}>
                  {result.dice.map((v, i) => {
                    if (v === 1) {
                      return (
                        <Dice1
                          key={i}
                          size="30px"
                          color="var(--mantine-color-red-6)"
                        />
                      );
                    }
                    else if (v === 2) {
                      return (
                        <Dice2
                          key={i}
                          size="30px"
                          color={(shade === "White") ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"}
                        />
                      );
                    }
                    else if (v === 3) {
                      return (
                        <Dice3
                          key={i}
                          size="30px"
                          color={(shade === "Gray") ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"}
                        />
                      );
                    }
                    else if (v === 4) {
                      return (
                        <Dice4
                          key={i}
                          size="30px"
                          color="var(--mantine-color-green-6)"
                        />
                      );
                    }
                    else if (v === 5) {
                      return (
                        <Dice5
                          key={i}
                          size="30px"
                          color="var(--mantine-color-green-6)"
                        />
                      );
                    }
                    else {
                      return (
                        <Dice6
                          key={i}
                          size="30px"
                          color="var(--mantine-color-green-6)"
                        />
                      );
                    }
                  })}

                  {result.dice.includes(6) && !result.usedFate
                    ? (
                      <Tooltip
                        multiline
                        w={320}
                        color="gray"
                        label={
                          isOpenEnded
                            ? "Spend a Fate point to reroll one failed die from this pool."
                            : "Spend a Fate point to reroll all 6s in this pool, even though Open Ended is off."
                        }
                      >
                        <ActionIcon size="30px" p={1} ml={8} variant="light">
                          <Dices
                            onClick={() => {
                              if (isOpenEnded) rerollFailure(result.dice);
                              else rerollSixes(result.dice, true);
                            }}
                          />
                        </ActionIcon>
                      </Tooltip>
                    )
                    : null}
                </Group>
              </Grid.Col>
            </Grid>
          </Fragment>
        )
        : null}
    </Fragment>
  );
}
