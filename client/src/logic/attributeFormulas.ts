import { Average } from "../utils/Average";
import { Clamp } from "../utils/Clamp";


const GreedLifepaths = ["Trader", "Mask Bearer", "Master of Arches", "Master of Forges", "Master Engraver", "Treasurer", "Quartermaster", "Seneschal", "Prince"];
const GriefOrSpiteLifepaths = ["Lancer", "Lieutenant", "Captain"];
const GriefOrSpiteLifepaths2 = ["Lord Protector", "Soother"];
const GriefOrSpiteLifepaths3 = ["Loremaster", "Adjutant", "Althing"];
const SpiteTraits = ["Slayer", "Exile", "Feral", "Murderous", "Saturnine", "Femme Fatale/Homme Fatal", "Cold", "Bitter"];

export function GetMortalWound(power: AbilityPoints, forte: AbilityPoints): AbilityPoints {
  const shades = [power.shade, forte.shade];
  const roots = [power.exponent, forte.exponent];

  if (shades.some(v => v === "G") && shades.some(v => v === "B")) { roots.push(2); }

  return { shade: shades.every(v => v === "G") ? "G" : "B", exponent: Average(roots) };
}

export function GetReflexes(perception: AbilityPoints, agility: AbilityPoints, speed: AbilityPoints, hasTraitOpenByName: (name: string) => boolean): AbilityPoints {
  const shades = [perception.shade, agility.shade, speed.shade];
  const roots = [perception.exponent, agility.exponent, speed.exponent];

  if (shades.some(v => v === "G") && shades.some(v => v === "B")) roots[0] += 2;

  const shade = shades.every(v => v === "G") ? "G" : "B";
  const average = Average(roots);
  const exponent = (hasTraitOpenByName("Quickened Pulse") ? Math.ceil(average) : Math.floor(average)) + (hasTraitOpenByName("Fast Reflexes") ? 1 : 0);

  return { shade, exponent };
}

export function GetStride(stockStride: number, hasTraitOpenByName: (name: string) => boolean, isMissingLeg: boolean): number {
  // Amoeboid overrides stride entirely, regardless of any other trait.
  if (hasTraitOpenByName("Amoeboid")) return 1;

  let stride = stockStride;
  // Lame blocks any stride-increasing trait (Sprinter), so its own -1 is applied last/unconditionally.
  if (hasTraitOpenByName("Sprinter") && !hasTraitOpenByName("Lame")) stride += 1;
  if (hasTraitOpenByName("Lame")) stride -= 1;
  // Missing Limb: a missing leg (not arm) reduces stride by two.
  if (hasTraitOpenByName("Missing Limb") && isMissingLeg) stride -= 2;

  return stride;
}

export function GetHealth(will: AbilityPoints, forte: AbilityPoints, stockName: string, hasQuestionTrueByName: (name: string) => boolean, hasTraitOpenByName: (name: string) => boolean): AbilityPoints {
  const shades = [will.shade, forte.shade];
  const roots = [will.exponent, forte.exponent];
  if (shades.some(v => v === "G") && shades.some(v => v === "B")) { roots.push(2); }

  let bonus = 0;
  if (hasQuestionTrueByName("FILTH")) bonus -= 1;
  if (hasQuestionTrueByName("SICKLY")) bonus -= 1;
  if (hasQuestionTrueByName("WOUND")) bonus -= 1;
  if (hasQuestionTrueByName("TORTURE") && hasQuestionTrueByName("ENSLAVED")) bonus -= 1;
  if (["Dwarf", "Elf", "Orc"].includes(stockName)) bonus += 1;
  if (hasQuestionTrueByName("ACTIVE")) bonus += 1;
  if (hasQuestionTrueByName("HAPPY")) bonus += 1;
  if (hasTraitOpenByName("Sickly")) bonus -= 1;

  const average = Average(roots);
  const exponent = (hasTraitOpenByName("Hardened") ? Math.ceil(average) : Math.floor(average)) + bonus;

  return { shade: shades.every(v => v === "G") ? "G" : "B", exponent: hasTraitOpenByName("Sickly") ? Clamp(exponent, 0, 5) : exponent };
}

