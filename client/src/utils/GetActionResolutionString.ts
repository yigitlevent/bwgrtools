export function GetActionResolutionString<T>(item: ActionResolution<T>): string {
  const parts = [];

  if (item.type[1] === "Skill") parts.push("Skill");
  else {
    if (item.type[1] === "Ob") {
      if (item.obstacle !== undefined && item.obstacle !== null) parts.push("Ob ");
      else parts.push("Ob=");
    }
    else if (item.type[1] === "½") parts.push("½ ");
    else if (item.type[1] === "Vs") parts.push("Vs ");
    else if (item.type[1] === "+Vs") parts.push("+Vs ");
    else if (item.type[1] === "Vs+") parts.push("Vs+ ");
    else if (item.type[1] === "Std") parts.push("Std ");
  }

  // Prefix
  if (item.ability !== undefined) parts.unshift(`${item.ability[1]} `);
  else if (item.skill !== undefined) parts.unshift(`${item.skill[1]} `);

  // Suffix
  if (item.obstacle !== undefined && item.obstacle !== null) parts.push(item.obstacle);
  else if (item.isAgainstSkill === true) parts.push("Skill");
  else if (item.opposingSkill !== undefined) parts.push(item.opposingSkill[1]);
  else if (item.opposingAbility !== undefined) parts.push(item.opposingAbility[1]);

  // Suffix modifier
  if (item.opposingModifier !== undefined && item.opposingModifier !== null) parts.push(` +${item.opposingModifier.toString()}D`);

  return `${item.opposingAction[1]}: ${parts.join("")}`;
}
