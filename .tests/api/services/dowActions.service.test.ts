import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetDoWActions } from "../../../api/src/services/dowActions.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseAction(overrides: Partial<dat.DuelOfWitsAction> = {}): dat.DuelOfWitsAction {
  return {
    id: 1 as unknown as dat.DuelOfWitsActionId,
    name: "Point",
    effect: null,
    speakingThePart: null,
    special: null,
    ...overrides
  } as unknown as dat.DuelOfWitsAction;
}

function MockQueryResults(actions: dat.DuelOfWitsAction[], tests: dat.DoWActionTestList[] = [], resolutions: dat.DoWActionResolutionList[] = []): void {
  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: actions } as never)
    .mockResolvedValueOnce({ rows: tests } as never)
    .mockResolvedValueOnce({ rows: resolutions } as never);
}

describe("GetDoWActions", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits effect/speakingThePart/special when null", async () => {
    MockQueryResults([BaseAction()]);
    const result = await GetDoWActions();
    expect(result[0].effect).toBeUndefined();
    expect(result[0].speakingThePart).toBeUndefined();
    expect(result[0].special).toBeUndefined();
  });

  it("includes effect/speakingThePart/special when present", async () => {
    MockQueryResults([BaseAction({ effect: "Scores a point", speakingThePart: "I will not yield", special: "Requires a Duel of Wits" })]);
    const result = await GetDoWActions();
    expect(result[0].effect).toBe("Scores a point");
    expect(result[0].speakingThePart).toBe("I will not yield");
    expect(result[0].special).toBe("Requires a Duel of Wits");
  });

  it("groups tests by actionId into skills/abilities tuples", async () => {
    const actionId = 1 as unknown as dat.DuelOfWitsActionId;
    const tests = [
      { actionId, abilityId: 2, ability: "Will", skillId: null, skill: null },
      { actionId, abilityId: null, ability: null, skillId: 3, skill: "Rhetoric" }
    ] as unknown as dat.DoWActionTestList[];

    MockQueryResults([BaseAction({ id: actionId })], tests);
    const result = await GetDoWActions();

    expect(result[0].tests).toEqual({ skills: [[3, "Rhetoric"]], abilities: [[2, "Will"]] });
  });

  it("ignores a test row where ability/abilityId or skill/skillId is missing", async () => {
    const actionId = 1 as unknown as dat.DuelOfWitsActionId;
    const tests = [{ actionId, abilityId: null, ability: null, skillId: null, skill: null }] as unknown as dat.DoWActionTestList[];

    MockQueryResults([BaseAction({ id: actionId })], tests);
    const result = await GetDoWActions();

    expect(result[0].tests).toEqual({ skills: [], abilities: [] });
  });

  it("omits tests entirely when none match the action", async () => {
    MockQueryResults([BaseAction()], []);
    const result = await GetDoWActions();
    expect(result[0].tests).toBeUndefined();
  });

  it("omits resolutions entirely when none match the action", async () => {
    MockQueryResults([BaseAction()], [], []);
    const result = await GetDoWActions();
    expect(result[0].resolutions).toBeUndefined();
  });

  it("builds a resolution with every optional field populated", async () => {
    const actionId = 1 as unknown as dat.DuelOfWitsActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Rebuttal",
      resolutionTypeId: 1, resolutionType: "Vs",
      isAgainstSkill: true, obstacle: 3, opposingModifier: 2,
      skillId: 6, skill: "Rhetoric",
      abilityId: 7, ability: "Will",
      opposingSkillId: 8, opposingSkill: "Oratory",
      opposingAbilityId: 9, opposingAbility: "Perception"
    }] as unknown as dat.DoWActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetDoWActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Rebuttal"],
      type: [1, "Vs"],
      isAgainstSkill: true,
      obstacle: 3,
      opposingModifier: 2,
      skill: [6, "Rhetoric"],
      ability: [7, "Will"],
      opposingSkill: [8, "Oratory"],
      opposingAbility: [9, "Perception"]
    }]);
  });

  it("builds a resolution with every optional field absent", async () => {
    const actionId = 1 as unknown as dat.DuelOfWitsActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Rebuttal",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null,
      abilityId: null, ability: null,
      opposingSkillId: null, opposingSkill: null,
      opposingAbilityId: null, opposingAbility: null
    }] as unknown as dat.DoWActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetDoWActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Rebuttal"],
      type: [1, "Skill"]
    }]);
  });

  it("omits opposingSkill/opposingAbility when the id is set but the name is missing", async () => {
    const actionId = 1 as unknown as dat.DuelOfWitsActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Rebuttal",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null, abilityId: null, ability: null,
      opposingSkillId: 8, opposingSkill: null,
      opposingAbilityId: 9, opposingAbility: null
    }] as unknown as dat.DoWActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], [], resolutions);
    const result = await GetDoWActions();

    expect(result[0].resolutions?.[0].opposingSkill).toBeUndefined();
    expect(result[0].resolutions?.[0].ability).toBeUndefined();
  });
});
