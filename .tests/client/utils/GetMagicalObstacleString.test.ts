import { describe, expect, it } from "vitest";

import { GetObstacleString } from "../../../client/src/utils/GetMagicalObstacleString";


function ResourceStub(): Resource {
  return { id: 1 as unknown as dat.ResourceId, name: "Test Spell" } as Resource;
}

describe("GetObstacleString", () => {
  it("renders a fixed obstacle number", () => {
    const result = GetObstacleString(ResourceStub(), [{ obstacle: 3 }]);
    expect(result).toBe("3");
  });

  it("adds a caret suffix when caret is set", () => {
    const result = GetObstacleString(ResourceStub(), [{ obstacle: 3, caret: true }]);
    expect(result).toBe("3^");
  });

  it("renders an ability-based obstacle joined by slashes", () => {
    const result = GetObstacleString(ResourceStub(), [{ abilities: [[1 as unknown as dat.AbilityId, "Will"], [2 as unknown as dat.AbilityId, "Perception"]] }]);
    expect(result).toBe("Will/Perception");
  });

  it("adds a caret suffix to an ability-based obstacle when caret is set", () => {
    const result = GetObstacleString(ResourceStub(), [{ abilities: [[1 as unknown as dat.AbilityId, "Will"]], caret: true }]);
    expect(result).toBe("Will^");
  });

  it("prefixes with a description when provided", () => {
    const result = GetObstacleString(ResourceStub(), [{ obstacle: 3, description: "Target" }]);
    expect(result).toBe("Target: 3");
  });

  it("joins multiple obstacle details with semicolons", () => {
    const result = GetObstacleString(ResourceStub(), [{ obstacle: 3 }, { obstacle: 4 }]);
    expect(result).toBe("3; 4");
  });

  it("throws when a detail has neither obstacle nor abilities", () => {
    expect(() => GetObstacleString(ResourceStub(), [{}])).toThrow();
  });
});