export function GetSteel(will: AbilityPoints, forte: AbilityPoints, hasQuestionTrueByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasQuestionTrueByName("SOLDIER")) bonus += 1;
  if (hasQuestionTrueByName("WOUND") && hasQuestionTrueByName("SOLDIER")) bonus += 1;
  if (hasQuestionTrueByName("WOUND") && !hasQuestionTrueByName("SOLDIER")) bonus -= 1;
  if (hasQuestionTrueByName("KILLER")) bonus += 1;
  if (hasQuestionTrueByName("TORTURED") || hasQuestionTrueByName("ENSLAVED") || hasQuestionTrueByName("BEATEN")) {
    if (will.exponent >= 5) bonus += 1;
    if (will.exponent <= 3) bonus -= 1;
  }
  if (hasQuestionTrueByName("SHELTER")) bonus -= 1;
  if (hasQuestionTrueByName("COMPETITIVE")) bonus += 1;
  if (hasQuestionTrueByName("BIRTH")) bonus += 1;
  if (hasQuestionTrueByName("GIFTED")) bonus += 1;
  if (will.exponent >= 7) bonus += 2;
  else if (will.exponent >= 5) bonus += 1;
  if (forte.exponent >= 6) bonus += 2;

  return { shade: "B", exponent: 3 + bonus };
}

// Only traits that modify hesitation overall/by default are folded into the exponent here.
// Traits that only reduce/increase hesitation for specific situations (pain, fear, surprise,
// wonderment, etc.) are not counted -- those are surfaced as informational text instead, see
// HesitationSituationalTraits below.
export function GetHesitation(will: AbilityPoints, hasTraitOpenByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasTraitOpenByName("Cowardly")) bonus += 1;
  if (hasTraitOpenByName("Slow")) bonus += 1;
  if (hasTraitOpenByName("Hideous!")) bonus += 1;
  if (hasTraitOpenByName("Stoic")) bonus -= 1;
  if (hasTraitOpenByName("Feral")) bonus -= 1;
  if (hasTraitOpenByName("World Weary")) bonus -= 1;
  if (hasTraitOpenByName("Preternaturally Calm") || hasTraitOpenByName("Prenaturally Calm")) bonus -= 2;

  return { shade: "B", exponent: 10 - will.exponent + bonus };
}

// Traits that modify hesitation only in specific situations rather than overall -- not folded into
// GetHesitation's exponent, but worth surfacing to the player as "hesitation is X for purposes of Y".
export const HesitationSituationalTraits: { name: string; note: string; }[] = [
  { name: "Cold Blooded", note: "Reduce hesitation for death, violence, and pain by one. Not reduced for surprise or wonderment." },
  { name: "Cool Headed", note: "Reduce hesitation for surprise and fear (not pain) by one." },
  { name: "Fearless", note: "Reduce hesitation for pain, fear, and the shock of gore or death by three. Not reduced for wonderment or surprise." },
  { name: "Jaded", note: "Reduce hesitation for surprise or shock by three." },
  { name: "Thousand-Yard Stare", note: "Reduce hesitation by three against pain, violence, and intimidation; increase by two against surprise and Wonderment-type spell effects." },
  { name: "Heartless", note: "Reduce hesitation by three for pain, murder, fear, or violence." },
  { name: "Unflinching", note: "Reduce hesitation by four for fear and pain." },
  { name: "Cold Hearted", note: "Reduce hesitation for surprise and fear (including Intimidation) by one. Pain hesitation is not reduced." },
  { name: "Cold Black Blood", note: "Reduce hesitation for pain by two. Not reduced for fear or wonderment." },
  { name: "Life is Death", note: "Reduce hesitation for injury and pain by two." },
  { name: "Pain Life", note: "Reduce hesitation for pain by one." },
  { name: "Skittish", note: "Increase hesitation by one for Steel tests caused by fear and surprise." }
];

