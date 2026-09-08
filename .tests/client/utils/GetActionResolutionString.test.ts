import { describe, expect, it } from "vitest";

import { GetActionResolutionString } from "../../../client/src/utils/GetActionResolutionString";


function Resolution(overrides: Partial<ActionResolution<dat.DuelOfWitsActionId>>): ActionResolution<dat.DuelOfWitsActionId> {
  return {
    opposingAction: [1 as unknown as dat.DuelOfWitsActionId, "Charge"],
    type: [1 as unknown as dat.ActionResolutionTypeId, "Skill"],
    ...overrides
  };
}

describe("GetActionResolutionString", () => {
  it("renders a Skill-type resolution", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Skill"] }));
    expect(result).toBe("Charge: Skill");
  });

  it("renders an Ob-type resolution with a fixed obstacle", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Ob"], obstacle: 3 }));
    expect(result).toBe("Charge: Ob 3");
  });

  it("renders an Ob-type resolution without an obstacle as Ob=", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Ob"] }));
    expect(result).toBe("Charge: Ob=");
  });

  it("prefixes with the skill name when present", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Skill"], skill: [1 as unknown as dat.SkillId, "Sword"] }));
    expect(result).toBe("Charge: Sword Skill");
  });

  it("prefixes with the ability name over skill when both could apply", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Skill"], ability: [1 as unknown as dat.AbilityId, "Speed"] }));
    expect(result).toBe("Charge: Speed Skill");
  });

  it("suffixes with the opposing skill and appends the opposing modifier", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Vs"], opposingSkill: [1 as unknown as dat.SkillId, "Sword"], opposingModifier: 2 }));
    expect(result).toBe("Charge: Vs Sword +2D");
  });

  it("suffixes with Skill when isAgainstSkill is set", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Std"], isAgainstSkill: true }));
    expect(result).toBe("Charge: Std Skill");
  });

  it.each([
    ["½", "½ "],
    ["+Vs", "+Vs "],
    ["Vs+", "Vs+ "]
  ] as const)("renders a %s-type resolution", (type, prefix) => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, type] }));
    expect(result).toBe(`Charge: ${prefix}`);
  });

  it("suffixes with the opposing ability name when no obstacle, isAgainstSkill, or opposingSkill is set", () => {
    const result = GetActionResolutionString(Resolution({ type: [1 as unknown as dat.ActionResolutionTypeId, "Vs"], opposingAbility: [1 as unknown as dat.AbilityId, "Will"] }));
    expect(result).toBe("Charge: Vs Will");
  });
});
