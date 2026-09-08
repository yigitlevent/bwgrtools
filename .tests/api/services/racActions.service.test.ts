import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetRaCActions } from "../../../api/src/services/racActions.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseAction(overrides: Partial<dat.RangeAndCoverActionsList> = {}): dat.RangeAndCoverActionsList {
  return {
    id: 1 as unknown as dat.RangeAndCoverActionId,
    name: "Fire",
    groupId: 1 as unknown as dat.RangeAndCoverActionGroupId,
    group: "Ranged",
    effect: null,
    specialRestriction: null,
    specialAction: null,
    however: null,
    useFoRKs: null,
    useWeaponRangeAdvantage: null,
    usePositionAdvantage: null,
    useStrideAdvantage: null,
    isOpenEnded: null,
    ...overrides
  } as unknown as dat.RangeAndCoverActionsList;
}

function MockQueryResults(actions: dat.RangeAndCoverActionsList[], resolutions: dat.RangeAndCoverActionResolutionList[] = []): void {
  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: actions } as never)
    .mockResolvedValueOnce({ rows: resolutions } as never);
}

describe("GetRaCActions", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("leaves all flags unset when every flag column is null/false", async () => {
    MockQueryResults([BaseAction()]);
    const result = await GetRaCActions();
    expect(result[0].flags).toEqual({});
  });

  it("sets each flag independently when true", async () => {
    MockQueryResults([BaseAction({ useFoRKs: true, useWeaponRangeAdvantage: true, usePositionAdvantage: true, useStrideAdvantage: true, isOpenEnded: true })]);
    const result = await GetRaCActions();
    expect(result[0].flags).toEqual({
      useFoRKs: true,
      useWeaponRangeAdvantage: true,
      usePositionAdvantage: true,
      useStrideAdvantage: true,
      isOpenEnded: true
    });
  });

  it("omits effect/however/specialAction/specialRestriction when null", async () => {
    MockQueryResults([BaseAction()]);
    const result = await GetRaCActions();
    expect(result[0].effect).toBeUndefined();
    expect(result[0].however).toBeUndefined();
    expect(result[0].specialAction).toBeUndefined();
    expect(result[0].specialRestriction).toBeUndefined();
  });

  it("includes effect/however/specialAction/specialRestriction when present", async () => {
    MockQueryResults([BaseAction({ effect: "Deals ranged damage", however: "unless in cover", specialAction: "Called Shot", specialRestriction: "requires bow" })]);
    const result = await GetRaCActions();
    expect(result[0].effect).toBe("Deals ranged damage");
    expect(result[0].however).toBe("unless in cover");
    expect(result[0].specialAction).toBe("Called Shot");
    expect(result[0].specialRestriction).toBe("requires bow");
  });

  it("omits resolutions entirely when none match the action", async () => {
    MockQueryResults([BaseAction()], []);
    const result = await GetRaCActions();
    expect(result[0].resolutions).toBeUndefined();
  });

  it("builds a resolution with every optional field populated", async () => {
    const actionId = 1 as unknown as dat.RangeAndCoverActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Duck",
      resolutionTypeId: 1, resolutionType: "Vs",
      isAgainstSkill: true, obstacle: 3, opposingModifier: 2,
      skillId: 6, skill: "Bow",
      abilityId: 7, ability: "Perception",
      opposingSkillId: 8, opposingSkill: "Dodge",
      opposingAbilityId: 9, opposingAbility: "Agility"
    }] as unknown as dat.RangeAndCoverActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], resolutions);
    const result = await GetRaCActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Duck"],
      type: [1, "Vs"],
      isAgainstSkill: true,
      obstacle: 3,
      opposingModifier: 2,
      skill: [6, "Bow"],
      ability: [7, "Perception"],
      opposingSkill: [8, "Dodge"],
      opposingAbility: [9, "Agility"]
    }]);
  });

  it("builds a resolution with every optional field absent", async () => {
    const actionId = 1 as unknown as dat.RangeAndCoverActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Duck",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null,
      abilityId: null, ability: null,
      opposingSkillId: null, opposingSkill: null,
      opposingAbilityId: null, opposingAbility: null
    }] as unknown as dat.RangeAndCoverActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], resolutions);
    const result = await GetRaCActions();

    expect(result[0].resolutions).toEqual([{
      opposingAction: [5, "Duck"],
      type: [1, "Skill"]
    }]);
  });

  it("omits opposingSkill/opposingAbility when the id is set but the name is missing", async () => {
    const actionId = 1 as unknown as dat.RangeAndCoverActionId;
    const resolutions = [{
      actionId,
      opposingActionId: 5, opposingAction: "Duck",
      resolutionTypeId: 1, resolutionType: "Skill",
      isAgainstSkill: null, obstacle: null, opposingModifier: null,
      skillId: null, skill: null, abilityId: null, ability: null,
      opposingSkillId: 8, opposingSkill: null,
      opposingAbilityId: 9, opposingAbility: null
    }] as unknown as dat.RangeAndCoverActionResolutionList[];

    MockQueryResults([BaseAction({ id: actionId })], resolutions);
    const result = await GetRaCActions();

    expect(result[0].resolutions?.[0].opposingSkill).toBeUndefined();
    expect(result[0].resolutions?.[0].opposingAbility).toBeUndefined();
  });
});
