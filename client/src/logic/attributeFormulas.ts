import { Average } from "../utils/Average";


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

export function GetReflexes(perception: AbilityPoints, agility: AbilityPoints, speed: AbilityPoints): AbilityPoints {
  const shades = [perception.shade, agility.shade, speed.shade];
  const roots = [perception.exponent, agility.exponent, speed.exponent];

  if (shades.some(v => v === "G") && shades.some(v => v === "B")) roots[0] += 2;

  const shade = shades.every(v => v === "G") ? "G" : "B";
  const exponent = Math.floor(Average(roots));

  return { shade, exponent };
}

export function GetHealth(will: AbilityPoints, forte: AbilityPoints, stockName: string, hasQuestionTrueByName: (name: string) => boolean): AbilityPoints {
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

  return { shade: shades.every(v => v === "G") ? "G" : "B", exponent: Math.floor(Average(roots)) + bonus };
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

export function GetHesitation(will: AbilityPoints): AbilityPoints {
  return { shade: "B", exponent: 10 - will.exponent };
}

export function GetGreed(
  will: AbilityPoints,
  age: number,
  resourcePoints: Points,
  lifepaths: Lifepath[],
  resources: Record<string, CharacterResource>,
  hasTraitOpenByName: (name: string) => boolean,
  hasQuestionTrueByName: (name: string) => boolean
): AbilityPoints {
  const relationships = Object.values(resources).filter(v => v.type[1] === "Relationship");

  let bonus = 0;
  if (will.exponent <= 4) bonus += 1;
  bonus += Math.floor(resourcePoints.spent / 60);
  bonus += lifepaths.filter(v => v.name && GreedLifepaths.includes(v.name)).length;

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
  if (hasTraitOpenByName("Virtuous")) bonus += 1;

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
  hasQuestionTrueByName: (name: string) => boolean
): AbilityPoints {
  const knowsLament = skills.filter(v => v.name.toLowerCase().includes("lament") && v.isOpen !== "no");

  let bonus = 0;
  if (hasLifepathByName("Protector")) bonus += 1;
  if (hasLifepathByName("Born Etharch")) bonus += 1;
  if (hasLifepathByName("Elder")) bonus += 1;
  if (GriefOrSpiteLifepaths.some(v => hasLifepathByName(v))) bonus += 1;
  if (GriefOrSpiteLifepaths2.some(v => hasLifepathByName(v))) bonus += 1;
  if (GriefOrSpiteLifepaths3.some(v => hasLifepathByName(v))) bonus += 1;
  bonus += knowsLament.length > 0 ? 0 : 1;

  if (hasQuestionTrueByName("TRAGEDY")) bonus += 1;
  if (hasQuestionTrueByName("OUTSIDER")) bonus += 1;

  if (steel.exponent > 5) bonus += (steel.exponent - 5);
  if (perception.exponent > 5) bonus += 1;
  if (age > 1000) bonus += 3;
  else if (age > 750) bonus += 2;
  else if (age > 500) bonus += 1;

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

  return { shade: "B", exponent: bonus };
}

export function GetFaith(hasQuestionTrueByName: (name: string) => boolean): AbilityPoints {
  let bonus = 0;
  if (hasQuestionTrueByName("TRUST")) bonus += 1;
  if (hasQuestionTrueByName("CONSULT")) bonus += 1;
  if (hasQuestionTrueByName("SERVE")) bonus += 1;

  return { shade: "B", exponent: 3 + bonus };
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
  bonus += spiritMarks.length > 0 ? spiritMarks.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 25 ? 2 : 3), 0) : 0;
  bonus += orders.length > 0 ? orders.map(v => v.cost).reduce((a, b) => a + (b === 10 ? 1 : b === 20 ? 2 : b === 25 ? 3 : 4), 0) : 0;
  if (hasQuestionTrueByName("PRAY")) bonus += 1;
  if (hasQuestionTrueByName("PACT")) bonus += 1;

  return { shade: "B", exponent: bonus };
}

export function GetResources(resources: Record<string, CharacterResource>): AbilityPoints {
  let bonus = 0;
  const res = Object.values(resources).filter(v => ["Property", "Reputation", "Affiliation"].includes(v.type[1]));
  if (res.length > 0) { bonus += Math.floor(res.map(v => v.cost).reduce((a, b) => a + b) / 15); }

  return { shade: "B", exponent: bonus };
}

export function GetCircles(will: AbilityPoints, resources: Record<string, CharacterResource>): AbilityPoints {
  let bonus = 0;
  const res = Object.values(resources).filter(v => ["Property", "Relationship"].includes(v.type[1]));
  if (res.length > 0 && res.map(v => v.cost).reduce((a, b) => a + b) >= 50) { bonus += 1; }

  return { shade: "B", exponent: Math.floor(will.exponent / 2) + bonus };
}