export function GetNaturalGreed(
  will: AbilityPoints,
  age: number,
  resourcePoints: Points,
  lifepaths: Lifepath[],
  resources: Record<string, CharacterResource>,
  hasTraitOpenByName: (name: string) => boolean,
  hasQuestionTrueByName: (name: string) => boolean
): number {
  const relationships = Object.values(resources).filter(v => v.type[1] === "Relationship");

  let bonus = 0;
  if (will.exponent <= 4) bonus += 1;
  bonus += Math.floor(resourcePoints.spent / 60);
  bonus += lifepaths.filter(v => v.name !== null && GreedLifepaths.includes(v.name)).length;

  if (hasQuestionTrueByName("COVET")) bonus += 1;
  if (hasQuestionTrueByName("STOLE")) bonus += 1;
  if (hasQuestionTrueByName("STOLEN")) bonus += 1;
  if (hasQuestionTrueByName("MASTERCRAFT")) bonus += 1;
  if (hasQuestionTrueByName("POSSESSION")) bonus += 1;

  if (age > 400) bonus += 2;
  else if (age > 200) bonus += 1;
  bonus += -1 * relationships.filter(v => v.modifiers.includes("Romantic")).length;
  bonus += 1 * relationships.filter(v => v.modifiers.includes("Hateful")).length;
  bonus += 2 * relationships.filter(v => v.modifiers.includes("Immediate family") && v.modifiers.includes("Hateful")).length;
  if (hasTraitOpenByName("Dangerous Obsession")) bonus += 1;
  if (hasTraitOpenByName("Obsessive")) bonus += 1;
  if (hasTraitOpenByName("Virtuous")) bonus -= 1;

  return bonus;
}

export function GetGreed(
  will: AbilityPoints,
  age: number,
  resourcePoints: Points,
  lifepaths: Lifepath[],
  resources: Record<string, CharacterResource>,
  hasTraitOpenByName: (name: string) => boolean,
  hasQuestionTrueByName: (name: string) => boolean,
  avariceGreed: number | undefined
): AbilityPoints {
  const naturalGreed = GetNaturalGreed(will, age, resourcePoints, lifepaths, resources, hasTraitOpenByName, hasQuestionTrueByName);

  // Avarice: the player may raise starting Greed to any exponent higher than it would otherwise be.
  const bonus = hasTraitOpenByName("Avarice") && avariceGreed !== undefined && avariceGreed > naturalGreed ? avariceGreed : naturalGreed;

  return { shade: "B", exponent: bonus };
}

