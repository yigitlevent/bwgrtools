import { describe, expect, it } from "vitest";

import {
  GetAncestralTaint,
  GetCircles,
  GetCorruption,
  GetFaith,
  GetFaithInDeadGods,
  GetGreed,
  GetGriefOrSpite,
  GetHatred,
  GetHealth,
  GetHesitation,
  GetMortalWound,
  GetNaturalGreed,
  GetReflexes,
  GetResources,
  GetSteel,
  GetStride,
  GetVoidEmbrace
} from "../../../client/src/logic/attributeFormulas";


function Ability(exponent: number, shade: Shade = "B"): AbilityPoints {
  return { shade, exponent };
}

const NoTrait = (): boolean => false;
const NoQuestion = (): boolean => false;
const NoLifepath = (): number => 0;

function ResourceOf(overrides: Partial<CharacterResource>): CharacterResource {
  return {
    id: 1 as unknown as dat.ResourceId,
    name: "Resource",
    type: [1 as unknown as dat.ResourceTypeId, "Property"],
    modifiers: [],
    cost: 10,
    description: "",
    ...overrides
  };
}

describe("GetMortalWound", () => {
  it("averages power and forte exponents when shades match", () => {
    expect(GetMortalWound(Ability(4, "B"), Ability(6, "B"))).toEqual({ shade: "B", exponent: 5 });
  });

  it("stays Grey only when both shades are Grey", () => {
    expect(GetMortalWound(Ability(4, "G"), Ability(6, "G"))).toEqual({ shade: "G", exponent: 5 });
  });

  it("adds a +2 root and forces Black when shades are mixed", () => {
    // roots [4, 6, 2] averaged = 4
    expect(GetMortalWound(Ability(4, "G"), Ability(6, "B"))).toEqual({ shade: "B", exponent: 4 });
  });
});

