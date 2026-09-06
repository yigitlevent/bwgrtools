// These functions are direct conversions of https://github.com/telnoratti/burningwheel-tools

function Explode(sixes: number, minSuccessNumber: number, minExplodeNumber = 6): number {
  if (sixes === 0) return 0;
  const rolls: number[] = Array.from(Array(sixes).keys()).map(() => Math.floor(Math.random() * 6) + 1);
  const exploders: number = rolls.filter(roll => roll >= minExplodeNumber).length;
  const successes: number = rolls.filter(roll => roll >= minSuccessNumber).length;
  return successes + Explode(exploders, minExplodeNumber, minSuccessNumber);
}

export function CalculateDiceProbability(poolSize: number, openEnded: boolean, shade: Shade, iterations = 100000): number[] {
  const rolls: number[][] = Array(iterations).fill(0).map(() => Array(poolSize).fill(0).map(() => Math.floor(Math.random() * 6) + 1));

  let success = 4;
  switch (shade) {
    case "B":
      success = 4;
      break;
    case "G":
      success = 3;
      break;
    case "W":
      success = 2;
      break;
  }

  let successes: number[] = rolls.map(roll => roll.filter(r => r >= success).length);

  if (openEnded) {
    const sixes: number[] = rolls.map(roll => roll.filter(r => r >= 6).length);
    const additionalSuccesses: number[] = sixes.map(six => Explode(six, success));
    successes = successes.map((success, index) => success + additionalSuccesses[index]);
  }

  const freqCount = Array(Math.max(...successes) + 1).fill(0) as number[];
  successes.forEach(success => freqCount[success]++);

  const result =
    freqCount
      .reverse()
      .map((_, index, arr) =>
        arr
          .slice(0, index + 1)
          .reduce((a, b) => a + b))
      .reverse()
      .map(freq => freq / freqCount.reduce((a, b) => a + b))
      .filter((_, index) => index > 0);

  return result;
}
