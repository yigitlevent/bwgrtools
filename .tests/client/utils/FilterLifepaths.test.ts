import { describe, expect, it } from "vitest";

import { FilterLifepaths } from "../../../client/src/utils/FilterLifepaths";
import { UniqueArray } from "../../../client/src/utils/UniqueArray";


function makeLifepath(overrides: Partial<Lifepath> = {}): Lifepath {
  return {
    rulesets: null,
    id: 1 as dat.LifepathId,
    name: "Test Lifepath",
    stock: [0 as dat.StockId, "Human"],
    setting: [0 as dat.SettingId, "Test Setting"],
    years: 1,
    pools: {
      eitherStatPool: null,
      mentalStatPool: null,
      physicalStatPool: null,
      generalSkillPool: null,
      lifepathSkillPool: null,
      traitPool: null,
      resourcePoints: null
    },
    flags: {
      isBorn: false,
      isGSPMultipliedByYear: false,
      isLSPMultipliedByYear: false,
      isRPMultipliedByYear: false,
      getHalfGSPFromPrevLP: false,
      getHalfLSPFromPrevLP: false,
      getHalfRPFromPrevLP: false
    },
    ...overrides
  };
}

const stockId = 0 as dat.StockId;
const stock: [dat.StockId, string] = [stockId, "Human"];

