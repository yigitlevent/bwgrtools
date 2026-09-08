import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculateDiceProbability } from "../../../client/src/utils/CalculateDiceProbability";


describe("CalculateDiceProbability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns one probability per possible success count (1..poolSize)", () => {
    const result = CalculateDiceProbability(4, false, "B", 1000);
    expect(result).toHaveLength(4);
  });

  it("returns non-increasing probabilities (chance of >=N successes only shrinks as N grows)", () => {
    const result = CalculateDiceProbability(6, false, "B", 2000);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i - 1]);
    }
  });

  it("keeps every probability within [0, 1]", () => {
    const result = CalculateDiceProbability(6, true, "G", 2000);
    result.forEach(p => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  it("guarantees at least 1 success for every roll when every die is forced to hit", () => {
    // Stub every die roll to the maximum face (6), so every shade's success threshold is met.
    vi.spyOn(Math, "random").mockReturnValue(0.9999);
    const result = CalculateDiceProbability(3, false, "W", 100);
    // With every roll forced to a success, P(>=1 success) must be 1.
    expect(result[0]).toBe(1);
  });

  it("a closed-ended pool never reports more successes than dice rolled", () => {
    // A closed-ended pool of N dice can score at most N successes, so the result (indices 1..N)
    // never has more than N entries -- unlike open-ended, where exploding 6s can push the success
    // count past the pool size.
    const closed = CalculateDiceProbability(3, false, "B", 5000);
    expect(closed.length).toBeLessThanOrEqual(3);
  });

  it("an open-ended pool can score more successes than dice rolled, via exploding 6s", () => {
    // With enough iterations of real randomness, a small open-ended White-shade pool (success on
    // 2+, so almost every roll succeeds) reliably rolls at least one exploding 6 that chains into
    // an extra success past the pool size.
    const open = CalculateDiceProbability(2, true, "W", 5000);
    expect(open.length).toBeGreaterThan(2);
  });

  it("uses higher success thresholds for lower shades (W needs only 2+, B needs 4+)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    const rollValue = Math.floor(0.4 * 6) + 1;
    expect(rollValue).toBe(3);

    const white = CalculateDiceProbability(1, false, "W", 10);
    const black = CalculateDiceProbability(1, false, "B", 10);

    // A roll of 3 is a success for White (>=2), so P(>=1) = 1. For Black (needs >=4) it's never a
    // success, so the result array (indices 1..poolSize) is entirely empty -- there's no "0
    // successes" entry to read, since the function only reports P(>=N) for N from 1 up.
    expect(white[0]).toBe(1);
    expect(black).toEqual([]);
  });
});
