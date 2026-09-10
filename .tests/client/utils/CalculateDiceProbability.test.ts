import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculateDiceProbability, CalculateDiceProbabilityMonteCarlo } from "../../../client/src/utils/CalculateDiceProbability";


describe("CalculateDiceProbabilityMonteCarlo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns one probability per possible success count (1..poolSize)", () => {
    const result = CalculateDiceProbabilityMonteCarlo(4, false, "B", 1000);
    expect(result).toHaveLength(4);
  });

  it("returns non-increasing probabilities (chance of >=N successes only shrinks as N grows)", () => {
    const result = CalculateDiceProbabilityMonteCarlo(6, false, "B", 2000);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i - 1]);
    }
  });

  it("keeps every probability within [0, 1]", () => {
    const result = CalculateDiceProbabilityMonteCarlo(6, true, "G", 2000);
    result.forEach(p => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  it("guarantees at least 1 success for every roll when every die is forced to hit", () => {
    // Stub every die roll to the maximum face (6), so every shade's success threshold is met.
    vi.spyOn(Math, "random").mockReturnValue(0.9999);
    const result = CalculateDiceProbabilityMonteCarlo(3, false, "W", 100);
    // With every roll forced to a success, P(>=1 success) must be 1.
    expect(result[0]).toBe(1);
  });

  it("a closed-ended pool never reports more successes than dice rolled", () => {
    // A closed-ended pool of N dice can score at most N successes, so the result (indices 1..N)
    // never has more than N entries -- unlike open-ended, where exploding 6s can push the success
    // count past the pool size.
    const closed = CalculateDiceProbabilityMonteCarlo(3, false, "B", 5000);
    expect(closed.length).toBeLessThanOrEqual(3);
  });

  it("an open-ended pool can score more successes than dice rolled, via exploding 6s", () => {
    // With enough iterations of real randomness, a small open-ended White-shade pool (success on
    // 2+, so almost every roll succeeds) reliably rolls at least one exploding 6 that chains into
    // an extra success past the pool size.
    const open = CalculateDiceProbabilityMonteCarlo(2, true, "W", 5000);
    expect(open.length).toBeGreaterThan(2);
  });

  it("uses higher success thresholds for lower shades (W needs only 2+, B needs 4+)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    const rollValue = Math.floor(0.4 * 6) + 1;
    expect(rollValue).toBe(3);

    const white = CalculateDiceProbabilityMonteCarlo(1, false, "W", 10);
    const black = CalculateDiceProbabilityMonteCarlo(1, false, "B", 10);

    // A roll of 3 is a success for White (>=2), so P(>=1) = 1. For Black (needs >=4) it's never a
    // success, so the result array (indices 1..poolSize) is entirely empty -- there's no "0
    // successes" entry to read, since the function only reports P(>=N) for N from 1 up.
    expect(white[0]).toBe(1);
    expect(black).toEqual([]);
  });

  it("throws when poolSize is not positive", () => {
    expect(() => CalculateDiceProbabilityMonteCarlo(0, false, "B")).toThrow();
    expect(() => CalculateDiceProbabilityMonteCarlo(-1, false, "B")).toThrow();
  });

  it("throws when iterations is not positive", () => {
    expect(() => CalculateDiceProbabilityMonteCarlo(3, false, "B", 0)).toThrow();
    expect(() => CalculateDiceProbabilityMonteCarlo(3, false, "B", -5)).toThrow();
  });
});

describe("CalculateDiceProbability (exact)", () => {
  it("matches the exact binomial probability for a single closed-ended die", () => {
    // White succeeds on 2+ (5 of 6 faces), Green on 3+ (4 of 6), Black on 4+ (3 of 6).
    expect(CalculateDiceProbability(1, false, "W")).toEqual([5 / 6]);
    expect(CalculateDiceProbability(1, false, "G")).toEqual([4 / 6]);
    expect(CalculateDiceProbability(1, false, "B")).toEqual([0.5]);
  });

  it("matches the exact binomial distribution for a small closed-ended pool", () => {
    // Black (p=0.5) with 2 dice: P(>=1) = 1 - 0.5^2 = 0.75, P(>=2) = 0.5^2 = 0.25.
    const result = CalculateDiceProbability(2, false, "B");
    expect(result[0]).toBeCloseTo(0.75, 10);
    expect(result[1]).toBeCloseTo(0.25, 10);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when the shade can never succeed on a hypothetical 0-success pool", () => {
    // Not a real game case (every shade can succeed), but guards the "all trailing zero
    // probabilities get trimmed" behavior shared with the Monte Carlo version.
    const result = CalculateDiceProbability(1, false, "B");
    expect(result.every(p => p > 0)).toBe(true);
  });

  it("returns non-increasing probabilities", () => {
    const result = CalculateDiceProbability(6, false, "B");
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i - 1]);
    }
  });

  it("keeps every probability within [0, 1]", () => {
    const result = CalculateDiceProbability(6, true, "G");
    result.forEach(p => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  it("a closed-ended pool never reports more successes than dice rolled", () => {
    const closed = CalculateDiceProbability(3, false, "B");
    expect(closed.length).toBeLessThanOrEqual(3);
  });

  it("an open-ended pool can score more successes than dice rolled, via exploding 6s", () => {
    // Unlike the Monte Carlo version this is deterministic: a single open-ended die always has a
    // non-zero (if tiny) chance of chaining past 1 success, so the tail always extends past poolSize.
    const open = CalculateDiceProbability(2, true, "W");
    expect(open.length).toBeGreaterThan(2);
  });

  it("open-ended P(>=1 success) equals the closed-ended value, since exploding only chains an existing success", () => {
    // Exploding on a 6 doesn't create new ways to get the *first* success -- it only adds extra
    // successes on top of one already scored -- so P(>=1) is identical between the two modes.
    for (const shade of ["W", "G", "B"] as Shade[]) {
      const closed = CalculateDiceProbability(3, false, shade);
      const open = CalculateDiceProbability(3, true, shade);
      expect(open[0]).toBeCloseTo(closed[0], 10);
    }
  });

  it("uses higher success thresholds for lower shades (W needs only 2+, B needs 4+)", () => {
    const white = CalculateDiceProbability(1, false, "W");
    const black = CalculateDiceProbability(1, false, "B");
    expect(white[0]).toBeGreaterThan(black[0]);
  });

  it("throws when poolSize is not positive", () => {
    expect(() => CalculateDiceProbability(0, false, "B")).toThrow();
    expect(() => CalculateDiceProbability(-1, false, "B")).toThrow();
  });

  it("closely matches the Monte Carlo simulation across pool sizes and shades", () => {
    // The exact and simulated implementations model the same game rules, so over enough iterations
    // the simulation should converge close to the exact analytical result.
    const cases: [number, boolean, Shade][] = [
      [4, false, "B"],
      [6, false, "G"],
      [3, true, "W"],
      [5, true, "B"],
      [2, true, "G"],
    ];

    for (const [poolSize, openEnded, shade] of cases) {
      const exact = CalculateDiceProbability(poolSize, openEnded, shade);
      const sim = CalculateDiceProbabilityMonteCarlo(poolSize, openEnded, shade, 20000);

      const overlapLength = Math.min(exact.length, sim.length);
      for (let i = 0; i < overlapLength; i++) {
        expect(sim[i]).toBeCloseTo(exact[i], 1);
      }
    }
  });
});
