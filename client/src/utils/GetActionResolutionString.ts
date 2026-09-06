export function GetActionResolutionString<T>(item: ActionResolution<T>): string {
  const parts = [];

  if (item.type[1] === "Skill") parts.push("Skill");
  else {
    if (item.type[1] === "Ob") {
      if (item.obstacle) parts.push("Ob ");
      else parts.push("Ob=");
    }
    else if (item.type[1] === "½") parts.push("½ ");
    else if (item.type[1] === "Vs") parts.push("Vs ");
    else if (item.type[1] === "+Vs") parts.push("+Vs ");
    else if (item.type[1] === "Vs+") parts.push("Vs+ ");
    else if (item.type[1] === "Std") parts.push("Std ");
  }

  // Prefix
  if (item.ability) parts.unshift(`${item.ability[1]} `);
  else if (item.skill) parts.unshift(`${item.skill[1]} `);

  // Suffix
  if (item.obstacle) parts.push(item.obstacle);
  else if (item.isAgainstSkill) parts.push("Skill");
  else if (item.opposingSkill) parts.push(item.opposingSkill[1]);
  else if (item.opposingAbility) parts.push(item.opposingAbility[1]);

  // Suffix modifier
  if (item.opposingModifier) parts.push(` +${item.opposingModifier.toString()}D`);

  return `${item.opposingAction[1]}: ${parts.join("")}`;
}
