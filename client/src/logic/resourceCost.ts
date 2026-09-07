export interface SelectedCost {
  baseCost: number;
  modifiers: Record<string, {
    cost: number | `${string}/per`;
    selected: boolean;
  }>;
}

export function ResetCosts(resource: Resource): SelectedCost {
  const newCosts: SelectedCost = { baseCost: 0, modifiers: {} };

  newCosts.baseCost = resource.variableCost ? 0 : resource.costs[0][0];

  resource.modifiers.forEach(modifier => {
    newCosts.modifiers[modifier[2]] = { cost: modifier[1] ? `${modifier[0].toString()}/per` : modifier[0], selected: false };
  });

  return newCosts;
}

export function GetSelectedModifiers(costs: SelectedCost): [string, number | `${string}/per`][] {
  return Object.keys(costs.modifiers).filter(v => costs.modifiers[v].selected).map(v => [v, costs.modifiers[v].cost]);
}

export function GetTotalCost(costs: SelectedCost, modifiers: [string, number | `${string}/per`][], numberOfWeapons: number): number {
  let totalCost = costs.baseCost;

  for (const modifier of modifiers) {
    const modCost = modifier[1];
    if (typeof modCost === "number") totalCost += modCost;
    else totalCost += numberOfWeapons * parseInt(modCost.split("/")[0]);
  }

  return totalCost < 1 ? 1 : totalCost;
}
