import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetFightActions } from "../../../api/src/services/fightActions.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseAction(overrides: Partial<dat.FightActionsList> = {}): dat.FightActionsList {
  return {
    id: 1 as unknown as dat.FightActionId,
    name: "Strike",
    groupId: 1 as unknown as dat.FightActionGroupId,
    group: "Attack",
    effect: null,
    restrictions: null,
    special: null,
    testExtra: null,
    actionCost: null,
    countsAsNoAction: null,
    ...overrides
  } as unknown as dat.FightActionsList;
}

function MockQueryResults(actions: dat.FightActionsList[], tests: dat.FightActionTestList[] = [], resolutions: dat.FightActionResolutionList[] = []): void {
  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: actions } as never)
    .mockResolvedValueOnce({ rows: tests } as never)
    .mockResolvedValueOnce({ rows: resolutions } as never);
}

describe("GetFightActions", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits every optional text field and flag when null", async () => {
    MockQueryResults([BaseAction()]);
    const result = await GetFightActions();
    expect(result[0].effect).toBeUndefined();
    expect(result[0].restrictions).toBeUndefined();
    expect(result[0].special).toBeUndefined();
    expect(result[0].testExtra).toBeUndefined();
    expect(result[0].actionCost).toBeUndefined();
    expect(result[0].flags.countsAsNoAction).toBeUndefined();
  });

  it("includes every optional field when present", async () => {
    MockQueryResults([BaseAction({
      effect: "Deals damage", restrictions: "Melee only", special: "Requires a weapon",
      testExtra: "vs armor", actionCost: 2, countsAsNoAction: true
    })]);
    const result = await GetFightActions();
    expect(result[0].effect).toBe("Deals damage");
    expect(result[0].restrictions).toBe("Melee only");
    expect(result[0].special).toBe("Requires a weapon");
    expect(result[0].testExtra).toBe("vs armor");
    expect(result[0].actionCost).toBe(2);
    expect(result[0].flags.countsAsNoAction).toBe(true);
  });

  it("groups tests by actionId into skills/abilities tuples", async () => {
    const actionId = 1 as unknown as dat.FightActionId;
    const tests = [
      { actionId, abilityId: 2, ability: "Speed", skillId: null, skill: null },
      { actionId, abilityId: null, ability: null, skillId: 3, skill: "Sword" }
    ] as unknown as dat.FightActionTestList[];

    MockQueryResults([BaseAction({ id: actionId })], tests);
    const result = await GetFightActions();

    expect(result[0].tests).toEqual({ skills: [[3, "Sword"]], abilities: [[2, "Speed"]] });
  });

  it("ignores a test row where ability/abilityId or skill/skillId is missing", async () => {
    const actionId = 1 as unknown as dat.FightActionId;
    const tests = [{ actionId, abilityId: null, ability: null, skillId: null, skill: null }] as unknown as dat.FightActionTestList[];

    MockQueryResults([BaseAction({ id: actionId })], tests);
    const result = await GetFightActions();

    expect(result[0].tests).toEqual({ skills: [], abilities: [] });
  });

  it("omits tests entirely when none match the action", async () => {
    MockQueryResults([BaseAction()], []);
    const result = await GetFightActions();
    expect(result[0].tests).toBeUndefined();
  });

  it("omits resolutions entirely when none match the action", async () => {
    MockQueryResults([BaseAction()], [], []);
    const result = await GetFightActions();
    expect(result[0].resolutions).toBeUndefined();
  });

  it("builds a resolution with every optional field populated", async () => {
    const actionId = 1 as unknown as dat.FightActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Block",
      resolutionTypeId: 1, resolutionType: "Vs",
      isAgainstSkill: true, obstacle: 3, opposingModifier: 2,
      skillId: 6, skill: "Sword",
      abilityId: 7, ability: "Speed",
      opposingSkillId: 8, opposingSkill: "Shield",
      opposingAbilityId: 9, opposingAbility: "Agility"
    }] as unknown as dat.FightActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetFightActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Block"],
      type: [1, "Vs"],
      isAgainstSkill: true,
      obstacle: 3,
      opposingModifier: 2,
      skill: [6, "Sword"],
      ability: [7, "Speed"],
      opposingSkill: [8, "Shield"],
      opposingAbility: [9, "Agility"]
    }]);
  });

  it("builds a resolution with every optional field absent", async () => {
    const actionId = 1 as unknown as dat.FightActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Block",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null,
      abilityId: null, ability: null,
      opposingSkillId: null, opposingSkill: null,
      opposingAbilityId: null, opposingAbility: null
    }] as unknown as dat.FightActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetFightActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Block"],
      type: [1, "Skill"]
    }]);
  });

  it("omits opposingSkill/opposingAbility when the id is set but the name is missing", async () => {
    const actionId = 1 as unknown as dat.FightActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Block",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null, abilityId: null, ability: null,
      opposingSkillId: 8, opposingSkill: null,
      opposingAbilityId: 9, opposingAbility: null
    }] as unknown as dat.FightActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetFightActions();

    expect(result[0].resolutions?.[0].opposingSkill).toBeUndefined();
    expect(result[0].resolutions?.[0].opposingAbility).toBeUndefined();
  });
});
