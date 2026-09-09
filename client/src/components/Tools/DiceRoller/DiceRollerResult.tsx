import { Button, Divider, Grid, Text, Title, Tooltip } from "@mantine/core";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { Fragment } from "react";

import type { TestResult } from "./DiceRoller";


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
      {result !== undefined ? (
        <Fragment>
          <Divider label="Result" mt="10px" />

          <Grid columns={3}>
            <Grid.Col span={{ base: 3, sm: 1 }}>
              <Title order={6}>Result</Title>
              <Text>{getResultText(result)}</Text>
            </Grid.Col>

            <Grid.Col span={{ base: 3, sm: 1 }}>
              <Fragment>
                <Title order={6}>Dice</Title>

                <Text>
                  {result.dice.map((v, i) => {
                    if (v === 1) return <Dice1 key={i} color="var(--mantine-color-red-6)" style={{ marginBottom: -6 }} />;
                    else if (v === 2) return <Dice2 key={i} color={(shade === "White") ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"} style={{ marginBottom: -6 }} />;
                    else if (v === 3) return <Dice3 key={i} color={(shade === "Gray") ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"} style={{ marginBottom: -6 }} />;
                    else if (v === 4) return <Dice4 key={i} color="var(--mantine-color-green-6)" style={{ marginBottom: -6 }} />;
                    else if (v === 5) return <Dice5 key={i} color="var(--mantine-color-green-6)" style={{ marginBottom: -6 }} />;
                    else return <Dice6 key={i} color="var(--mantine-color-green-6)" style={{ marginBottom: -6 }} />;
                  })}
                </Text>
              </Fragment>

              {!isOpenEnded && result.dice.includes(6) && !result.usedFate ? (
                <Tooltip multiline w={320} color="gray" label="Spend a Fate point to reroll all 6s in this pool, even though Open Ended is off.">
                  <Button variant="outline" size="md" onClick={() => { rerollSixes(result.dice, true); }} mt="24px">Reroll sixes using Fate</Button>
                </Tooltip>
              ) : null}

              {isOpenEnded && result.failures > 0 && !result.usedFate ? (
                <Tooltip multiline w={320} color="gray" label="Spend a Fate point to reroll one failed die from this pool.">
                  <Button variant="outline" size="md" onClick={() => { rerollFailure(result.dice); }} mt="6px">Reroll a single failure using Fate</Button>
                </Tooltip>
              ) : null}
            </Grid.Col>

            <Grid.Col span={{ base: 3, sm: 1 }}>
              <Title order={6}>Test</Title>
              <Text>{result.test}</Text>
            </Grid.Col>
          </Grid>
        </Fragment>
      ) : null}
    </Fragment>
  );
}
