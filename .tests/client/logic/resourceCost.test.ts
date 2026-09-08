import { describe, expect, it } from "vitest";

import { GetSelectedModifiers, GetTotalCost, ResetCosts } from "../../../client/src/logic/resourceCost";


function CreateResource(overrides: Partial<Resource> = {}): Resource {
  return {
    rulesets: null,
    id: 1 as unknown as dat.ResourceId,
    name: "Test Resource",
    stock: [null, ""],
    type: [null, ""],
    costs: [[10, "base"]],
    modifiers: [],
    ...overrides
  };
}

describe("ResetCosts", () => {
  it("uses the first cost tier as baseCost when not variable", () => {
    const resource = CreateResource({ costs: [[15, "base"], [20, "upgraded"]] });
    expect(ResetCosts(resource).baseCost).toBe(15);
  });

  it("starts baseCost at 0 when variableCost is set", () => {
    const resource = CreateResource({ variableCost: true, costs: [[15, "base"]] });
    expect(ResetCosts(resource).baseCost).toBe(0);
  });

  it("builds a modifiers map keyed by description, unselected by default", () => {
    const resource = CreateResource({
      modifiers: [
        [5, false, "Flat Modifier"],
        [2, true, "Per-Weapon Modifier"]
      ]
    });

    const result = ResetCosts(resource);

    expect(result.modifiers).toEqual({
      "Flat Modifier": { cost: 5, selected: false },
      "Per-Weapon Modifier": { cost: "2/per", selected: false }
    });
  });
});

describe("GetSelectedModifiers", () => {
  it("returns only selected modifiers as [name, cost] tuples", () => {
    const costs = {
      baseCost: 10,
      modifiers: {
        "A": { cost: 5, selected: true },
        "B": { cost: 3, selected: false },
        "C": { cost: "1/per" as const, selected: true }
      }
    };

    expect(GetSelectedModifiers(costs)).toEqual([["A", 5], ["C", "1/per"]]);
  });

  it("returns an empty array when nothing is selected", () => {
    const costs = { baseCost: 10, modifiers: { "A": { cost: 5, selected: false } } };
    expect(GetSelectedModifiers(costs)).toEqual([]);
  });
});

describe("GetTotalCost", () => {
  const baseCosts = { baseCost: 10, modifiers: {} };

  it("returns baseCost when there are no modifiers", () => {
    expect(GetTotalCost(baseCosts, [], 1)).toBe(10);
  });

  it("adds flat numeric modifiers directly", () => {
    expect(GetTotalCost(baseCosts, [["A", 5]], 1)).toBe(15);
  });

  it("multiplies per-weapon modifiers by numberOfWeapons", () => {
    expect(GetTotalCost(baseCosts, [["A", "2/per"]], 3)).toBe(16);
  });

  it("combines flat and per-weapon modifiers", () => {
    expect(GetTotalCost(baseCosts, [["A", 5], ["B", "2/per"]], 2)).toBe(19);
  });

  it("floors the total at 1 when modifiers bring it below 1", () => {
    const costs = { baseCost: 0, modifiers: {} };
    expect(GetTotalCost(costs, [], 1)).toBe(1);
  });

  it("floors a negative total at 1", () => {
    const costs = { baseCost: 2, modifiers: {} };
    expect(GetTotalCost(costs, [["A", -5]], 1)).toBe(1);
  });
});