describe("GetReflexes", () => {
  it("floors the average by default", () => {
    // roots [3, 4, 4] -> average 3.67 -> floor 3
    expect(GetReflexes(Ability(3), Ability(4), Ability(4), NoTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("adds +2 to perception root when shades are mixed, forcing Black", () => {
    // roots [3+2, 4, 4] = [5, 4, 4] -> average 4.33 -> floor 4
    expect(GetReflexes(Ability(3, "G"), Ability(4, "B"), Ability(4, "B"), NoTrait)).toEqual({ shade: "B", exponent: 4 });
  });

  it("ceils instead of floors with Quickened Pulse", () => {
    const hasTrait = (name: string): boolean => name === "Quickened Pulse";
    // roots [3, 4, 4] -> average 3.67 -> ceil 4
    expect(GetReflexes(Ability(3), Ability(4), Ability(4), hasTrait)).toEqual({ shade: "B", exponent: 4 });
  });

  it("adds +1 with Fast Reflexes on top of the floored/ceiled average", () => {
    const hasTrait = (name: string): boolean => name === "Fast Reflexes";
    expect(GetReflexes(Ability(3), Ability(4), Ability(4), hasTrait)).toEqual({ shade: "B", exponent: 4 });
  });

  it("stays Grey when all three shades are Grey", () => {
    expect(GetReflexes(Ability(3, "G"), Ability(4, "G"), Ability(4, "G"), NoTrait)).toEqual({ shade: "G", exponent: 3 });
  });
});

describe("GetStride", () => {
  it("returns the stock stride with no modifying traits", () => {
    expect(GetStride(6, NoTrait, false)).toBe(6);
  });

  it("Amoeboid overrides stride to 1 regardless of other traits", () => {
    const hasTrait = (name: string): boolean => name === "Amoeboid" || name === "Sprinter";
    expect(GetStride(6, hasTrait, false)).toBe(1);
  });

  it("Sprinter adds 1 when Lame is not present", () => {
    const hasTrait = (name: string): boolean => name === "Sprinter";
    expect(GetStride(6, hasTrait, false)).toBe(7);
  });

  it("Lame subtracts 1 and blocks Sprinter's bonus", () => {
    const hasTrait = (name: string): boolean => name === "Sprinter" || name === "Lame";
    expect(GetStride(6, hasTrait, false)).toBe(5);
  });

  it("Missing Limb reduces stride by 2 only when the missing limb is a leg", () => {
    const hasTrait = (name: string): boolean => name === "Missing Limb";
    expect(GetStride(6, hasTrait, true)).toBe(4);
    expect(GetStride(6, hasTrait, false)).toBe(6);
  });
});

describe("GetHealth", () => {
  it("floors the average of will and forte with no modifiers", () => {
    // roots [3, 4] -> average 3.5 -> floor 3
    expect(GetHealth(Ability(3), Ability(4), "Human", NoQuestion, NoTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("ceils instead of floors with Hardened", () => {
    const hasTrait = (name: string): boolean => name === "Hardened";
    expect(GetHealth(Ability(3), Ability(4), "Human", NoQuestion, hasTrait)).toEqual({ shade: "B", exponent: 4 });
  });

  it("gives +1 bonus for Dwarf/Elf/Orc stock", () => {
    expect(GetHealth(Ability(4), Ability(4), "Dwarf", NoQuestion, NoTrait)).toEqual({ shade: "B", exponent: 5 });
  });

  it("applies question-driven penalties", () => {
    const hasQuestion = (name: string): boolean => name === "FILTH" || name === "SICKLY";
    expect(GetHealth(Ability(4), Ability(4), "Human", hasQuestion, NoTrait)).toEqual({ shade: "B", exponent: 2 });
  });

  it("TORTURE and ENSLAVED together apply only a single -1", () => {
    const hasQuestion = (name: string): boolean => name === "TORTURE" || name === "ENSLAVED";
    expect(GetHealth(Ability(4), Ability(4), "Human", hasQuestion, NoTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("Sickly clamps the exponent to [0, 5]", () => {
    const hasTrait = (name: string): boolean => name === "Sickly";
    expect(GetHealth(Ability(8), Ability(8), "Human", NoQuestion, hasTrait)).toEqual({ shade: "B", exponent: 5 });
  });

  it("applies WOUND, ACTIVE, and HAPPY question bonuses independently", () => {
    const wound = (name: string): boolean => name === "WOUND";
    const active = (name: string): boolean => name === "ACTIVE";
    const happy = (name: string): boolean => name === "HAPPY";
    expect(GetHealth(Ability(4), Ability(4), "Human", wound, NoTrait).exponent).toBe(3);
    expect(GetHealth(Ability(4), Ability(4), "Human", active, NoTrait).exponent).toBe(5);
    expect(GetHealth(Ability(4), Ability(4), "Human", happy, NoTrait).exponent).toBe(5);
  });

  it("adds a +2 root and forces Black shade when will/forte shades are mixed", () => {
    // roots [4, 4, 2] averaged (floor) = 3
    expect(GetHealth(Ability(4, "G"), Ability(4, "B"), "Human", NoQuestion, NoTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("stays Grey when both will and forte shades are Grey", () => {
    expect(GetHealth(Ability(4, "G"), Ability(4, "G"), "Human", NoQuestion, NoTrait)).toEqual({ shade: "G", exponent: 4 });
  });
});

describe("GetSteel", () => {
  it("starts at exponent 3 with no bonuses", () => {
    expect(GetSteel(Ability(3), Ability(3), NoQuestion)).toEqual({ shade: "B", exponent: 3 });
  });

  it("WOUND without SOLDIER subtracts 1; WOUND with SOLDIER adds 1 (SOLDIER) + 1 (WOUND+SOLDIER)", () => {
    const withSoldier = (name: string): boolean => name === "WOUND" || name === "SOLDIER";
    const withoutSoldier = (name: string): boolean => name === "WOUND";
    expect(GetSteel(Ability(3), Ability(3), withSoldier)).toEqual({ shade: "B", exponent: 5 });
    expect(GetSteel(Ability(3), Ability(3), withoutSoldier)).toEqual({ shade: "B", exponent: 2 });
  });

  it("high will (>=7) grants +2, mid will (>=5) grants +1", () => {
    expect(GetSteel(Ability(7), Ability(3), NoQuestion)).toEqual({ shade: "B", exponent: 5 });
    expect(GetSteel(Ability(5), Ability(3), NoQuestion)).toEqual({ shade: "B", exponent: 4 });
  });

  it("high forte (>=6) grants +2", () => {
    expect(GetSteel(Ability(3), Ability(6), NoQuestion)).toEqual({ shade: "B", exponent: 5 });
  });

  it("trauma questions swing on will exponent threshold", () => {
    const hasQuestion = (name: string): boolean => name === "TORTURED";
    expect(GetSteel(Ability(5), Ability(3), hasQuestion)).toEqual({ shade: "B", exponent: 5 });
    expect(GetSteel(Ability(3), Ability(3), hasQuestion)).toEqual({ shade: "B", exponent: 2 });
  });

  it("applies KILLER, SHELTER, COMPETITIVE, BIRTH, and GIFTED question bonuses independently", () => {
    const killer = (name: string): boolean => name === "KILLER";
    const shelter = (name: string): boolean => name === "SHELTER";
    const competitive = (name: string): boolean => name === "COMPETITIVE";
    const birth = (name: string): boolean => name === "BIRTH";
    const gifted = (name: string): boolean => name === "GIFTED";
    expect(GetSteel(Ability(3), Ability(3), killer).exponent).toBe(4);
    expect(GetSteel(Ability(3), Ability(3), shelter).exponent).toBe(2);
    expect(GetSteel(Ability(3), Ability(3), competitive).exponent).toBe(4);
    expect(GetSteel(Ability(3), Ability(3), birth).exponent).toBe(4);
    expect(GetSteel(Ability(3), Ability(3), gifted).exponent).toBe(4);
  });
});

describe("GetHesitation", () => {
  it("is 10 minus will exponent with no traits", () => {
    expect(GetHesitation(Ability(4), NoTrait)).toEqual({ shade: "B", exponent: 6 });
  });

  it("Cowardly, Slow, and Hideous! each add 1", () => {
    const hasTrait = (name: string): boolean => ["Cowardly", "Slow", "Hideous!"].includes(name);
    expect(GetHesitation(Ability(4), hasTrait)).toEqual({ shade: "B", exponent: 9 });
  });

  it("Preternaturally Calm subtracts 2", () => {
    const hasTrait = (name: string): boolean => name === "Preternaturally Calm";
    expect(GetHesitation(Ability(4), hasTrait)).toEqual({ shade: "B", exponent: 4 });
  });

  it("Stoic, Feral, and World Weary each subtract 1", () => {
    const stoic = (name: string): boolean => name === "Stoic";
    const feral = (name: string): boolean => name === "Feral";
    const worldWeary = (name: string): boolean => name === "World Weary";
    expect(GetHesitation(Ability(4), stoic).exponent).toBe(5);
    expect(GetHesitation(Ability(4), feral).exponent).toBe(5);
    expect(GetHesitation(Ability(4), worldWeary).exponent).toBe(5);
  });

  it("Prenaturally Calm (alternate spelling) also subtracts 2", () => {
    const hasTrait = (name: string): boolean => name === "Prenaturally Calm";
    expect(GetHesitation(Ability(4), hasTrait)).toEqual({ shade: "B", exponent: 4 });
  });
});

describe("GetNaturalGreed", () => {
  const points = (spent: number): Points => ({ total: spent, spent, remaining: 0 });

  it("adds 1 when will exponent is <=4", () => {
    expect(GetNaturalGreed(Ability(4), 20, points(0), [], {}, NoTrait, NoQuestion)).toBe(1);
  });

  it("adds one point of bonus per 60 resource points spent", () => {
    expect(GetNaturalGreed(Ability(6), 20, points(120), [], {}, NoTrait, NoQuestion)).toBe(2);
  });

  it("counts greed-associated lifepaths by name", () => {
    const lifepaths = [{ name: "Trader" } as Lifepath, { name: "Prince" } as Lifepath];
    expect(GetNaturalGreed(Ability(6), 20, points(0), lifepaths, {}, NoTrait, NoQuestion)).toBe(2);
  });

  it("adds age-based bonuses at the 200 and 400 thresholds", () => {
    expect(GetNaturalGreed(Ability(6), 250, points(0), [], {}, NoTrait, NoQuestion)).toBe(1);
    expect(GetNaturalGreed(Ability(6), 500, points(0), [], {}, NoTrait, NoQuestion)).toBe(2);
  });

  it("applies relationship-resource modifiers", () => {
    const resources = {
      romantic: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Relationship"], modifiers: ["Romantic"] }),
      hatefulFamily: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Relationship"], modifiers: ["Hateful", "Immediate family"] })
    };
    // -1 (romantic) + 1 (hateful) + 2 (hateful immediate family) = 2
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], resources, NoTrait, NoQuestion)).toBe(2);
  });

  it("Virtuous subtracts 1 while Obsessive/Dangerous Obsession add 1 each", () => {
    const hasTrait = (name: string): boolean => ["Virtuous", "Obsessive", "Dangerous Obsession"].includes(name);
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, hasTrait, NoQuestion)).toBe(1);
  });

  it("applies COVET, STOLE, STOLEN, MASTERCRAFT, and POSSESSION question bonuses independently", () => {
    const covet = (name: string): boolean => name === "COVET";
    const stole = (name: string): boolean => name === "STOLE";
    const stolen = (name: string): boolean => name === "STOLEN";
    const mastercraft = (name: string): boolean => name === "MASTERCRAFT";
    const possession = (name: string): boolean => name === "POSSESSION";
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, NoTrait, covet)).toBe(1);
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, NoTrait, stole)).toBe(1);
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, NoTrait, stolen)).toBe(1);
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, NoTrait, mastercraft)).toBe(1);
    expect(GetNaturalGreed(Ability(6), 20, points(0), [], {}, NoTrait, possession)).toBe(1);
  });
});

describe("GetGreed", () => {
  const points = (spent: number): Points => ({ total: spent, spent, remaining: 0 });

  it("uses the natural value when Avarice is not open", () => {
    expect(GetGreed(Ability(6), 20, points(0), [], {}, NoTrait, NoQuestion, 9)).toEqual({ shade: "B", exponent: 0 });
  });

  it("uses avariceGreed only when Avarice is open and it exceeds the natural value", () => {
    const hasTrait = (name: string): boolean => name === "Avarice";
    expect(GetGreed(Ability(6), 20, points(0), [], {}, hasTrait, NoQuestion, 5)).toEqual({ shade: "B", exponent: 5 });
  });

  it("ignores avariceGreed if it does not exceed the natural value", () => {
    const hasTrait = (name: string): boolean => name === "Avarice";
    expect(GetGreed(Ability(4), 20, points(0), [], {}, hasTrait, NoQuestion, 0)).toEqual({ shade: "B", exponent: 1 });
  });
});

describe("GetGriefOrSpite", () => {
  it("adds 1 when the character knows no Lament skill", () => {
    const result = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    expect(result).toEqual({ shade: "B", exponent: 1 });
  });

  it("does not add the no-Lament bonus when an open Lament skill is known", () => {
    const skills: CharacterSkill[] = [{ id: 1 as unknown as dat.SkillId, name: "Lament of the Fallen", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 0 } }];
    const result = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, skills, [], NoLifepath, NoQuestion, NoTrait, undefined);
    expect(result).toEqual({ shade: "B", exponent: 0 });
  });

  it("scales bonus with steel above 5", () => {
    const result = GetGriefOrSpite(false, Ability(3), Ability(8), 20, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    // no-lament(1) + steel(8-5=3) = 4
    expect(result).toEqual({ shade: "B", exponent: 4 });
  });

  it("applies age-based bonuses above the 500/750/1000 thresholds", () => {
    const at501 = GetGriefOrSpite(false, Ability(3), Ability(3), 501, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    expect(at501.exponent).toBe(1 + 1);

    const at751 = GetGriefOrSpite(false, Ability(3), Ability(3), 751, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    expect(at751.exponent).toBe(1 + 2);

    const at1001 = GetGriefOrSpite(false, Ability(3), Ability(3), 1001, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    expect(at1001.exponent).toBe(1 + 3);
  });

  it("Unbreakable subtracts 2", () => {
    const hasTrait = (name: string): boolean => name === "Unbreakable";
    const result = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, hasTrait, undefined);
    expect(result).toEqual({ shade: "B", exponent: 1 - 2 });
  });

  it("adds 1 each for the Protector, Born Etharch, and Elder lifepaths", () => {
    const hasProtector = (name: string): number => name === "Protector" ? 1 : 0;
    const hasBornEtharch = (name: string): number => name === "Born Etharch" ? 1 : 0;
    const hasElder = (name: string): number => name === "Elder" ? 1 : 0;
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasProtector, NoQuestion, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasBornEtharch, NoQuestion, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasElder, NoQuestion, NoTrait, undefined).exponent).toBe(2);
  });

  it("adds 1 for having any lifepath in each of the three named Grief/Spite lifepath lists", () => {
    const hasLancer = (name: string): number => name === "Lancer" ? 1 : 0;
    const hasLordProtector = (name: string): number => name === "Lord Protector" ? 1 : 0;
    const hasLoremaster = (name: string): number => name === "Loremaster" ? 1 : 0;
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasLancer, NoQuestion, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasLordProtector, NoQuestion, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], hasLoremaster, NoQuestion, NoTrait, undefined).exponent).toBe(2);
  });

  it("TRAGEDY adds 1 and perception above 5 adds 1", () => {
    const hasQuestion = (name: string): boolean => name === "TRAGEDY";
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, hasQuestion, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(6), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined).exponent).toBe(2);
  });

  it("Exile and Slayer traits each add 1", () => {
    const exile = (name: string): boolean => name === "Exile";
    const slayer = (name: string): boolean => name === "Slayer";
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, exile, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, slayer, undefined).exponent).toBe(2);
  });

  it("applies each spite-only question modifier independently", () => {
    const lovesick = (name: string): boolean => name === "LOVESICK";
    const abandon = (name: string): boolean => name === "ABANDON";
    const abused = (name: string): boolean => name === "ABUSED";
    const respect = (name: string): boolean => name === "RESPECT";
    const love = (name: string): boolean => name === "LOVE";
    expect(GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, lovesick, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, abandon, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, abused, NoTrait, undefined).exponent).toBe(2);
    expect(GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, respect, NoTrait, undefined).exponent).toBe(0);
    expect(GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, love, NoTrait, undefined).exponent).toBe(0);
  });

  it("applies spite-only bonuses (traits, bitter reminders, questions) only when isSpite", () => {
    const traits: CharacterTrait[] = [{ id: 1 as unknown as dat.TraitId, name: "Slayer", type: "General", isOpen: true }];
    const resources = { br: ResourceOf({ name: "Bitter Reminder", cost: 20 }) };
    const hasQuestion = (name: string): boolean => name === "OUTSIDER";

    const spiteResult = GetGriefOrSpite(true, Ability(3), Ability(3), 20, resources, [], traits, NoLifepath, hasQuestion, NoTrait, undefined);
    // no-lament(1) + slayer trait(1) + bitter reminder floor(20/10)=2 + outsider(1, spite-only) = 5
    // note: OUTSIDER is also checked outside the isSpite block (+1), so total spite-only OUTSIDER effect is +2
    expect(spiteResult.exponent).toBe(1 + 1 + 2 + 1 + 1);

    const nonSpiteResult = GetGriefOrSpite(false, Ability(3), Ability(3), 20, resources, [], traits, NoLifepath, hasQuestion, NoTrait, undefined);
    // no-lament(1) + outsider(1, non-spite-block) = 2; trait/resource/spite-only-outsider bonuses don't apply
    expect(nonSpiteResult.exponent).toBe(1 + 1);
  });

  it("sums the cost of multiple Bitter Reminder resources", () => {
    const resources = {
      br1: ResourceOf({ name: "Bitter Reminder", cost: 20 }),
      br2: ResourceOf({ name: "Bitter Reminder", cost: 15 })
    };
    const result = GetGriefOrSpite(true, Ability(3), Ability(3), 20, resources, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    // no-lament(1) + floor((20+15)/10)=3 = 4
    expect(result.exponent).toBe(1 + 3);
  });

  it("adds no Bitter Reminder bonus for Spite when the character has none", () => {
    const withoutReminders = GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, NoTrait, undefined);
    // no-lament(1) only -- no Bitter Reminder resources means the length-check short-circuits to +0
    expect(withoutReminders.exponent).toBe(1);
  });

  it("Mourner raises Grief up to mournerGrief (capped at 9) but never lowers it", () => {
    const hasTrait = (name: string): boolean => name === "Mourner";
    const raised = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, hasTrait, 9);
    expect(raised.exponent).toBe(9);

    const cappedAt9 = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, hasTrait, 15);
    expect(cappedAt9.exponent).toBe(9);

    const notLowered = GetGriefOrSpite(false, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, hasTrait, 0);
    expect(notLowered.exponent).toBe(1);
  });

  it("Mourner override does not apply when isSpite is true", () => {
    const hasTrait = (name: string): boolean => name === "Mourner";
    const result = GetGriefOrSpite(true, Ability(3), Ability(3), 20, {}, [], [], NoLifepath, NoQuestion, hasTrait, 9);
    expect(result.exponent).toBe(1);
  });
});