export function GetGriefOrSpite(
  isSpite: boolean,
  perception: AbilityPoints,
  steel: AbilityPoints,
  age: number,
  resources: Record<string, CharacterResource>,
  skills: CharacterSkill[],
  traits: CharacterTrait[],
  hasLifepathByName: (name: string) => number,
  hasQuestionTrueByName: (name: string) => boolean,
  hasTraitOpenByName: (name: string) => boolean,
  mournerGrief: number | undefined
): AbilityPoints {
  const knowsLament = skills.filter(v => v.name.toLowerCase().includes("lament") && v.isOpen !== "no");

  let bonus = 0;
  if (hasLifepathByName("Protector") > 0) bonus += 1;
  if (hasLifepathByName("Born Etharch") > 0) bonus += 1;
  if (hasLifepathByName("Elder") > 0) bonus += 1;
  if (GriefOrSpiteLifepaths.some(v => hasLifepathByName(v) > 0)) bonus += 1;
  if (GriefOrSpiteLifepaths2.some(v => hasLifepathByName(v) > 0)) bonus += 1;
  if (GriefOrSpiteLifepaths3.some(v => hasLifepathByName(v) > 0)) bonus += 1;
  bonus += knowsLament.length > 0 ? 0 : 1;

  if (hasQuestionTrueByName("TRAGEDY")) bonus += 1;
  if (hasQuestionTrueByName("OUTSIDER")) bonus += 1;

  if (steel.exponent > 5) bonus += (steel.exponent - 5);
  if (perception.exponent > 5) bonus += 1;
  if (age > 1000) bonus += 3;
  else if (age > 750) bonus += 2;
  else if (age > 500) bonus += 1;

  if (hasTraitOpenByName("Exile")) bonus += 1;
  if (hasTraitOpenByName("Slayer")) bonus += 1;
  if (hasTraitOpenByName("Unbreakable")) bonus -= 2;

  if (isSpite) {
    if (SpiteTraits.some(v => traits.filter(t => t.name === v && t.isOpen).length > 0)) bonus += 1;
    const bitterReminders = Object.values(resources).filter(v => v.name === "Bitter Reminder");
    bonus += bitterReminders.length > 0 ? Math.floor(bitterReminders.map(v => v.cost).reduce((a, b) => a + b) / 10) : 0;

    if (hasQuestionTrueByName("OUTSIDER")) bonus += 1;
    if (hasQuestionTrueByName("LOVESICK")) bonus += 1;
    if (hasQuestionTrueByName("ABANDON")) bonus += 1;
    if (hasQuestionTrueByName("ABUSED")) bonus += 1;
    if (hasQuestionTrueByName("RESPECT")) bonus -= 1;
    if (hasQuestionTrueByName("LOVE")) bonus -= 1;
  }

  // Mourner: the player may set starting Grief to any value up to exponent 9 (never lower than the
  // naturally computed value).
  if (!isSpite && hasTraitOpenByName("Mourner") && mournerGrief !== undefined && mournerGrief > bonus) bonus = Math.min(mournerGrief, 9);

  return { shade: "B", exponent: bonus };
}

export function GetFaith(hasQuestionTrueByName: (name: string) => boolean, hasTraitOpenByName: (name: string) => boolean): AbilityPoints {
  const shade = hasTraitOpenByName("Chosen One") ? "G" : "B";

  // Visionary Faith is a fixed B3 with no question-driven advancement -- it's instead increased by
  // purchasing a Visionary Cult, a mechanic the burner doesn't otherwise model.
  if (hasTraitOpenByName("Visionary Faith")) return { shade, exponent: 3 };

  let bonus = 0;
  if (hasQuestionTrueByName("TRUST")) bonus += 1;
  if (hasQuestionTrueByName("CONSULT")) bonus += 1;
  if (hasQuestionTrueByName("SERVE")) bonus += 1;

  return { shade, exponent: 3 + bonus };
}

export function GetFaithInDeadGods(hasQuestionTrueByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasQuestionTrueByName("DEADTRUST")) bonus += 1;
  if (hasQuestionTrueByName("DEADCONSULT")) bonus += 1;
  if (hasQuestionTrueByName("DEADSERVE")) bonus += 1;

  return { shade: "B", exponent: 3 + bonus };
}

export function GetHatred(
  perception: AbilityPoints,
  will: AbilityPoints,
  steel: AbilityPoints,
  special: CharacterSpecial,
  hasQuestionTrueByName: (name: string) => boolean
): AbilityPoints {
  let bonus = special.stock.brutalLifeTraits.filter(v => v !== undefined).length;
  if (hasQuestionTrueByName("WOUND")) bonus += 1;
  if (hasQuestionTrueByName("TORTURE")) bonus += 1;
  if (hasQuestionTrueByName("SLAVE")) bonus += 1;
  if (hasQuestionTrueByName("FRATRICIDE")) bonus += 1;
  if (hasQuestionTrueByName("HOBGOBLIN")) bonus += 1;
  if (will.exponent <= 2) bonus += 1;
  if (steel.exponent >= 5) bonus += 1;
  if (perception.exponent >= 6) bonus += 1;

  return { shade: "B", exponent: bonus };
}

