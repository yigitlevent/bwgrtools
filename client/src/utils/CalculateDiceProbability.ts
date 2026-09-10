// These functions are direct conversions of https://github.com/telnoratti/burningwheel-tools

function Explode(sixCount: number, minSuccessNumber: number, minExplodeNumber = 6): number {
  if (sixCount === 0) return 0;
  const rolls: number[] = Array.from(Array(sixCount).keys()).map(() => Math.floor(Math.random() * 6) + 1);
  const exploders: number = rolls.filter(roll => roll >= minExplodeNumber).length;
  const successes: number = rolls.filter(roll => roll >= minSuccessNumber).length;
  return successes + Explode(exploders, minSuccessNumber, minExplodeNumber);
}

export function CalculateDiceProbabilityMonteCarlo(poolSize: number, openEnded: boolean, shade: Shade, iterations = 100000): number[] {
  if (poolSize <= 0) throw new Error("CalculateDiceProbability: poolSize must be greater than 0");
  if (iterations <= 0) throw new Error("CalculateDiceProbability: iterations must be greater than 0");

  const rolls: number[][] =
    Array(iterations)
      .fill(0)
      .map(() =>
        Array(poolSize)
          .fill(0)
          .map(() => Math.floor(Math.random() * 6) + 1)
      );

  let successThreshold = 4;
  switch (shade) {
    case "B":
      successThreshold = 4;
      break;
    case "G":
      successThreshold = 3;
      break;
    case "W":
      successThreshold = 2;
      break;
  }

  let successes: number[] = rolls.map(roll => roll.filter(r => r >= successThreshold).length);

  if (openEnded) {
    const sixes: number[] = rolls.map(roll => roll.filter(r => r >= 6).length);
    const additionalSuccesses: number[] = sixes.map(six => Explode(six, successThreshold));
    successes = successes.map((success, index) => success + additionalSuccesses[index]);
  }

  const freqCount = Array(Math.max(...successes) + 1).fill(0) as number[];
  successes.forEach(success => freqCount[success]++);

  const totalCount = freqCount.reduce((a, b) => a + b);

  const result =
    freqCount
      .reverse()
      .map((_, index, arr) =>
        arr
          .slice(0, index + 1)
          .reduce((a, b) => a + b))
      .reverse()
      .map(freq => freq / totalCount)
      .filter((_, index) => index > 0);

  return result;
}

function GetSuccessThreshold(shade: Shade): number {
  switch (shade) {
    case "B": return 4;
    case "G": return 3;
    case "W": return 2;
  }
}

// Combinations (n choose k).
function Choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
  return result;
}

// Exact P(exactly k successes) for a closed-ended pool of n dice, each succeeding independently with
// probability p (binomial distribution).
function BinomialPmf(n: number, p: number): number[] {
  return Array.from({ length: n + 1 }, (_, k) => Choose(n, k) * p ** k * (1 - p) ** (n - k));
}

// Exact distribution of successes contributed by a single die's full explosion chain: a natural 6 is
// itself a success AND triggers a reroll of an extra die, which can itself explode again, and so on
// without limit. Modelled as a truncated recursive convolution -- the probability of a chain running
// past `maxDepth` explosions is (1/6)^maxDepth, negligible well before maxDepth = 40.
function ExplodingDieSuccessPmf(successThreshold: number, maxDepth = 40): number[] {
  const nonSixSuccessP = (6 - successThreshold) / 6;
  const failP = (successThreshold - 1) / 6;
  const explodeP = 1 / 6;

  // pmf[k] = probability this die's chain contributes exactly k successes, deepest chains first.
  let pmf = [1];
  for (let depth = 0; depth < maxDepth; depth++) {
    const next = Array(pmf.length + 2).fill(0) as number[];
    next[0] += failP;
    next[1] += nonSixSuccessP;
    pmf.forEach((p, k) => { next[k + 1] += explodeP * p; });
    pmf = next;
  }
  return pmf;
}

// Convolves two success-count distributions together, i.e. the distribution of the sum of two
// independent dice (or groups of dice).
function Convolve(a: number[], b: number[]): number[] {
  const result = Array(a.length + b.length - 1).fill(0) as number[];
  a.forEach((pa, i) => { b.forEach((pb, j) => { result[i + j] += pa * pb; }); });
  return result;
}

/**
 * Exact (non-simulated) equivalent of `CalculateDiceProbability`. Computes the true probability
 * distribution analytically -- binomial for closed-ended pools, or a truncated explosion-chain
 * convolution for open-ended pools -- instead of estimating it via random sampling.
 * @returns `number[]` where index `i` is the exact probability of rolling at least `i + 1` successes.
**/
export function CalculateDiceProbability(poolSize: number, openEnded: boolean, shade: Shade): number[] {
  if (poolSize <= 0) throw new Error("CalculateDiceProbability: poolSize must be greater than 0");

  const successThreshold = GetSuccessThreshold(shade);

  const pmf = openEnded
    ? Array(poolSize).fill(0).reduce((acc: number[]) => Convolve(acc, ExplodingDieSuccessPmf(successThreshold)), [1])
    : BinomialPmf(poolSize, (7 - successThreshold) / 6);

  // Cumulative from the top: atLeast[k] = P(successes >= k).
  const atLeast = Array(pmf.length).fill(0) as number[];
  for (let k = pmf.length - 1; k >= 0; k--) {
    atLeast[k] = pmf[k] + (k + 1 < pmf.length ? atLeast[k + 1] : 0);
  }

  const result = atLeast.slice(1);
  while (result.length > 0 && result[result.length - 1] < 1e-9) result.pop();
  return result;
}