describe("GetFaith", () => {
  it("is B3 by default", () => {
    expect(GetFaith(NoQuestion, NoTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("is Grey when Chosen One is open", () => {
    const hasTrait = (name: string): boolean => name === "Chosen One";
    expect(GetFaith(NoQuestion, hasTrait)).toEqual({ shade: "G", exponent: 3 });
  });

  it("Visionary Faith is fixed at 3 regardless of questions", () => {
    const hasTrait = (name: string): boolean => name === "Visionary Faith";
    const hasQuestion = (name: string): boolean => name === "TRUST";
    expect(GetFaith(hasQuestion, hasTrait)).toEqual({ shade: "B", exponent: 3 });
  });

  it("accumulates question bonuses", () => {
    const hasQuestion = (name: string): boolean => ["TRUST", "CONSULT", "SERVE"].includes(name);
    expect(GetFaith(hasQuestion, NoTrait)).toEqual({ shade: "B", exponent: 6 });
  });
});

describe("GetFaithInDeadGods", () => {
  it("accumulates dead-god question bonuses on top of base 3", () => {
    const hasQuestion = (name: string): boolean => name === "DEADTRUST";
    expect(GetFaithInDeadGods(hasQuestion)).toEqual({ shade: "B", exponent: 4 });
  });

  it("DEADCONSULT and DEADSERVE each add 1 independently", () => {
    const deadConsult = (name: string): boolean => name === "DEADCONSULT";
    const deadServe = (name: string): boolean => name === "DEADSERVE";
    expect(GetFaithInDeadGods(deadConsult).exponent).toBe(4);
    expect(GetFaithInDeadGods(deadServe).exponent).toBe(4);
  });
});

describe("GetVoidEmbrace", () => {
  it("accumulates question bonuses on top of base 3", () => {
    const hasQuestion = (name: string): boolean => name === "MASTER" || name === "FATE";
    expect(GetVoidEmbrace(hasQuestion)).toEqual({ shade: "B", exponent: 5 });
  });

  it("WELLSPRING adds 1 independently", () => {
    const wellspring = (name: string): boolean => name === "WELLSPRING";
    expect(GetVoidEmbrace(wellspring).exponent).toBe(4);
  });
});

describe("GetHatred", () => {
  const special = (brutalCount: number): CharacterSpecial => ({
    stock: { brutalLifeTraits: Array<[dat.TraitId, string]>(brutalCount).fill([1 as unknown as dat.TraitId, "x"]), huntingGround: undefined },
    companionLifepath: {},
    variableAge: {},
    companionSkills: {},
    chosenSubskills: {},
    chosenResourceType: {},
    avariceGreed: undefined,
    crippledStat: undefined,
    frailStat: undefined,
    missingLimb: undefined,
    childProdigyStat: undefined,
    childProdigyShiftedSkill: undefined,
    darlingOfCourtResource: undefined,
    earToGroundResource: undefined,
    feyBloodTrait: undefined,
    lessonOfOneRelationship: undefined,
    lordOfAgesResource: undefined,
    mournerGrief: undefined,
    servantOfCitadelQualifies: false,
    swornToProtectQualifies: false,
    taintedLegacyTrait: undefined
  });

  it("counts brutal life traits as bonus", () => {
    expect(GetHatred(Ability(4), Ability(4), Ability(4), special(2), NoQuestion)).toEqual({ shade: "B", exponent: 2 });
  });

  it("adds bonuses for low will, high steel, high perception", () => {
    const result = GetHatred(Ability(7), Ability(1), Ability(6), special(0), NoQuestion);
    expect(result).toEqual({ shade: "B", exponent: 3 });
  });

  it("adds question-driven bonuses", () => {
    const hasQuestion = (name: string): boolean => ["WOUND", "TORTURE"].includes(name);
    expect(GetHatred(Ability(4), Ability(4), Ability(4), special(0), hasQuestion)).toEqual({ shade: "B", exponent: 2 });
  });

  it("SLAVE, FRATRICIDE, and HOBGOBLIN each add 1 independently", () => {
    const slave = (name: string): boolean => name === "SLAVE";
    const fratricide = (name: string): boolean => name === "FRATRICIDE";
    const hobgoblin = (name: string): boolean => name === "HOBGOBLIN";
    expect(GetHatred(Ability(4), Ability(4), Ability(4), special(0), slave).exponent).toBe(1);
    expect(GetHatred(Ability(4), Ability(4), Ability(4), special(0), fratricide).exponent).toBe(1);
    expect(GetHatred(Ability(4), Ability(4), Ability(4), special(0), hobgoblin).exponent).toBe(1);
  });
});

describe("GetAncestralTaint", () => {
  it("accumulates trait and skill bonuses", () => {
    const hasTrait = (name: string): boolean => name === "Ancestral Taint";
    const hasSkill = (name: string): boolean => name === "Primal Bark";
    expect(GetAncestralTaint(hasSkill, hasTrait)).toEqual({ shade: "B", exponent: 2 });
  });

  it("is 0 with no matching traits/skills", () => {
    expect(GetAncestralTaint(NoTrait, NoTrait)).toEqual({ shade: "B", exponent: 0 });
  });

  it("Spirit Nose and Stink of the Ancient traits, and Ancestral Jaw/Grandfather's Song skills, each add 1", () => {
    const spiritNose = (name: string): boolean => name === "Spirit Nose";
    const stinkOfAncient = (name: string): boolean => name === "Stink of the Ancient";
    const ancestralJaw = (name: string): boolean => name === "Ancestral Jaw";
    const grandfathersSong = (name: string): boolean => name === "Grandfather's Song";
    expect(GetAncestralTaint(NoTrait, spiritNose).exponent).toBe(1);
    expect(GetAncestralTaint(NoTrait, stinkOfAncient).exponent).toBe(1);
    expect(GetAncestralTaint(ancestralJaw, NoTrait).exponent).toBe(1);
    expect(GetAncestralTaint(grandfathersSong, NoTrait).exponent).toBe(1);
  });
});

describe("GetCorruption", () => {
  it("accumulates flat trait/question bonuses", () => {
    const hasTrait = (name: string): boolean => name === "Gifted" || name === "Corrupted";
    const hasQuestion = (name: string): boolean => name === "PRAY" || name === "PACT";
    expect(GetCorruption({}, hasTrait, hasQuestion)).toEqual({ shade: "B", exponent: 4 });
  });

  it("adds the Faithful bonus only once even though Faith in Dead Gods also grants it", () => {
    const faithful = (name: string): boolean => name === "Faithful";
    const faithInDeadGods = (name: string): boolean => name === "Faith in Dead Gods";
    expect(GetCorruption({}, faithful, NoQuestion).exponent).toBe(1);
    expect(GetCorruption({}, faithInDeadGods, NoQuestion).exponent).toBe(1);
  });

  it("Chosen One adds 1 independently", () => {
    const chosenOne = (name: string): boolean => name === "Chosen One";
    expect(GetCorruption({}, chosenOne, NoQuestion).exponent).toBe(1);
  });

  it("scales Spirit Binding resource bonus by cost tier (10/25/other)", () => {
    const resources = {
      a: ResourceOf({ name: "Spirit Binding — Spirit Mark Levels", cost: 10 }),
      b: ResourceOf({ name: "Spirit Binding — Spirit Mark Levels", cost: 25 }),
      c: ResourceOf({ name: "Spirit Binding — Spirit Mark Levels", cost: 999 })
    };
    // 1 + 2 + 3 = 6
    expect(GetCorruption(resources, NoTrait, NoQuestion)).toEqual({ shade: "B", exponent: 6 });
  });

  it("scales Affiliated Order resource bonus by cost tier (10/20/25/other)", () => {
    const resources = {
      a: ResourceOf({ name: "Summoning — Affiliated Order Levels", cost: 10 }),
      b: ResourceOf({ name: "Summoning — Affiliated Order Levels", cost: 20 }),
      c: ResourceOf({ name: "Summoning — Affiliated Order Levels", cost: 25 }),
      d: ResourceOf({ name: "Summoning — Affiliated Order Levels", cost: 999 })
    };
    // 1 + 2 + 3 + 4 = 10
    expect(GetCorruption(resources, NoTrait, NoQuestion)).toEqual({ shade: "B", exponent: 10 });
  });
});

describe("GetResources", () => {
  it("is 0 with no relevant resources", () => {
    expect(GetResources({}, NoTrait, undefined, undefined)).toEqual({ shade: "B", exponent: 0 });
  });

  it("adds floor(totalCost/15) across Property/Reputation/Affiliation resources", () => {
    const resources = {
      a: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Property"], cost: 20 }),
      b: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Reputation"], cost: 20 })
    };
    expect(GetResources(resources, NoTrait, undefined, undefined)).toEqual({ shade: "B", exponent: 2 });
  });

  it("ignores resource types outside Property/Reputation/Affiliation", () => {
    const resources = { a: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Relationship"], cost: 999 }) };
    expect(GetResources(resources, NoTrait, undefined, undefined)).toEqual({ shade: "B", exponent: 0 });
  });

  it("Darling of the Court adds +1 to the chosen resource's cost before totaling", () => {
    const hasTrait = (name: string): boolean => name === "Darling of the Court";
    const resources = { chosen: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Reputation"], cost: 14 }) };
    expect(GetResources(resources, hasTrait, "chosen", undefined)).toEqual({ shade: "B", exponent: 1 });
  });

  it("Lord of Ages adds +1 to the chosen resource's cost before totaling", () => {
    const hasTrait = (name: string): boolean => name === "Lord of Ages";
    const resources = { chosen: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Affiliation"], cost: 14 }) };
    expect(GetResources(resources, hasTrait, undefined, "chosen")).toEqual({ shade: "B", exponent: 1 });
  });
});

describe("GetCircles", () => {
  it("is floor(will/2) with no resources or traits", () => {
    expect(GetCircles(Ability(5), {}, NoTrait, undefined)).toEqual({ shade: "B", exponent: 2 });
  });

  it("adds 1 when combined Property/Relationship resource cost reaches 50", () => {
    const resources = { a: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Property"], cost: 50 }) };
    expect(GetCircles(Ability(4), resources, NoTrait, undefined)).toEqual({ shade: "B", exponent: 3 });
  });

  it("does not add the resource bonus below the 50 threshold", () => {
    const resources = { a: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Property"], cost: 49 }) };
    expect(GetCircles(Ability(4), resources, NoTrait, undefined)).toEqual({ shade: "B", exponent: 2 });
  });

  it("sums multiple Property/Relationship resources toward the 50 threshold", () => {
    const resources = {
      a: ResourceOf({ type: [1 as unknown as dat.ResourceTypeId, "Property"], cost: 30 }),
      b: ResourceOf({ type: [2 as unknown as dat.ResourceTypeId, "Relationship"], cost: 25 })
    };
    expect(GetCircles(Ability(4), resources, NoTrait, undefined)).toEqual({ shade: "B", exponent: 3 });
  });

  it("Prince of the Blood adds 1", () => {
    const hasTrait = (name: string): boolean => name === "Prince of the Blood";
    expect(GetCircles(Ability(4), {}, hasTrait, undefined)).toEqual({ shade: "B", exponent: 3 });
  });

  it("Ear to the Ground adds 1 only when the chosen resource exists in the record", () => {
    const hasTrait = (name: string): boolean => name === "Ear to the Ground";
    const resources = { chosen: ResourceOf({}) };
    expect(GetCircles(Ability(4), resources, hasTrait, "chosen")).toEqual({ shade: "B", exponent: 3 });
    expect(GetCircles(Ability(4), resources, hasTrait, "missing")).toEqual({ shade: "B", exponent: 2 });
  });
});