export function GetVoidEmbrace(hasQuestionTrueByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasQuestionTrueByName("MASTER")) bonus += 1;
  if (hasQuestionTrueByName("FATE")) bonus += 1;
  if (hasQuestionTrueByName("WELLSPRING")) bonus += 1;

  return { shade: "B", exponent: 3 + bonus };
}

export function GetAncestralTaint(hasSkillOpenByName: (name: string) => boolean, hasTraitOpenByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasTraitOpenByName("Ancestral Taint")) bonus += 1;
  if (hasTraitOpenByName("Spirit Nose")) bonus += 1;
  if (hasTraitOpenByName("Stink of the Ancient")) bonus += 1;
  if (hasSkillOpenByName("Primal Bark")) bonus += 1;
  if (hasSkillOpenByName("Ancestral Jaw")) bonus += 1;
  if (hasSkillOpenByName("Grandfather's Song")) bonus += 1;

  return { shade: "B", exponent: bonus };
}

export function GetCorruption(
  resources: Record<string, CharacterResource>,
  hasTraitOpenByName: (name: string) => boolean,
  hasQuestionTrueByName: (name: string) => boolean
): AbilityPoints {
  const spiritMarks = Object.values(resources).filter(v => v.name === "Spirit Binding — Spirit Mark Levels");
  const orders = Object.values(resources).filter(v => v.name === "Summoning — Affiliated Order Levels");

  let bonus = 0;
  if (hasTraitOpenByName("Gifted")) bonus += 1;
  if (hasTraitOpenByName("Faithful") || hasTraitOpenByName("Faith in Dead Gods")) bonus += 1;
  if (hasTraitOpenByName("Chosen One")) bonus += 1;
  if (hasTraitOpenByName("Corrupted")) bonus += 1;
  bonus += spiritMarks.length > 0 ? spiritMarks.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 25 ? 2 : 3), 0) : 0;
  bonus += orders.length > 0 ? orders.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 20 ? 2 : b === 25 ? 3 : 4), 0) : 0;
  if (hasQuestionTrueByName("PRAY")) bonus += 1;
  if (hasQuestionTrueByName("PACT")) bonus += 1;

  return { shade: "B", exponent: bonus };
}

export function GetResources(
  resources: Record<string, CharacterResource>, hasTraitOpenByName: (name: string) => boolean,
  darlingOfCourtResource: string | undefined, lordOfAgesResource: string | undefined
): AbilityPoints {
  let bonus = 0;
  const res = Object.entries(resources).filter(([, v]) => ["Property", "Reputation", "Affiliation"].includes(v.type[1]));
  // Darling of the Court: +1D to a chosen owned Reputation resource's cost. Lord of Ages: +1D to a
  // chosen owned Reputation or Affiliation resource's cost.
  const total = res.reduce((a, [key, v]) => {
    const darlingBonus = hasTraitOpenByName("Darling of the Court") && key === darlingOfCourtResource ? 1 : 0;
    const lordBonus = hasTraitOpenByName("Lord of Ages") && key === lordOfAgesResource ? 1 : 0;
    return a + v.cost + darlingBonus + lordBonus;
  }, 0);
  if (res.length > 0) { bonus += Math.floor(total / 15); }

  return { shade: "B", exponent: bonus };
}

export function GetCircles(
  will: AbilityPoints, resources: Record<string, CharacterResource>, hasTraitOpenByName: (name: string) => boolean, earToGroundResource: string | undefined
): AbilityPoints {
  let bonus = 0;
  const res = Object.values(resources).filter(v => ["Property", "Relationship"].includes(v.type[1]));
  if (res.length > 0 && res.map(v => v.cost).reduce((a, b) => a + b) >= 50) { bonus += 1; }
  if (hasTraitOpenByName("Prince of the Blood")) bonus += 1;
  // Ear to the Ground: +1 Circles if a chosen owned Relationship is with an important/powerful captain.
  if (hasTraitOpenByName("Ear to the Ground") && earToGroundResource !== undefined && earToGroundResource in resources) bonus += 1;

  return { shade: "B", exponent: Math.floor(will.exponent / 2) + bonus };
}