describe("FilterLifepaths", () => {
  it("returns born lifepaths for the given stock when the character has none yet", () => {
    const born = makeLifepath({ id: 1 as dat.LifepathId, name: "Born Lifepath", flags: { ...makeLifepath().flags, isBorn: true } });
    const bornOtherStock = makeLifepath({ id: 2 as dat.LifepathId, name: "Other Stock", stock: [1 as dat.StockId, "Dwarf"], flags: { ...makeLifepath().flags, isBorn: true } });
    const notBorn = makeLifepath({ id: 3 as dat.LifepathId, name: "Not Born" });

    const result = FilterLifepaths({
      rulesetLifepaths: [born, bornOtherStock, notBorn],
      stock,
      age: 0,
      lifepaths: []
    });

    expect(result).toEqual([born]);
  });

  it("returns lifepaths in the same setting as the last taken lifepath", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const next = makeLifepath({ id: 2 as dat.LifepathId, setting: [settingId, "Home"] });
    const other = makeLifepath({ id: 3 as dat.LifepathId, setting: [6 as dat.SettingId, "Elsewhere"] });

    const result = FilterLifepaths({
      rulesetLifepaths: [next, other],
      stock,
      age: 10,
      lifepaths: [last]
    });

    expect(result).toEqual([next]);
  });

  it("includes lifepaths from lead settings in addition to the current setting", () => {
    const settingId = 5 as dat.SettingId;
    const leadSettingId = 6 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"], leads: [leadSettingId] });
    const sameSetting = makeLifepath({ id: 2 as dat.LifepathId, setting: [settingId, "Home"] });
    const leadSetting = makeLifepath({ id: 3 as dat.LifepathId, setting: [leadSettingId, "Elsewhere"] });

    const result = FilterLifepaths({
      rulesetLifepaths: [sameSetting, leadSetting],
      stock,
      age: 10,
      lifepaths: [last]
    });

    expect(result).toEqual(expect.arrayContaining([sameSetting, leadSetting]));
    expect(result).toHaveLength(2);
  });

  it("excludes isBorn lifepaths once the character already has a lifepath", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const bornAgain = makeLifepath({ id: 2 as dat.LifepathId, setting: [settingId, "Home"], flags: { ...makeLifepath().flags, isBorn: true } });

    const result = FilterLifepaths({
      rulesetLifepaths: [bornAgain],
      stock,
      age: 10,
      lifepaths: [last]
    });

    expect(result).toEqual([]);
  });

  it("filters to only setting-entry lifepaths when the setting hasn't been entered yet", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const entry = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "isSettingEntry"], isSettingEntry: true }] }]
    });
    const nonEntry = makeLifepath({ id: 3 as dat.LifepathId, setting: [settingId, "Home"] });

    const result = FilterLifepaths({
      rulesetLifepaths: [entry, nonEntry],
      stock,
      age: 10,
      lifepaths: [last],
      hasSetting: () => 0
    });

    expect(result).toEqual([entry]);
  });

  it("does not require setting-entry once the setting has already been entered", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const entry = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "isSettingEntry"], isSettingEntry: true }] }]
    });
    const nonEntry = makeLifepath({ id: 3 as dat.LifepathId, setting: [settingId, "Home"] });

    const result = FilterLifepaths({
      rulesetLifepaths: [entry, nonEntry],
      stock,
      age: 10,
      lifepaths: [last],
      hasSetting: () => 1
    });

    // Once the setting has already been entered, the entry-only requirement no longer holds
    // (isSettingEntry's own check requires hasSetting(...) === 0), so only the non-entry
    // lifepath is returned -- entry lifepaths are single-use gateways into a setting.
    expect(result).toEqual([nonEntry]);
  });

  it("treats isSettingEntry as satisfied when the candidate lifepath has no setting", () => {
    // isSettingEntry's own check reads `lifepath.setting[0]` off the candidate being evaluated --
    // when that's null the ternary short-circuits to satisfied regardless of hasSetting. A
    // candidate can only be evaluated at all if its setting matches the last lifepath's, so both
    // are given a null setting here.
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [null, "Nowhere"] });
    const entryWithoutSetting = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [null, "Nowhere"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "isSettingEntry"], isSettingEntry: true }] }]
    });

    const result = FilterLifepaths({
      rulesetLifepaths: [entryWithoutSetting],
      stock,
      age: 10,
      lifepaths: [last],
      hasSetting: () => 1
    });

    expect(result).toEqual([entryWithoutSetting]);
  });

  it("applies AND requirement blocks, excluding lifepaths that fail a mandatory item", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const requiresFemale = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "gender"], gender: "Female" }] }]
    });

    const resultMale = FilterLifepaths({
      rulesetLifepaths: [requiresFemale],
      stock,
      age: 10,
      lifepaths: [last],
      gender: "Male"
    });
    expect(resultMale).toEqual([]);

    const resultFemale = FilterLifepaths({
      rulesetLifepaths: [requiresFemale],
      stock,
      age: 10,
      lifepaths: [last],
      gender: "Female"
    });
    expect(resultFemale).toEqual([requiresFemale]);
  });

  it("applies age-based requirement items (minYears/maxYears)", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsMinAge = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "minYears"], minYears: 18 }] }]
    });

    const tooYoung = FilterLifepaths({ rulesetLifepaths: [needsMinAge], stock, age: 10, lifepaths: [last] });
    expect(tooYoung).toEqual([]);

    const oldEnough = FilterLifepaths({ rulesetLifepaths: [needsMinAge], stock, age: 20, lifepaths: [last] });
    expect(oldEnough).toEqual([needsMinAge]);

    const needsMaxAge = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "maxYears"], maxYears: 30 }] }]
    });

    const tooOld = FilterLifepaths({ rulesetLifepaths: [needsMaxAge], stock, age: 40, lifepaths: [last] });
    expect(tooOld).toEqual([]);

    const youngEnough = FilterLifepaths({ rulesetLifepaths: [needsMaxAge], stock, age: 20, lifepaths: [last] });
    expect(youngEnough).toEqual([needsMaxAge]);
  });

  it("applies lifepath-index requirement items (minLpIndex/maxLpIndex)", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsMinIndex = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "minLpIndex"], minLpIndex: 2 }] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [needsMinIndex], stock, age: 10, lifepaths: [last] })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsMinIndex], stock, age: 10, lifepaths: [last, last] })).toEqual([needsMinIndex]);

    const needsMaxIndex = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "maxLpIndex"], maxLpIndex: 1 }] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [needsMaxIndex], stock, age: 10, lifepaths: [last, last] })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsMaxIndex], stock, age: 10, lifepaths: [last] })).toEqual([needsMaxIndex]);
  });

  it("treats an isUnique requirement as satisfied only when the lifepath hasn't already been taken", () => {
    const settingId = 5 as dat.SettingId;
    const uniqueLpId = 42 as dat.LifepathId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const uniqueLifepath = makeLifepath({
      id: uniqueLpId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "isUnique"], isUnique: true }] }]
    });

    const notYetTaken = FilterLifepaths({ rulesetLifepaths: [uniqueLifepath], stock, age: 10, lifepaths: [last] });
    expect(notYetTaken).toEqual([uniqueLifepath]);

    const alreadyTaken = FilterLifepaths({ rulesetLifepaths: [uniqueLifepath], stock, age: 10, lifepaths: [last, { ...uniqueLifepath, setting: last.setting }] });
    expect(alreadyTaken).toEqual([]);
  });

  it("always treats an oldestBy requirement item as satisfied", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsOldestBy = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "oldestBy"], oldestBy: 5 }] }]
    });

    const result = FilterLifepaths({ rulesetLifepaths: [needsOldestBy], stock, age: 10, lifepaths: [last] });
    expect(result).toEqual([needsOldestBy]);
  });

  it("fails a min/max attribute check when the character doesn't have the attribute at all", () => {
    const settingId = 5 as dat.SettingId;
    const attributeId = 7 as dat.AbilityId;
    const otherAttributeId = 8 as dat.AbilityId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsMinAttribute = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"], min: 3 }] }]
    });
    const needsMaxAttribute = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"], max: 3 }] }]
    });
    const attributesWithoutTarget = new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: otherAttributeId, name: "Spite", hasShade: false, shadeShifted: false, exponent: 5 }]);

    expect(FilterLifepaths({ rulesetLifepaths: [needsMinAttribute], stock, age: 10, lifepaths: [last], attributes: attributesWithoutTarget })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsMaxAttribute], stock, age: 10, lifepaths: [last], attributes: attributesWithoutTarget })).toEqual([]);
  });

  it("applies OR logic across requirement items", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const orBlockLifepath = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{
        logicType: [0 as dat.LogicTypeId, "OR"],
        mustFulfill: true,
        fulfillmentAmount: null,
        items: [
          { logicType: [0 as dat.RequirementItemTypeId, "minYears"], minYears: 999 },
          { logicType: [0 as dat.RequirementItemTypeId, "gender"], gender: "Female" }
        ]
      }]
    });

    const result = FilterLifepaths({ rulesetLifepaths: [orBlockLifepath], stock, age: 10, lifepaths: [last], gender: "Female" });
    expect(result).toEqual([orBlockLifepath]);
  });

  it("filters to only the noLeads setting when provided", () => {
    const settingId = 5 as dat.SettingId;
    const otherSettingId = 6 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"], leads: [otherSettingId] });
    const inSetting = makeLifepath({ id: 2 as dat.LifepathId, setting: [settingId, "Home"] });
    const inLeadSetting = makeLifepath({ id: 3 as dat.LifepathId, setting: [otherSettingId, "Elsewhere"] });

    const result = FilterLifepaths({
      rulesetLifepaths: [inSetting, inLeadSetting],
      stock,
      age: 10,
      lifepaths: [last],
      noLeads: [settingId, "Home"]
    });

    expect(result).toEqual([inSetting]);
  });

  it("applies min/max attribute requirement items", () => {
    const settingId = 5 as dat.SettingId;
    const attributeId = 7 as dat.AbilityId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsMinAttribute = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"], min: 3 }] }]
    });

    const lowAttributes = new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: attributeId, name: "Grief", hasShade: false, shadeShifted: false, exponent: 1 }]);
    const tooLow = FilterLifepaths({ rulesetLifepaths: [needsMinAttribute], stock, age: 10, lifepaths: [last], attributes: lowAttributes });
    expect(tooLow).toEqual([]);

    const highAttributes = new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: attributeId, name: "Grief", hasShade: false, shadeShifted: false, exponent: 5 }]);
    const highEnough = FilterLifepaths({ rulesetLifepaths: [needsMinAttribute], stock, age: 10, lifepaths: [last], attributes: highAttributes });
    expect(highEnough).toEqual([needsMinAttribute]);

    const needsMaxAttribute = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"], max: 3 }] }]
    });
    const tooHigh = FilterLifepaths({ rulesetLifepaths: [needsMaxAttribute], stock, age: 10, lifepaths: [last], attributes: highAttributes });
    expect(tooHigh).toEqual([]);
    const lowEnough = FilterLifepaths({ rulesetLifepaths: [needsMaxAttribute], stock, age: 10, lifepaths: [last], attributes: lowAttributes });
    expect(lowEnough).toEqual([needsMaxAttribute]);
  });

  it("falls back to hasAttribute when no min/max is set on the requirement item", () => {
    const settingId = 5 as dat.SettingId;
    const attributeId = 7 as dat.AbilityId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsAttribute = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"] }] }]
    });
    const attributes = new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: attributeId, name: "Grief", hasShade: false, shadeShifted: false, exponent: 1 }]);

    const withoutAttr = FilterLifepaths({ rulesetLifepaths: [needsAttribute], stock, age: 10, lifepaths: [last], attributes, hasAttribute: () => false });
    expect(withoutAttr).toEqual([]);

    const withAttr = FilterLifepaths({ rulesetLifepaths: [needsAttribute], stock, age: 10, lifepaths: [last], attributes, hasAttribute: () => true });
    expect(withAttr).toEqual([needsAttribute]);
  });

  it("applies skill and trait requirement items via the provided checkers", () => {
    const settingId = 5 as dat.SettingId;
    const skillId = 9 as dat.SkillId;
    const traitId = 11 as dat.TraitId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsSkill = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "skill"], skill: [skillId, "Sword"] }] }]
    });
    const needsTrait = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "trait"], trait: [traitId, "Brave"] }] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [needsSkill], stock, age: 10, lifepaths: [last], hasSkillOpen: () => false })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsSkill], stock, age: 10, lifepaths: [last], hasSkillOpen: () => true })).toEqual([needsSkill]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsTrait], stock, age: 10, lifepaths: [last], hasTraitOpen: () => false })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsTrait], stock, age: 10, lifepaths: [last], hasTraitOpen: () => true })).toEqual([needsTrait]);
  });

  it("treats a gender requirement item as satisfied when no gender is provided", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const requiresFemale = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "gender"], gender: "Female" }] }]
    });

    const result = FilterLifepaths({ rulesetLifepaths: [requiresFemale], stock, age: 10, lifepaths: [last] });
    expect(result).toEqual([requiresFemale]);
  });

  it("treats an attribute requirement item as satisfied when no min/max/hasAttribute is available", () => {
    const settingId = 5 as dat.SettingId;
    const attributeId = 7 as dat.AbilityId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsAttribute = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "attribute"], attribute: [attributeId, "Grief"] }] }]
    });
    const attributes = new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: attributeId, name: "Grief", hasShade: false, shadeShifted: false, exponent: 1 }]);

    const result = FilterLifepaths({ rulesetLifepaths: [needsAttribute], stock, age: 10, lifepaths: [last], attributes });
    expect(result).toEqual([needsAttribute]);
  });

  it("treats skill/trait/setting/question requirement items as satisfied when no checker is provided", () => {
    const settingId = 5 as dat.SettingId;
    const skillId = 9 as dat.SkillId;
    const traitId = 11 as dat.TraitId;
    const requiredSettingId = 8 as dat.SettingId;
    const questionId = 3 as dat.QuestionId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });

    const needsSkill = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "skill"], skill: [skillId, "Sword"] }] }]
    });
    const needsTrait = makeLifepath({
      id: 3 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "trait"], trait: [traitId, "Brave"] }] }]
    });
    const needsSettingCount = makeLifepath({
      id: 4 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: 2, items: [{ logicType: [0 as dat.RequirementItemTypeId, "setting"], setting: [requiredSettingId, "Elsewhere"] }] }]
    });
    const needsQuestion = makeLifepath({
      id: 5 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "question"], question: [questionId, "true"] } as unknown as LifepathRequirementItem] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [needsSkill], stock, age: 10, lifepaths: [last] })).toEqual([needsSkill]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsTrait], stock, age: 10, lifepaths: [last] })).toEqual([needsTrait]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsSettingCount], stock, age: 10, lifepaths: [last] })).toEqual([needsSettingCount]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsQuestion], stock, age: 10, lifepaths: [last] })).toEqual([needsQuestion]);
  });

  it("applies a lifepath-count fulfillment requirement", () => {
    const settingId = 5 as dat.SettingId;
    const requiredLpId = 42 as dat.LifepathId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const prior = makeLifepath({ id: requiredLpId, setting: [settingId, "Home"] });
    const needsTwoOccurrences = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: 2, items: [{ logicType: [0 as dat.RequirementItemTypeId, "lifepath"], lifepath: [requiredLpId, "Prior"] }] }]
    });

    const onlyOne = FilterLifepaths({ rulesetLifepaths: [needsTwoOccurrences], stock, age: 10, lifepaths: [prior, last] });
    expect(onlyOne).toEqual([]);

    const twoOccurrences = FilterLifepaths({ rulesetLifepaths: [needsTwoOccurrences], stock, age: 10, lifepaths: [prior, prior, last] });
    expect(twoOccurrences).toEqual([needsTwoOccurrences]);
  });

  it("applies a setting-count fulfillment requirement", () => {
    const settingId = 5 as dat.SettingId;
    const requiredSettingId = 8 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsSettingCount = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: 2, items: [{ logicType: [0 as dat.RequirementItemTypeId, "setting"], setting: [requiredSettingId, "Elsewhere"] }] }]
    });

    const notEnough = FilterLifepaths({ rulesetLifepaths: [needsSettingCount], stock, age: 10, lifepaths: [last], hasSetting: () => 1 });
    expect(notEnough).toEqual([]);

    const enough = FilterLifepaths({ rulesetLifepaths: [needsSettingCount], stock, age: 10, lifepaths: [last], hasSetting: () => 2 });
    expect(enough).toEqual([needsSettingCount]);
  });

  it("applies a question requirement item via hasQuestionTrue", () => {
    const settingId = 5 as dat.SettingId;
    const questionId = 3 as dat.QuestionId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const needsQuestion = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "question"], question: [questionId, "true"] } as unknown as LifepathRequirementItem] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [needsQuestion], stock, age: 10, lifepaths: [last], hasQuestionTrue: () => false })).toEqual([]);
    expect(FilterLifepaths({ rulesetLifepaths: [needsQuestion], stock, age: 10, lifepaths: [last], hasQuestionTrue: () => true })).toEqual([needsQuestion]);
  });

  it("applies NOT logic across requirement items (true when at least one item is true)", () => {
    // checkRequirementBlock's NOT branch is `!itemResults.every(v => !v)`, which is true
    // whenever at least one item result is true -- equivalent to an OR, not a negation of AND.
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const notBlock = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "NOT"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "gender"], gender: "Female" }] }]
    });

    expect(FilterLifepaths({ rulesetLifepaths: [notBlock], stock, age: 10, lifepaths: [last], gender: "Female" })).toEqual([notBlock]);
    expect(FilterLifepaths({ rulesetLifepaths: [notBlock], stock, age: 10, lifepaths: [last], gender: "Male" })).toEqual([]);
  });

  it("throws for an unidentified requirement item", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const badItem = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [0 as dat.LogicTypeId, "AND"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [99 as dat.RequirementItemTypeId, "unknownKind"] }] }]
    });

    expect(() => FilterLifepaths({ rulesetLifepaths: [badItem], stock, age: 10, lifepaths: [last] })).toThrow();
  });

  it("treats a requirement block with an unrecognised logicType as unsatisfied", () => {
    const settingId = 5 as dat.SettingId;
    const last = makeLifepath({ id: 1 as dat.LifepathId, setting: [settingId, "Home"] });
    const unknownLogicType = makeLifepath({
      id: 2 as dat.LifepathId,
      setting: [settingId, "Home"],
      requirements: [{ logicType: [99 as dat.LogicTypeId, "XOR"], mustFulfill: true, fulfillmentAmount: null, items: [{ logicType: [0 as dat.RequirementItemTypeId, "gender"], gender: "Male" }] }]
    });

    const result = FilterLifepaths({ rulesetLifepaths: [unknownLogicType], stock, age: 10, lifepaths: [last], gender: "Male" });
    expect(result).toEqual([]);
  });
});
